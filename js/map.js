import { generateMapImage } from './map-renderer.js';

const MAP_SIZES = {
    regular: { width: 21, height: 33 },
    showdown: { width: 60, height: 60 },
    arena: { width: 59, height: 59 },
    siege: { width: 27, height: 39 },
    volley: { width: 21, height: 25 },
    basket: { width: 21, height: 17 }
};

function isSupabaseReady() {
    return !!(
        window.supabaseService &&
        (typeof window.supabaseService.isInitialized !== 'function' || window.supabaseService.isInitialized())
    );
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mapId = urlParams.get('id');
    const user = urlParams.get('user');

    if (!mapId) return showError('Map Not Found');

    document.getElementById('openMapBtn').onclick = () => {
            window.location.href = 'mapmaker.html?id=' + mapId + '&user=' + user;
        };
    // Determine auth state and adjust UI accordingly
    let currentUser = null;
    try { currentUser = await window.supabaseService.getCurrentUser(); } catch (e) { currentUser = null; }
    const renameBtn = document.getElementById('renameMapBtn');
    const duplicateBtn = document.getElementById('duplicateMapBtn');
    const deleteBtn = document.getElementById('deleteMapBtn');

    if (user && currentUser && user === currentUser.id) {
        document.getElementById('openMapBtn').textContent = 'Open in Map Maker';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        if (renameBtn) renameBtn.style.display = 'inline-block';
        if (duplicateBtn) duplicateBtn.style.display = 'inline-block';
    } else {
        // Hide controls for non-owners
        if (deleteBtn) deleteBtn.style.display = 'none';
        if (renameBtn) renameBtn.style.display = 'none';
        if (duplicateBtn) duplicateBtn.style.display = 'none';
    }

    document.getElementById('deleteMapBtn').onclick = async () => {
            if (await window.atlasConfirm({
                title: 'Delete map?',
                message: 'This will permanently delete this map from your account.',
                confirmLabel: 'Delete',
                variant: 'danger'
            })){
                try {
                    if (isSupabaseReady()) {
                        await window.supabaseService.deleteMap(mapId);
                    } else {
                        await window.atlasAlert({
                            title: 'Delete unavailable',
                            message: 'Delete is not supported in this environment.'
                        });
                        return;
                    }
                    window.location.href = 'index.html';
                } catch (e) {
                    console.error('Failed to delete map:', e);
                    await window.atlasAlert({
                        title: 'Delete failed',
                        message: 'Unable to delete map.',
                        variant: 'danger'
                    });
                }
            }
        };

    if (renameBtn) {
        renameBtn.addEventListener('click', async () => {
            const newName = await window.atlasPrompt({
                title: 'Rename map',
                message: 'Enter a new map name.',
                defaultValue: document.getElementById('mapTitle').textContent || '',
                confirmLabel: 'Rename',
                inputLabel: 'Map name'
            });
            if (!newName) return;
            try {
                if (!isSupabaseReady()) throw new Error('Supabase not initialized');
                await window.supabaseService.updateMapMeta(mapId, { name: newName });
                document.getElementById('mapTitle').textContent = newName;
            } catch (err) {
                console.error('Rename failed', err);
                await window.atlasAlert({
                    title: 'Rename failed',
                    message: 'The map could not be renamed.',
                    variant: 'danger'
                });
            }
        });
    }

    if (duplicateBtn) {
        duplicateBtn.addEventListener('click', async () => {
            const shouldDuplicate = await window.atlasConfirm({
                title: 'Duplicate map?',
                message: 'Create a copy of this map in your account?',
                confirmLabel: 'Duplicate'
            });
            if (!shouldDuplicate) return;
            try {
                if (!isSupabaseReady()) throw new Error('Supabase not initialized');
                // Create new map meta
                const meta = { name: (document.getElementById('mapTitle').textContent || 'Map') + ' (Copy)', width: 0, height: 0 };
                // Try to fetch meta to preserve size/gamemode/environment
                try {
                    const existingMeta = await window.supabaseService.fetchMapMeta(mapId);
                    if (existingMeta) {
                        meta.width = existingMeta.width || 21;
                        meta.height = existingMeta.height || 33;
                        meta.gamemode = existingMeta.gamemode;
                        meta.environment = existingMeta.environment;
                    }
                } catch (e) { /* ignore */ }

                const created = await window.supabaseService.createMap(meta);
                const newMapId = created.id;
                const tiles = await window.supabaseService.fetchMapTiles(mapId);
                const rows = (tiles || []).map(t => ({ x: t.x, y: t.y, layer: t.layer, tile_type: t.tile_type, variant: t.variant, rotation: t.rotation, data: t.data })).filter(r => !(window.supabaseService && window.supabaseService.isDefaultTile && window.supabaseService.isDefaultTile(r, r)));
                await window.supabaseService.batchUpsertTiles(newMapId, rows);
                // Navigate to the new map view
                window.location.href = 'map.html?id=' + newMapId + '&user=' + (currentUser ? currentUser.id : '');
            } catch (err) {
                console.error('Duplicate failed', err);
                await window.atlasAlert({
                    title: 'Duplicate failed',
                    message: 'The map could not be duplicated.',
                    variant: 'danger'
                });
            }
        });
    }

    // Show login/avatar based on Supabase auth state (avoid localStorage for identity)
    if (currentUser) {
        document.getElementById('loginBtn').style.display = 'none';
        const avatarElem = document.getElementById('avatar');
        if (avatarElem) {
            avatarElem.style.display = 'block';
            avatarElem.src = currentUser.user_metadata?.avatar_url || '';
        }
    } else {
        document.getElementById('loginBtn').style.display = 'block';
        const avatarElem = document.getElementById('avatar'); if (avatarElem) avatarElem.style.display = 'none';
    }

    // Prefer Supabase when available
    if (isSupabaseReady()) {
        try {
            const meta = await window.supabaseService.fetchMapMeta(mapId);
            if (!meta) return showError('Map Not Found');

            document.getElementById('mapTitle').textContent = meta.name || 'Untitled Map';

            // Author name: read from profiles table, prefer Discord username/tag if present
            let authorName = 'Unknown';
            try {
                const profile = await window.supabaseService.fetchProfileById(user);
                function resolveProfileName(profile, fallbackId) {
                    if (!profile) return fallbackId ? (String(fallbackId).slice(0, 8) + '...') : 'Unknown';
                    const discordCandidates = [
                        profile.discord_username,
                        profile.discord_tag,
                        profile.discord_name,
                        profile.discord?.username,
                        profile.discord?.tag,
                        profile.discord_id
                    ];
                    for (const d of discordCandidates) {
                        if (d) return d;
                    }
                    return (
                        profile.username ||
                        profile.full_name ||
                        profile.name ||
                        profile.display_name ||
                        profile.id ||
                        (fallbackId ? (String(fallbackId).slice(0, 8) + '...') : 'Unknown')
                    );
                }
                authorName = resolveProfileName(profile, user);
            } catch (e) {
                // ignore and keep Unknown (or fallback to shortened id)
                authorName = user ? (String(user).slice(0, 8) + '...') : 'Unknown';
            }
            const mapAuthorElement = document.getElementById('mapAuthor');
            mapAuthorElement.textContent = authorName;
            mapAuthorElement.style.cursor = 'pointer';
            mapAuthorElement.style.textDecoration = 'underline';
            mapAuthorElement.style.color = 'var(--primary-color, #007bff)';
            mapAuthorElement.addEventListener('click', () => {
                window.location.href = `map-gallery.html?creator=${user}`;
            });

            document.getElementById('mapGamemode').textContent = format(meta.gamemode);
            document.getElementById('mapEnvironment').textContent = format(meta.environment);

            // Fetch sparse tiles and reconstruct layered mapData
            const tiles = await window.supabaseService.fetchMapTiles(mapId);
            const width = meta.width || MAP_SIZES.regular.width;
            const height = meta.height || MAP_SIZES.regular.height;

            // Determine number of layers (at least 1, prefer 5 for compatibility)
            let maxLayer = 0;
            for (const t of tiles) if (typeof t.layer === 'number' && t.layer > maxLayer) maxLayer = t.layer;
            const layers = Math.max(5, maxLayer + 1);

            const layered = Array.from({ length: layers }, () => Array.from({ length: height }, () => Array(width).fill(0)));

            for (const t of tiles) {
                const layer = t.layer || 0;
                const x = t.x;
                const y = t.y;
                // prefer numeric id in data.tile_id, fallback to parse tile_type
                let tileId = 0;
                try { tileId = t.data && t.data.tile_id ? Number(t.data.tile_id) : 0; } catch(e) { tileId = 0; }
                if (!tileId) {
                    const parsed = parseInt(t.tile_type, 10);
                    tileId = isNaN(parsed) ? 0 : parsed;
                }
                if (typeof x === 'number' && typeof y === 'number') {
                    if (layer < layered.length && y >= 0 && y < height && x >= 0 && x < width) {
                        layered[layer][y][x] = tileId;
                    }
                }
            }

            function guessSizeLabel(w, h) {
                if (w === MAP_SIZES.showdown.width && h === MAP_SIZES.showdown.height) return 'showdown';
                if (w === MAP_SIZES.regular.width && h === MAP_SIZES.regular.height) return 'regular';
                if (w === MAP_SIZES.arena.width && h === MAP_SIZES.arena.height) return 'arena';
                if (w === MAP_SIZES.siege.width && h === MAP_SIZES.siege.height) return 'siege';
                if (w === MAP_SIZES.volley.width && h === MAP_SIZES.volley.height) return 'volley';
                if (w === MAP_SIZES.basket.width && h === MAP_SIZES.basket.height) return 'basket';
                return 'regular';
            }

            const sizeLabel = guessSizeLabel(width, height);

            const pngDataUrl = await generateMapImage(layered, sizeLabel, meta.gamemode, meta.environment);

            const mapImage = document.getElementById('mapImage');
            mapImage.src = pngDataUrl;
            mapImage.alt = 'Map Image';
            mapImage.style.display = 'block';
            mapImage.style.width = '40%';
            mapImage.style.height = 'auto';

            document.getElementById('downloadMapBtn').addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = `${meta.name || 'map'}.png`;
                link.href = mapImage.src;
                link.click();
            });
        } catch (err) {
            console.error('Error loading map (Supabase):', err);
            showError('Error Loading Map');
        }
    }


    function showError(msg) {
        document.getElementById('mapTitle').textContent = msg;
        ['mapInfo', 'mapDetails', 'mapCanvas', 'downloadMapBtn'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    }

    function format(str) {
        return str ? str.replace(/_/g, ' ') : 'Unknown';
    }
});

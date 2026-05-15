import {generateMapImage} from './map-renderer.js';

let allMaps = [];
let filteredMaps = [];
let displayedCount = 0;
let mapsPerPage = 16;
let username = '';
let userId = '';

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

function guessSizeLabel(width, height) {
    for (const [label, size] of Object.entries(MAP_SIZES)) {
        if (size.width === width && size.height === height) return label;
    }
    return 'regular';
}

async function postMapsByUser() {
    if (!isSupabaseReady()) {
        console.warn('Supabase not configured; cannot load user maps.');
        return;
    }
    // Resolve current authenticated user using Supabase Auth
    // Primary: use the `supabase` client if available. Fallback to window.supabaseService helpers.
    let currentUser = null;
    try {
        if (typeof supabase !== 'undefined' && supabase && supabase.auth && supabase.auth.getUser) {
            const { data: { user } = {} } = await supabase.auth.getUser();
            currentUser = user || null;
        } else if (window.supabaseService && window.supabaseService.getAuthUserNow) {
            const res = await window.supabaseService.getAuthUserNow();
            currentUser = res && res.data && res.data.user ? res.data.user : null;
        } else if (window.supabaseService && window.supabaseService.getCurrentUser) {
            currentUser = await window.supabaseService.getCurrentUser();
        }
    } catch (e) { currentUser = null; }
    userId = currentUser ? currentUser.id : null;
    if (!userId) {
        console.warn('No authenticated user; skipping map load');
        return;
    }
    if (isSupabaseReady()) {
        try {
            const rows = await window.supabaseService.fetchMapsByUser();
            if (!rows) return;

            // For each map, fetch tiles and reconstruct layered mapData (best-effort)
            const maps = [];
            for (const row of rows) {
                const map = {
                    mapId: row.id,
                    name: row.name,
                    gamemode: row.gamemode,
                    environment: row.environment,
                    width: row.width,
                    height: row.height,
                    size: guessSizeLabel(row.width, row.height),
                    mapData: null
                };
                try {
                    const tiles = await window.supabaseService.fetchMapTiles(map.mapId);
                    const width = map.width || 21;
                    const height = map.height || 33;
                    let maxLayer = 0;
                    for (const t of tiles) if (typeof t.layer === 'number' && t.layer > maxLayer) maxLayer = t.layer;
                    const layers = Math.max(5, maxLayer + 1);
                    const layered = Array.from({ length: layers }, () => Array.from({ length: height }, () => Array(width).fill('.')));
                    for (const t of tiles) {
                        const layer = t.layer || 0;
                        const x = t.x;
                        const y = t.y;
                        const tileId = t.data && t.data.tile_id ? String(t.data.tile_id) : '.';
                        if (typeof x === 'number' && typeof y === 'number') {
                            if (layer < layered.length && y >= 0 && y < height && x >= 0 && x < width) {
                                layered[layer][y][x] = tileId;
                            }
                        }
                    }
                    map.mapData = layered;
                } catch (e) {
                    console.warn('Failed to fetch tiles for map', map.mapId, e);
                }
                maps.push(map);
            }

            // Attempt to fetch username from profiles table
            try {
                        const profile = await window.supabaseService.fetchProfileById(userId);
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
                        username = resolveProfileName(profile, userId);
            } catch (e) {
                        username = userId ? (String(userId).slice(0, 8) + '...') : 'Unknown';
            }

                    allMaps = maps.sort((a, b) => 0); // keep DB order
                    applyFilters();
                    return;
                } catch (e) {
                    console.error('Supabase fetch failed', e);
                    return; // stop - no fallback in this migration
                }
            } else {
                console.warn('Supabase not configured; cannot load user maps.');
                return;
            }
}

function applyFilters() {
    const searchTerm = document.getElementById('mapSearch')?.value.toLowerCase();
    const gamemodeFilter = document.getElementById('gamemodeFilter')?.value;
    const environmentFilter = document.getElementById('environmentFilter')?.value;
    const sizeFilter = document.getElementById('sizeFilter')?.value;
    const tileFilter = document.getElementById('tileFilter')?.value.toLowerCase();

    filteredMaps = allMaps.filter(map => {
        // Search filter
        if (searchTerm !== '' && !(map.name).toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Gamemode filter
        if (gamemodeFilter && map.gamemode !== gamemodeFilter) {
            return false;
        }

        // Environment filter
        if (environmentFilter && map.environment !== environmentFilter) {
            return false;
        }

        // Size filter
        if (sizeFilter && map.size !== sizeFilter) {
            return false;
        }

        // Tile filter - check if map contains the specified tile
        if (tileFilter) {
            const tileIdMap = {
                wall: ['M', 'X'],
                bush: ['F'],
                water: ['W'],
                jumpads: ['H', 'G', 'K', 'L', 'P', 'Z', 'O', 'U'],
                tnt: ['tnt'],
                unbreakable: ['I'],
                teleporters: ['c', 'd', 'e', 'f'],
                rope: ['a'],
                spikes: ['v'],
                speedtile: ['w'],
                slowtile: ['z'],
                smoke: ['x'],
                healpad: ['y'],
                bumpers: ['o'],
                icetile: ['ice-tile'],
                snowtile: ['snow-tile'],
                rails: ['rails']
            };
            const targetTileIds = tileIdMap[tileFilter];
            if (targetTileIds) {
                let found = false;
                if (map.mapData) {
                    for (let layer = 0; layer < map.mapData.length; layer++) {
                        if (!map.mapData[layer]) continue;
                        for (let y = 0; y < map.mapData[layer].length; y++) {
                            if (!map.mapData[layer][y]) continue;
                            for (let x = 0; x < map.mapData[layer][y].length; x++) {
                                if (targetTileIds.includes(map.mapData[layer][y][x])) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found) break;
                        }
                        if (found) break;
                    }
                }
                if (!found) return false;
            }
        }

        return true;
    });

    displayedCount = 0;
    displayMaps();
}

function displayMaps() {
    const container = document.getElementById('mapsGrid');
    if (!container) return;

    // Clear container if we're starting from the beginning (filter changed)
    if (displayedCount === 0) {
        container.innerHTML = '';
    } else {
        // Remove load more button if it exists (so we can re-add it at the end)
        const existingLoadMore = document.getElementById('loadMoreBtn');
        if (existingLoadMore) {
            existingLoadMore.remove();
        }
    }

    // Calculate how many maps to display
    const mapsToDisplay = Math.min(mapsPerPage, filteredMaps.length - displayedCount);
    
    for (let i = displayedCount; i < displayedCount + mapsToDisplay; i++) {
        const map = filteredMaps[i];
        if (!map) break;

        try {
            generateMapImage(
                map.mapData,
                map.size,
                map.gamemode,
                map.environment
            ).then(pngDataUrl => {
                const mapName = map.name || 'unnamed';
                const elems = createCard(mapName, username, pngDataUrl);
                const card = elems.card;

                // Make the whole card clickable: open map view page which contains all actions
                card.addEventListener('click', () => {
                    window.location.href = 'map.html?id=' + map.mapId + '&user=' + userId;
                });

                container.appendChild(card);
            }).catch(error => {
                console.error(`Error generating image for map ${map.mapId}:`, error);
                const elems = createCard(map.name || 'unnamed', username, 'Resources/Additional/Icons/UserPfp.png');
                const card = elems.card;
                // Make error card clickable to view map page
                card.addEventListener('click', () => {
                    window.location.href = 'map.html?id=' + map.mapId + '&user=' + userId;
                });
                card.classList.add('error-card');
                container.appendChild(card);
            });
        } catch (error) {
            console.error(`Error for map ${map.mapId}:`, error);
            const elems = createCard(map.name || 'unnamed', username, 'Resources/Additional/Icons/UserPfp.png');
            const card = elems.card;
            card.classList.add('error-card');
            card.addEventListener('click', () => {
                window.location.href = 'map.html?id=' + map.mapId + '&user=' + userId;
            });
            container.appendChild(card);
        }
    }

    displayedCount += mapsToDisplay;

    // Add load more button if there are more maps to display
    if (displayedCount < filteredMaps.length) {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            loadMoreContainer.innerHTML = '';
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.id = 'loadMoreBtn';
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.classList.add('load-more-btn');
            loadMoreBtn.addEventListener('click', () => {
                displayMaps();
            });
            loadMoreContainer.appendChild(loadMoreBtn);
        }
    } else {
        // Clear the container if no more maps
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            loadMoreContainer.innerHTML = '';
        }
    }
}


function createCard(name, user, image) {
    const card = document.createElement('div');
    card.classList.add('card');

    const mapImage = document.createElement('img');
    mapImage.src = image;
    mapImage.alt = 'Map image';
    mapImage.classList.add('card-map-image');

    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('card-map-name');
    detailsDiv.textContent = name;

    const mapCreatorName = document.createElement('h2');
    mapCreatorName.classList.add('card-map-creator');
    mapCreatorName.textContent = user;

    detailsDiv.appendChild(mapCreatorName);

    card.appendChild(mapImage);
    card.appendChild(detailsDiv);

    // Return only the card. Actions moved to the dedicated map view page.
    return { card };
}

window.addEventListener('load', async () => {
    // Set up filter event listeners
    const searchInput = document.getElementById('mapSearch');
    const gamemodeFilter = document.getElementById('gamemodeFilter');
    const environmentFilter = document.getElementById('environmentFilter');
    const sizeFilter = document.getElementById('sizeFilter');
    const tileFilter = document.getElementById('tileFilter');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyFilters();
        });
    }
    if (gamemodeFilter) {
        gamemodeFilter.addEventListener('change', () => {
            applyFilters();
        });
    }
    if (environmentFilter) {
        environmentFilter.addEventListener('change', () => {
            applyFilters();
        });
    }
    if (sizeFilter) {
        sizeFilter.addEventListener('change', () => {
            applyFilters();
        });
    }
    if (tileFilter) {
        tileFilter.addEventListener('change', () => {
            applyFilters();
        });
    }
    
    // Then try to load real data if a Supabase client is available
    if (isSupabaseReady()) {
        try {
            let cur = null;
            if (typeof supabase !== 'undefined' && supabase && supabase.auth && supabase.auth.getUser) {
                const { data: { user } = {} } = await supabase.auth.getUser();
                cur = user || null;
            } else if (window.supabaseService && window.supabaseService.getAuthUserNow) {
                const res = await window.supabaseService.getAuthUserNow();
                cur = res && res.data && res.data.user ? res.data.user : null;
            } else if (window.supabaseService && window.supabaseService.getCurrentUser) {
                cur = await window.supabaseService.getCurrentUser();
            }

            if (cur && cur.id) {
                await postMapsByUser();
            } else {
                console.log('No authenticated user, skipping map fetch');
            }
        } catch (e) {
            console.warn('Failed to determine auth state, skipping map fetch', e);
        }
    } else {
        console.warn('No database client available, only test data will be shown');
    }
});

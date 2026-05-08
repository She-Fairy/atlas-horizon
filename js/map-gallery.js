import {generateMapImage} from './map-renderer.js';

let allUsersMaps = {}; // {userId: [{mapId, ...mapData}, ...]}
let filteredMaps = [];
let displayedCount = 0;
let mapsPerPage = 16;
let currentUserIndex = 0; // For tracking which users we've shown
let currentMapIndex = {}; // {userId: index} - tracks which map index we're on for each user
let allUserIds = []; // List of all user IDs
let displayedUsers = new Set(); // Track which users we've already displayed

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

async function loadAllMaps() {
    try {
        if (isSupabaseReady()) {
            // Fetch all maps from Supabase
            const rows = await window.supabaseService.listMaps();
            if (!rows || !rows.length) return;

            // Group rows by user_id
            for (const row of rows) {
                const userId = row.user_id;
                if (!allUsersMaps[userId]) allUsersMaps[userId] = [];
                // Build minimal map object; tiles (mapData) will be fetched when generating previews
                allUsersMaps[userId].push({
                    mapId: row.id,
                    userId,
                    username: null, // filled below from profiles
                    name: row.name,
                    width: row.width,
                    height: row.height,
                    gamemode: row.gamemode,
                    environment: row.environment,
                    size: guessSizeLabel(row.width, row.height),
                    mapData: null
                });
            }

            // Helper: resolve a usable display name from a profile row (many possible schemas)
            function resolveProfileName(profile, fallbackId) {
                if (!profile) return fallbackId ? (String(fallbackId).slice(0, 8) + '...') : 'Unknown';
                // Prefer Discord-related fields if present
                const discordCandidates = [
                    profile.discord_username,
                    profile.discord_tag,
                    profile.discord_name,
                    profile.discord?.username,
                    profile.discord?.tag,
                    profile.discord_id // sometimes stored as a combined string
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

            // Fetch usernames from profiles table (best-effort)
            for (const userId of Object.keys(allUsersMaps)) {
                let username = 'Unknown';
                try {
                    const profile = await window.supabaseService.fetchProfileById(userId);
                    username = resolveProfileName(profile, userId);
                } catch (e) {
                    username = resolveProfileName(null, userId);
                }
                allUsersMaps[userId].forEach(m => m.username = username);
            }

            // Pre-fetch tiles for each map up to an initial cap (to limit network)
            const cap = 100; // protect from fetching extremely large numbers
            let fetched = 0;
            for (const userId of Object.keys(allUsersMaps)) {
                for (const map of allUsersMaps[userId]) {
                    if (fetched >= cap) break;
                    try {
                        const tiles = await window.supabaseService.fetchMapTiles(map.mapId);
                        // reconstruct layered mapData
                        const width = map.width || 21;
                        const height = map.height || 33;
                        let maxLayer = 0;
                        for (const t of tiles) if (typeof t.layer === 'number' && t.layer > maxLayer) maxLayer = t.layer;
                        const layers = Math.max(5, maxLayer + 1);
                        const layered = Array.from({ length: layers }, () => Array.from({ length: height }, () => Array(width).fill(0)));
                        for (const t of tiles) {
                            const layer = t.layer || 0;
                            const x = t.x;
                            const y = t.y;
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
                        map.mapData = layered;
                        map.size = guessSizeLabel(map.width, map.height);
                    } catch (e) {
                        console.warn('Failed to fetch tiles for map', map.mapId, e);
                    }
                    fetched++;
                }
                if (fetched >= cap) break;
            }

            // Sort maps per user by created_at or id if available
            for (const userId of Object.keys(allUsersMaps)) {
                allUsersMaps[userId].sort((a, b) => {
                    // attempt to compare by created_at if present on row
                    return 0; // keep DB order for now
                });
                currentMapIndex[userId] = 0;
            }

            applyFilters();
            return;
        }
    } catch (error) {
        console.error('Error loading maps:', error);
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('mapSearch')?.value.toLowerCase() || '';
    const gamemodeFilter = document.getElementById('gamemodeFilter')?.value || '';
    const environmentFilter = document.getElementById('environmentFilter')?.value || '';
    const sizeFilter = document.getElementById('sizeFilter')?.value || '';
    const tileFilter = document.getElementById('tileFilter')?.value || '';
    const urlParams = new URLSearchParams(window.location.search);
    const creatorFilter = urlParams.get('creator'); // Filter by specific creator if in URL

    // Build filtered maps list
    filteredMaps = [];
    
    for (const userId in allUsersMaps) {
        // If creator filter is set, only include maps from that creator
        if (creatorFilter && userId !== creatorFilter) continue;
        
        const userMaps = allUsersMaps[userId];
        for (const map of userMaps) {
            // Search filter
            if (searchTerm && !(map.name || 'unnamed').toLowerCase().includes(searchTerm)) {
                continue;
            }

            // Gamemode filter
            if (gamemodeFilter && map.gamemode !== gamemodeFilter) {
                continue;
            }

            // Environment filter
            if (environmentFilter && map.environment !== environmentFilter) {
                continue;
            }

            // Size filter
            if (sizeFilter && map.size !== sizeFilter) {
                continue;
            }

            // Tile filter - check if map contains the specified tile
            if (tileFilter) {
                const tileIdMap = {
                    'wall': 1,
                    'bush': 2,
                    'water': 10,
                    'rope': 9,
                    'crate': 4
                };
                const targetTileId = tileIdMap[tileFilter];
                if (targetTileId) {
                    let found = false;
                    if (map.mapData) {
                        for (let layer = 0; layer < map.mapData.length; layer++) {
                            if (!map.mapData[layer]) continue;
                            for (let y = 0; y < map.mapData[layer].length; y++) {
                                if (!map.mapData[layer][y]) continue;
                                for (let x = 0; x < map.mapData[layer][y].length; x++) {
                                    if (map.mapData[layer][y][x] === targetTileId) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (found) break;
                            }
                            if (found) break;
                        }
                    }
                    if (!found) continue;
                }
            }

            filteredMaps.push(map);
        }
    }

    // Group filtered maps by user
    const mapsByUser = {};
    for (const map of filteredMaps) {
        if (!mapsByUser[map.userId]) {
            mapsByUser[map.userId] = [];
        }
        mapsByUser[map.userId].push(map);
    }

    // Sort maps within each user by mapId (most recent first)
    for (const userId in mapsByUser) {
        mapsByUser[userId].sort((a, b) => Number(b.mapId) - Number(a.mapId));
    }

    // Reset display state
    displayedCount = 0;
    currentUserIndex = 0;
    currentMapIndex = {};
    displayedUsers.clear();
    for (const userId in mapsByUser) {
        currentMapIndex[userId] = 0;
    }

    displayMaps(mapsByUser);
}

function displayMaps(mapsByUser) {
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

    const userIds = Object.keys(mapsByUser);
    let mapsToDisplay = [];
    let usersAdded = 0;

    // Strategy: Get most recent map from users we haven't shown yet
    // If we've shown all users, get next most recent from each
    while (usersAdded < mapsPerPage && mapsToDisplay.length < mapsPerPage) {
        // Find users we haven't displayed yet
        const remainingUsers = userIds.filter(userId => !displayedUsers.has(userId));
        
        if (remainingUsers.length > 0) {
            // Randomly select from remaining users
            const randomIndex = Math.floor(Math.random() * remainingUsers.length);
            const selectedUserId = remainingUsers[randomIndex];
            const userMaps = mapsByUser[selectedUserId];
            const mapIndex = currentMapIndex[selectedUserId] || 0;
            
            if (mapIndex < userMaps.length) {
                mapsToDisplay.push(userMaps[mapIndex]);
                currentMapIndex[selectedUserId] = mapIndex + 1;
                displayedUsers.add(selectedUserId);
                usersAdded++;
            } else {
                // This user has no more maps, mark as displayed
                displayedUsers.add(selectedUserId);
            }
        } else {
            // All users have been shown, get next map from each user
            let foundAny = false;
            for (const userId of userIds) {
                const userMaps = mapsByUser[userId];
                const mapIndex = currentMapIndex[userId] || 0;
                
                if (mapIndex < userMaps.length && mapsToDisplay.length < mapsPerPage) {
                    mapsToDisplay.push(userMaps[mapIndex]);
                    currentMapIndex[userId] = mapIndex + 1;
                    foundAny = true;
                }
            }
            
            if (!foundAny) {
                // No more maps to display
                break;
            }
        }
    }

    // Display the maps
    for (const map of mapsToDisplay) {
        const username = map.username || 'Unknown';
        const userId = map.userId;
        try {
            generateMapImage(
                map.mapData,
                map.size,
                map.gamemode,
                map.environment
            ).then(pngDataUrl => {
                const mapName = map.name || 'unnamed';
                const card = createCard(mapName, username, pngDataUrl);
                card.addEventListener('click', () => {
                    window.location.href = 'map.html?id=' + map.mapId + '&user=' + map.userId;
                });
                container.appendChild(card);
            }).catch(error => {
                console.error(`Error generating image for map ${map.mapId}:`, error);
                const card = createCard(map.name || 'unnamed', username, 'Resources/Additional/Icons/UserPfp.png');
                card.classList.add('error-card');
                card.addEventListener('click', () => {
                    window.location.href = 'map.html?id=' + map.mapId + '&user=' + map.userId;
                });
                container.appendChild(card);
            });
        } catch (error) {
            console.error(`Error for map ${map.mapId}:`, error);
            const card = createCard(map.name || 'unnamed', username, 'Resources/Additional/Icons/UserPfp.png');
            card.classList.add('error-card');
            card.addEventListener('click', () => {
                window.location.href = 'map.html?id=' + map.mapId + '&user=' + map.userId;
            });
            container.appendChild(card);
        }
    }

    displayedCount += mapsToDisplay.length;

    // Check if there are more maps to display
    let hasMore = false;
    for (const userId in mapsByUser) {
        const userMaps = mapsByUser[userId];
        const mapIndex = currentMapIndex[userId] || 0;
        if (mapIndex < userMaps.length) {
            hasMore = true;
            break;
        }
    }

    // Add load more button if there are more maps to display
    if (hasMore) {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            loadMoreContainer.innerHTML = '';
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.id = 'loadMoreBtn';
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.classList.add('load-more-btn');
            loadMoreBtn.addEventListener('click', () => {
                displayMaps(mapsByUser);
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

    return card;
}

window.addEventListener('load', () => {
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
    
    // Load maps from all users
    if (isSupabaseReady()) {
        loadAllMaps();
    } else {
        console.warn('No database client available');
    }
});

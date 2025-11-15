import {generateMapImage} from './map-renderer.js';

let allUsersMaps = {}; // {userId: [{mapId, ...mapData}, ...]}
let filteredMaps = [];
let displayedCount = 0;
let mapsPerPage = 16;
let currentUserIndex = 0; // For tracking which users we've shown
let currentMapIndex = {}; // {userId: index} - tracks which map index we're on for each user
let allUserIds = []; // List of all user IDs
let displayedUsers = new Set(); // Track which users we've already displayed

async function loadAllMaps() {
    try {
        // Get all users
        const users = await Firebase.readDataOnce('users');
        if (!users) return;

        allUserIds = Object.keys(users);
        
        // Load maps for each user
        const mapPromises = allUserIds.map(async (userId) => {
            const [maps, username] = await Promise.all([
                Firebase.readDataOnce(`users/${userId}/maps`),
                Firebase.readDataOnce(`users/${userId}/username`)
            ]);
            if (!maps) return { userId, maps: [], username: username || 'Unknown' };
            
            // Convert to array and sort by mapId (timestamp) descending
            const mapsArray = Object.keys(maps).map(mapId => ({
                mapId,
                userId,
                username: username || 'Unknown',
                ...maps[mapId]
            })).sort((a, b) => Number(b.mapId) - Number(a.mapId));
            
            return { userId, maps: mapsArray, username: username || 'Unknown' };
        });

        const results = await Promise.all(mapPromises);
        
        // Store maps by user
        for (const result of results) {
            if (result.maps.length > 0) {
                allUsersMaps[result.userId] = result.maps;
                currentMapIndex[result.userId] = 0; // Start with most recent (index 0)
            }
        }

        // Apply filters and display
        applyFilters();
    } catch (error) {
        console.error('Error loading maps:', error);
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('mapSearch')?.value.toLowerCase() || '';
    const gamemodeFilter = document.getElementById('gamemodeFilter')?.value || '';
    const environmentFilter = document.getElementById('environmentFilter')?.value || '';
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
            if (gamemodeFilter && gamemodeFilter !== '' && map.gamemode !== gamemodeFilter) {
                continue;
            }

            // Environment filter
            if (environmentFilter && environmentFilter !== '' && map.environment !== environmentFilter) {
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
        // Remove load more button if it exists
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
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'loadMoreBtn';
        loadMoreBtn.textContent = 'Load More';
        loadMoreBtn.classList.add('load-more-btn');
        loadMoreBtn.addEventListener('click', () => {
            displayMaps(mapsByUser);
        });
        container.appendChild(loadMoreBtn);
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
    if (tileFilter) {
        tileFilter.addEventListener('change', () => {
            applyFilters();
        });
    }
    
    // Load maps from all users
    if (typeof Firebase !== 'undefined') {
        loadAllMaps();
    } else {
        console.warn('Firebase not available');
    }
});

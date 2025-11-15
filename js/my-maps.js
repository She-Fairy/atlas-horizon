import {generateMapImage} from './map-renderer.js';

let allMaps = [];
let filteredMaps = [];
let displayedCount = 0;
let mapsPerPage = 16;
let username = '';
let userId = '';

async function postMapsByUser(user = localStorage.getItem('user')) {
    userId = user;
    const maps = await Firebase.readDataOnce(`users/${user}/maps`);
    if (!maps) return;

    username = await Firebase.readDataOnce(`users/${user}/username`);

    // Convert maps object to array with mapId
    allMaps = Object.keys(maps).map(mapId => ({
        mapId,
        ...maps[mapId]
    })).sort((a, b) => Number(b.mapId) - Number(a.mapId)); // descending order

    // Apply filters and display
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('mapSearch')?.value.toLowerCase();
    const gamemodeFilter = document.getElementById('gamemodeFilter')?.value;
    const environmentFilter = document.getElementById('environmentFilter')?.value;
    const tileFilter = document.getElementById('tileFilter')?.value.toLowerCase();

    filteredMaps = allMaps.filter(map => {
        // Search filter
        if (searchTerm !== '' && !(map.name).toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Gamemode filter
        if (gamemodeFilter !== 'All Gamemodes' && map.gamemode !== gamemodeFilter) {
            return false;
        }

        // Environment filter
        if (environmentFilter !== 'All Environments' && map.environment !== environmentFilter) {
            return false;
        }

        // Tile filter - check if map contains the specified tile
        if (tileFilter) {
            const tileIdMap = {
                'filter by tile': null,
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
        // Remove load more button if it exists
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
                const card = createCard(mapName, username, pngDataUrl);
                card.addEventListener('click', () => {
                    window.location.href = 'map.html?id=' + map.mapId + '&user=' + userId;
                });
                container.appendChild(card);
            }).catch(error => {
                console.error(`Error generating image for map ${map.mapId}:`, error);
                const card = createCard(map.name || 'unnamed', username, 'Resources/Additional/Icons/UserPfp.png');
                card.classList.add('error-card');
                card.addEventListener('click', () => {
                    window.location.href = 'map.html?id=' + map.mapId + '&user=' + userId;
                });
                container.appendChild(card);
            });
        } catch (error) {
            console.error(`Error for map ${map.mapId}:`, error);
            const card = createCard(map.name || 'unnamed', username, 'Resources/Additional/Icons/UserPfp.png');
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
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'loadMoreBtn';
        loadMoreBtn.textContent = 'Load More';
        loadMoreBtn.classList.add('load-more-btn');
        loadMoreBtn.addEventListener('click', () => {
            displayMaps();
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
    
    // Then try to load real data if Firebase is available
    if (typeof Firebase !== 'undefined') {
        if (localStorage.getItem('user') !== null) {
            postMapsByUser(localStorage.getItem('user'));
        } else {
            console.log('No user found in local storage, skipping Firebase data fetch');
        }
    } else {
        console.warn('Firebase not available, only test data will be shown');
    }
});
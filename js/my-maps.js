import {generateMapImage} from './map-renderer.js';

async function postMapsByUser(user = localStorage.getItem('user')) {
    console.log('Attempting to fetch maps for user:', user);
    
    try {
        const maps = await Firebase.readDataOnce(`users/${user}/maps`);
        console.log('Maps data received:', maps);
        
        // Make sure maps is an object
        if (!maps) {
            console.log('No maps found for user');
            return;
        }

    const container = document.getElementById('mapsGrid');
    container.innerHTML = ''; // clear existing content if any

    // Process each map one by one
    for (const mapId in maps) {
        console.log('Processing map ID:', mapId);
        console.log('Processing map Name:', maps[mapId].name);
        if (maps.hasOwnProperty(mapId)) {
            const mapData = maps[mapId];

            try {
                // Create PNG data URL - now using await since it's async
                const pngDataUrl = await generateMapImage(
                    mapData.mapData, 
                    mapData.size, 
                    mapData.gamemode, 
                    mapData.environment
                );  
                
                let mapName = mapData.name || 'unnamed';

                const card = createCard(mapName, (await Firebase.readDataOnce(`users/${user}/username`)), pngDataUrl);
                card.addEventListener('click', () => {
                    window.location.href = 'map.html?id=' + mapId + '&user=' + user;

                });
                container.appendChild(card);
            } catch (error) {
                alert(`❌ Error for map ${mapId}: ${error.message}`);
                // Create a card with error placeholder
                const card = createCard(mapData.name, mapData.user, 'Resources/Additional/Icons/UserPfp.png');
                card.classList.add('error-card');
                card.addEventListener('click', () => {
                    window.location.href = 'map.html?id=' + mapId + '&user=' + user;
                });
                container.appendChild(card);
            }
        }
    }
    } catch (error) {
        console.error('Error in postMapsByUser:', error);
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

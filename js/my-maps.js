import {generateMapImage} from './map-renderer.js';

function timestampFromMapId(mapId) {
  // Take the first 4 chars and parse base36 to number
  return parseInt(mapId.slice(0, 4), 36);
}

async function postMapsByUser(user = localStorage.getItem('user')) {
    const maps = await Firebase.readDataOnce(`users/${user}/maps`);
    if (!maps) return;

    const container = document.getElementById('mapsGrid');
    container.innerHTML = '';

    // Get mapIds and sort by extracted timestamp (early to late)
    const sortedMapIds = Object.keys(maps).sort((a, b) => {
    return timestampFromMapId(a) - timestampFromMapId(b);
    });

    const username = await Firebase.readDataOnce(`users/${user}/username`);

    for (const mapId of sortedMapIds) {
    const mapData = maps[mapId];
    try {
        const pngDataUrl = await generateMapImage(
        mapData.mapData,
        mapData.size,
        mapData.gamemode,
        mapData.environment
        );
        const mapName = mapData.name || 'unnamed';
        const card = createCard(mapName, username, pngDataUrl);
        card.addEventListener('click', () => {
        window.location.href = 'map.html?id=' + mapId + '&user=' + user;
        });
        container.appendChild(card);
    } catch (error) {
        alert(`❌ Error for map ${mapId}: ${error.message}`);
        const card = createCard(mapData.name, mapData.user, 'Resources/Additional/Icons/UserPfp.png');
        card.classList.add('error-card');
        card.addEventListener('click', () => {
        window.location.href = 'map.html?id=' + mapId + '&user=' + user;
        });
        container.appendChild(card);
    }
    }   
    alert(`✅ Successfully loaded ${mapCount} maps for user: ${user}`);
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
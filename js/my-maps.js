import {generateMapImage} from './map-renderer.js';

async function postMapsByUser(user = localStorage.getItem('user')) {
    const maps = await Firebase.readDataOnce(`users/${user}/maps`);
    if (!maps) return;

    const username = await Firebase.readDataOnce(`users/${user}/username`);

    const container = document.getElementById('mapsGrid');
    container.innerHTML = '';

    // Get mapIds and sort by extracted timestamp (early to late)
    const sortedMapIds = Object.keys(maps).sort((a, b) => {
        return Number(b) - Number(a); // descending order (largest first)
    });

    for (const mapId of sortedMapIds) {
        const mapData = maps[mapId];
        if (!mapData) {
            console.warn(`Skipping mapId ${mapId}: no mapData`);
            continue;
        }
        try {
            // your existing processing here
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
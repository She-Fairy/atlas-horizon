import {generateMapImage} from './map-renderer.js';

async function postMapsByUser(user = localStorage.getItem('user')) {
    alert('Attempting to fetch maps for user: ' + user);
    
    try {
        const maps = await Firebase.readDataOnce(`users/${user}/maps`);
        const mapsToAlert = {};

    for (const mapId in maps) {
        if (maps.hasOwnProperty(mapId)) {
            const { mapData, ...rest } = maps[mapId]; // exclude mapData
            mapsToAlert[mapId] = rest;
        }
    }

splitAndAlert('Maps data received: ' + JSON.stringify(mapsToAlert, null, 2));


        if (!maps) {
            alert('No maps found for user');
            return;
        }

        const container = document.getElementById('mapsGrid');
        container.innerHTML = '';

        for (const mapId in maps) {
            console.log('Processing map ID: ' + mapId);
            console.log('Processing map Name: ' + maps[mapId].name);
            if (maps.hasOwnProperty(mapId)) {
                const mapData = maps[mapId];

                try {
                    const pngDataUrl = await generateMapImage(
                        mapData.mapData, 
                        mapData.size, 
                        mapData.gamemode, 
                        mapData.environment
                    );  
                    
                    let mapName = mapData.name || 'unnamed';
                    const username = await Firebase.readDataOnce(`users/${user}/username`);
                    const card = createCard(mapName, username, pngDataUrl);

                    card.addEventListener('click', () => {
                        window.location.href = 'map.html?id=' + mapId + '&user=' + user;
                    });

                    container.appendChild(card);
                } catch (error) {
                    alert(`Error creating PNG for map ${mapId}: ${error}`);
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
        alert('Error in postMapsByUser: ' + error);
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
    if (typeof Firebase !== 'undefined') {
        if (localStorage.getItem('user') !== null) {
            postMapsByUser(localStorage.getItem('user'));
        } else {
            alert('No user found in local storage, skipping Firebase data fetch');
        }
    } else {
        alert('Firebase not available, only test data will be shown');
    }
});

function splitAndAlert(message, chunkSize = 1000) {
    for (let i = 0; i < message.length; i += chunkSize) {
        alert(message.slice(i, i + chunkSize));
    }
}

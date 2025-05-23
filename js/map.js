import { generateMapImage } from './map-renderer.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mapId = urlParams.get('id');
    const user = urlParams.get('user');

    if (!mapId) return showError('Map Not Found');

    console.log('from URL:', user, typeof user);
    console.log('from storage:', localStorage.getItem('user'), typeof localStorage.getItem('user'));
    console.log('equal:', user === localStorage.getItem('user'));

    if (user === localStorage.getItem('user')) {
        document.getElementById('openMapBtn').textContent = 'Open in Map Maker';
        document.getElementById('openMapBtn').onclick = () => {
            window.location.href = window.location.replace('map.html', 'mapmaker.html');
        };
    }

    if (localStorage.getItem('user') !== null) {
        // User is logged in
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('avatar').style.display = 'block';
        document.getElementById('avatar').src = localStorage.getItem('avatar');
    } else {
        // User is not logged in
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('avatar').style.display = 'none';
    }

    Firebase.readDataOnce(`users/${user}/maps/${mapId}`).then(async (mapData) => {
        if (!mapData) return showError('Map Not Found');

        document.getElementById('mapTitle').textContent = mapData.name || 'Untitled Map';
        document.getElementById('mapAuthor').textContent = await Firebase.readDataOnce(`users/${user}/username`) || 'Unknown';
        document.getElementById('mapGamemode').textContent = format(mapData.gamemode);
        document.getElementById('mapEnvironment').textContent = format(mapData.environment);

        // Render actual map image using real tiles
        const pngDataUrl = await generateMapImage(
                    mapData.mapData, 
                    mapData.size, 
                    mapData.gamemode, 
                    mapData.environment
                );  
        
        const mapImage = document.getElementById('mapImage');
        mapImage.src = pngDataUrl;
        mapImage.alt = 'Map Image';
        mapImage.style.display = 'block';
        mapImage.style.width = '40%';
        mapImage.style.height = 'auto';

        document.getElementById('downloadMapBtn').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = `${mapData.name || 'map'}.png`;
            link.href = mapImage.src;
            link.click();
        });
    }).catch((err) => {
        console.error('Error loading map:', err);
        showError('Error Loading Map');
    });


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

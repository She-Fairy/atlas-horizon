class MapMaker {
    constructor() {
        this.canvas = document.getElementById('mapCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        this.mapWidth = 25;
        this.mapHeight = 25;
        this.selectedTile = null;
        this.map = Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));
        
        this.initializeCanvas();
        this.initializeTileSelector();
        this.setupEventListeners();
    }

    initializeCanvas() {
        this.canvas.width = this.mapWidth * this.tileSize;
        this.canvas.height = this.mapHeight * this.tileSize;
        this.drawGrid();
    }

    initializeTileSelector() {
        const tileSelector = document.getElementById('tileSelector');
        const tiles = [
            { id: 1, name: 'Wall', color: '#666666' },
            { id: 2, name: 'Bush', color: '#90EE90' },
            { id: 3, name: 'Water', color: '#87CEEB' },
            { id: 4, name: 'Spawn', color: '#FFD700' }
        ];

        tiles.forEach(tile => {
            const tileElement = document.createElement('div');
            tileElement.className = 'tile-option';
            tileElement.style.backgroundColor = tile.color;
            tileElement.setAttribute('data-tile', tile.id);
            tileElement.title = tile.name;
            tileSelector.appendChild(tileElement);

            tileElement.addEventListener('click', () => {
                document.querySelectorAll('.tile-option').forEach(el => el.classList.remove('selected'));
                tileElement.classList.add('selected');
                this.selectedTile = tile;
            });
        });
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleCanvasClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleCanvasMove.bind(this));
        document.getElementById('clearBtn').addEventListener('click', this.clearMap.bind(this));
        document.getElementById('saveBtn').addEventListener('click', this.saveMap.bind(this));
        document.getElementById('exportBtn').addEventListener('click', this.exportToPNG.bind(this));
    }

    handleCanvasClick(event) {
        if (!this.selectedTile) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / this.tileSize);
        const y = Math.floor((event.clientY - rect.top) / this.tileSize);
        
        if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
            this.map[y][x] = this.selectedTile.id;
            this.drawMap();
        }
    }

    handleCanvasMove(event) {
        if (event.buttons !== 1 || !this.selectedTile) return;
        this.handleCanvasClick(event);
    }

    drawGrid() {
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.mapWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.tileSize, 0);
            this.ctx.lineTo(x * this.tileSize, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.mapHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.tileSize);
            this.ctx.lineTo(this.canvas.width, y * this.tileSize);
            this.ctx.stroke();
        }
    }

    drawMap() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.map[y][x];
                if (tileId !== 0) {
                    const tile = [
                        null,
                        { color: '#666666' }, // Wall
                        { color: '#90EE90' }, // Bush
                        { color: '#87CEEB' }, // Water
                        { color: '#FFD700' }  // Spawn
                    ][tileId];

                    this.ctx.fillStyle = tile.color;
                    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }

    clearMap() {
        if (confirm('Are you sure you want to clear the map?')) {
            this.map = Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));
            this.drawMap();
        }
    }

    async saveMap() {
        if (!firebase.auth().currentUser) {
            alert('Please login to save your map');
            return;
        }

        const mapData = {
            userId: firebase.auth().currentUser.uid,
            userName: firebase.auth().currentUser.displayName,
            created: firebase.database.ServerValue.TIMESTAMP,
            mapData: this.map
        };

        try {
            const newMapRef = firebase.database().ref('maps').push();
            await newMapRef.set(mapData);
            alert('Map saved successfully!');
        } catch (error) {
            console.error('Error saving map:', error);
            alert('Failed to save map. Please try again.');
        }
    }

    exportToPNG() {
        const link = document.createElement('a');
        link.download = 'brawl-stars-map.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

// Initialize the map maker when the page loads
window.addEventListener('load', () => {
    new MapMaker();
});

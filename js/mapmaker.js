class MapMaker {
    constructor() {
        this.canvas = document.getElementById('mapCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        
        // Map size configurations
        this.mapSizes = {
            regular: { width: 33, height: 21 },
            showdown: { width: 60, height: 60 },
            siege: { width: 39, height: 27 },
            volley: { width: 25, height: 21 },
            basket: { width: 17, height: 21 }
        };
        
        // Initialize with default size (regular)
        this.mapWidth = this.mapSizes.regular.width;
        this.mapHeight = this.mapSizes.regular.height;
        
        this.selectedTile = null;
        this.map = this.createEmptyMap();
        this.gamemode = 'custom';
        this.environment = 'desert';
        
        this.initializeCanvas();
        this.initializeTileSelector();
        this.setupEventListeners();
    }

    createEmptyMap() {
        return Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));
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
        
        // Add listeners for dropdowns
        document.getElementById('mapSize').addEventListener('change', (e) => {
            const newSize = this.mapSizes[e.target.value];
            if (confirm('Changing map size will clear the current map. Continue?')) {
                this.mapWidth = newSize.width;
                this.mapHeight = newSize.height;
                this.map = this.createEmptyMap();
                this.initializeCanvas();
            } else {
                e.target.value = Object.keys(this.mapSizes).find(key => 
                    this.mapSizes[key].width === this.mapWidth && 
                    this.mapSizes[key].height === this.mapHeight
                );
            }
        });

        document.getElementById('gamemode').addEventListener('change', (e) => {
            this.gamemode = e.target.value;
        });

        document.getElementById('environment').addEventListener('change', (e) => {
            this.environment = e.target.value;
        });
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
            this.map = this.createEmptyMap();
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
            mapData: this.map,
            gamemode: this.gamemode,
            environment: this.environment,
            size: {
                width: this.mapWidth,
                height: this.mapHeight
            }
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
        // Create a temporary canvas for the export
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.canvas.width;
        exportCanvas.height = this.canvas.height;
        const exportCtx = exportCanvas.getContext('2d');

        // Draw only the tiles without the grid
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

                    exportCtx.fillStyle = tile.color;
                    exportCtx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }

        // Create download link with the grid-free version
        const link = document.createElement('a');
        link.download = 'brawl-stars-map.png';
        link.href = exportCanvas.toDataURL();
        link.click();
    }
}

// Initialize the map maker when the page loads
window.addEventListener('load', () => {
    new MapMaker();
});

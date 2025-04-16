class MapMaker {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        
        // Map size configurations
        this.mapSizes = {
            regular: { width: 21, height: 33 },
            showdown: { width: 60, height: 60 },
            siege: { width: 27, height: 39 },
            volley: { width: 21, height: 25 },
            basket: { width: 21, height: 17 }
        };
        
        // Initialize with default size (regular)
        this.mapWidth = this.mapSizes.regular.width;
        this.mapHeight = this.mapSizes.regular.height;
        
        this.zoomLevel = 1;
        this.minZoom = 0.5;
        this.maxZoom = 2;
        this.zoomStep = 0.25;

        // Initialize canvas size
        this.canvas.width = this.mapWidth * this.tileSize;
        this.canvas.height = this.mapHeight * this.tileSize;

        // Initialize map data
        this.mapData = Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));
        
        this.selectedTile = { id: 1, name: 'Wall', color: '#666666' };
        this.isErasing = false;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;

        // Mirroring state
        this.mirrorVertical = false;
        this.mirrorHorizontal = false;
        this.mirrorDiagonal = false;

        // Game settings
        this.gamemode = 'custom';
        this.environment = 'desert';

        this.initializeEventListeners();
        this.initializeTileSelector();
        
        // Set initial zoom to fit the map
        this.fitMapToScreen();
        this.draw();
    }

    fitMapToScreen() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 32;
        const containerHeight = container.clientHeight - 32;
        
        const scaleX = containerWidth / this.canvas.width;
        const scaleY = containerHeight / this.canvas.height;
        this.zoomLevel = Math.min(scaleX, scaleY, 1);
        
        this.updateCanvasZoom();
    }

    updateCanvasZoom() {
        this.canvas.style.transform = `scale(${this.zoomLevel})`;
        
        const container = this.canvas.parentElement;
        const mapWidth = this.canvas.width * this.zoomLevel;
        const mapHeight = this.canvas.height * this.zoomLevel;
        
        if (mapWidth > container.clientWidth - 32 || mapHeight > container.clientHeight - 32) {
            container.classList.add('scrollable');
        } else {
            container.classList.remove('scrollable');
        }
    }

    initializeEventListeners() {
        // Tool buttons
        const eraseBtn = document.getElementById('eraseBtn');
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const clearBtn = document.getElementById('clearBtn');
        const saveBtn = document.getElementById('saveBtn');
        const exportBtn = document.getElementById('exportBtn');

        // Mirror checkboxes
        const mirrorVertical = document.getElementById('mirrorVertical');
        const mirrorHorizontal = document.getElementById('mirrorHorizontal');
        const mirrorDiagonal = document.getElementById('mirrorDiagonal');

        // Map settings
        const mapSizeSelect = document.getElementById('mapSize');
        const gamemodeSelect = document.getElementById('gamemode');
        const environmentSelect = document.getElementById('environment');

        eraseBtn.addEventListener('change', (e) => {
            this.isErasing = e.target.checked;
            eraseBtn.parentElement.classList.toggle('active', this.isErasing);
        });

        zoomInBtn.addEventListener('click', () => this.zoom(this.zoomStep));
        zoomOutBtn.addEventListener('click', () => this.zoom(-this.zoomStep));
        clearBtn.addEventListener('click', () => this.clearMap());
        saveBtn.addEventListener('click', () => this.saveMap());
        exportBtn.addEventListener('click', () => this.exportAsPNG());

        // Mirror listeners
        mirrorVertical.addEventListener('change', (e) => this.mirrorVertical = e.target.checked);
        mirrorHorizontal.addEventListener('change', (e) => this.mirrorHorizontal = e.target.checked);
        mirrorDiagonal.addEventListener('change', (e) => this.mirrorDiagonal = e.target.checked);

        // Map setting listeners
        mapSizeSelect.addEventListener('change', (e) => {
            const newSize = this.mapSizes[e.target.value];
            if (confirm('Changing map size will clear the current map. Continue?')) {
                this.mapWidth = newSize.width;
                this.mapHeight = newSize.height;
                this.canvas.width = this.mapWidth * this.tileSize;
                this.canvas.height = this.mapHeight * this.tileSize;
                this.mapData = Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));
                this.fitMapToScreen();
                this.draw();
            } else {
                e.target.value = Object.keys(this.mapSizes).find(key => 
                    this.mapSizes[key].width === this.mapWidth && 
                    this.mapSizes[key].height === this.mapHeight
                );
            }
        });

        gamemodeSelect.addEventListener('change', (e) => this.gamemode = e.target.value);
        environmentSelect.addEventListener('change', (e) => this.environment = e.target.value);

        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    }

    zoom(delta) {
        const oldZoom = this.zoomLevel;
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));
        
        if (oldZoom !== this.zoomLevel) {
            this.updateCanvasZoom();
        }
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
            if (tile.id === 1) tileElement.className += ' selected';
            tileElement.style.backgroundColor = tile.color;
            tileElement.setAttribute('data-tile', tile.id);
            tileElement.title = tile.name;
            tileSelector.appendChild(tileElement);

            tileElement.addEventListener('click', () => {
                document.querySelectorAll('.tile-option').forEach(el => el.classList.remove('selected'));
                tileElement.classList.add('selected');
                this.selectedTile = { ...tile };
                this.isErasing = false;
                document.getElementById('eraseBtn').classList.remove('active');
            });
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.mapData[y][x];
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

    handleMouseDown(event) {
        if (!this.selectedTile && !this.isErasing) return;
        
        this.isDragging = true;
        const tile = this.getTileCoordinates(event);
        this.lastX = tile.x;
        this.lastY = tile.y;
        
        if (this.isErasing) {
            this.eraseTile(tile.x, tile.y);
        } else {
            this.placeTile(tile.x, tile.y);
        }
    }

    handleMouseMove(event) {
        if (!this.isDragging) return;
        
        const tile = this.getTileCoordinates(event);
        
        if (this.isErasing) {
            this.eraseTile(tile.x, tile.y);
        } else {
            this.placeTile(tile.x, tile.y);
        }
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    getTileCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: Math.floor((event.clientX - rect.left) / (this.tileSize * this.zoomLevel)),
            y: Math.floor((event.clientY - rect.top) / (this.tileSize * this.zoomLevel))
        };
    }

    placeTile(x, y) {
        if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) return;

        const value = this.isErasing ? 0 : this.selectedTile.id;
        this.mapData[y][x] = value;

        // Apply mirroring
        if (this.mirrorVertical) {
            const mirrorY = this.mapHeight - 1 - y;
            if (mirrorY >= 0 && mirrorY < this.mapHeight) {
                this.mapData[mirrorY][x] = value;
            }
        }

        if (this.mirrorHorizontal) {
            const mirrorX = this.mapWidth - 1 - x;
            if (mirrorX >= 0 && mirrorX < this.mapWidth) {
                this.mapData[y][mirrorX] = value;
            }
        }

        if (this.mirrorDiagonal) {
            const mirrorX = this.mapWidth - 1 - x;
            const mirrorY = this.mapHeight - 1 - y;
            if (mirrorX >= 0 && mirrorX < this.mapWidth && mirrorY >= 0 && mirrorY < this.mapHeight) {
                this.mapData[mirrorY][mirrorX] = value;
            }
        }

        this.draw();
    }

    eraseTile(x, y) {
        if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) return;

        this.mapData[y][x] = 0;

        // Apply mirroring
        if (this.mirrorVertical) {
            const mirrorY = this.mapHeight - 1 - y;
            if (mirrorY >= 0 && mirrorY < this.mapHeight) {
                this.mapData[mirrorY][x] = 0;
            }
        }

        if (this.mirrorHorizontal) {
            const mirrorX = this.mapWidth - 1 - x;
            if (mirrorX >= 0 && mirrorX < this.mapWidth) {
                this.mapData[y][mirrorX] = 0;
            }
        }

        if (this.mirrorDiagonal) {
            const mirrorX = this.mapWidth - 1 - x;
            const mirrorY = this.mapHeight - 1 - y;
            if (mirrorX >= 0 && mirrorX < this.mapWidth && mirrorY >= 0 && mirrorY < this.mapHeight) {
                this.mapData[mirrorY][mirrorX] = 0;
            }
        }

        this.draw();
    }

    clearMap() {
        if (confirm('Are you sure you want to clear the map?')) {
            this.mapData = Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));
            this.draw();
        }
    }

    saveMap() {
        if (!firebase.auth().currentUser) {
            alert('Please login to save your map');
            return;
        }

        const mapData = {
            userId: firebase.auth().currentUser.uid,
            userName: firebase.auth().currentUser.displayName,
            created: firebase.database.ServerValue.TIMESTAMP,
            mapData: this.mapData,
            size: {
                width: this.mapWidth,
                height: this.mapHeight
            }
        };

        try {
            const newMapRef = firebase.database().ref('maps').push();
            newMapRef.set(mapData);
            alert('Map saved successfully!');
        } catch (error) {
            console.error('Error saving map:', error);
            alert('Failed to save map. Please try again.');
        }
    }

    exportAsPNG() {
        // Create a temporary canvas for the export
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.canvas.width;
        exportCanvas.height = this.canvas.height;
        const exportCtx = exportCanvas.getContext('2d');

        // Draw only the tiles without the grid
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.mapData[y][x];
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
    new MapMaker('mapCanvas');
});

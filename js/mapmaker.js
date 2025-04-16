class MapMaker {
    constructor() {
        this.canvas = document.getElementById('mapCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        this.zoomLevel = 1;
        
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
        
        // Initialize with Wall tile selected
        this.selectedTile = { id: 1, name: 'Wall', color: '#666666' };
        this.map = this.createEmptyMap();
        this.gamemode = 'custom';
        this.environment = 'desert';
        
        // Drawing state
        this.isDrawing = false;
        this.isErasing = false;
        this.drawingMode = 'single';
        this.startTile = null;
        this.lastTile = null;

        // Mirroring state
        this.mirrorDiagonal = false;
        this.mirrorVertical = false;
        this.mirrorHorizontal = false;

        // Preview overlay
        this.previewOverlay = document.createElement('div');
        this.previewOverlay.className = 'preview-overlay';
        document.querySelector('.map-editor').appendChild(this.previewOverlay);
        
        this.initializeCanvas();
        this.initializeTileSelector();
        this.setupEventListeners();
        this.setInitialZoom();
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

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        document.getElementById('clearBtn').addEventListener('click', this.clearMap.bind(this));
        document.getElementById('saveBtn').addEventListener('click', this.saveMap.bind(this));
        document.getElementById('exportBtn').addEventListener('click', this.exportToPNG.bind(this));

        // Mirror listeners
        document.getElementById('mirrorDiagonal').addEventListener('change', (e) => {
            this.mirrorDiagonal = e.target.checked;
        });
        document.getElementById('mirrorVertical').addEventListener('change', (e) => {
            this.mirrorVertical = e.target.checked;
        });
        document.getElementById('mirrorHorizontal').addEventListener('change', (e) => {
            this.mirrorHorizontal = e.target.checked;
        });

        // Erase button
        document.getElementById('eraseBtn').addEventListener('click', (e) => {
            this.isErasing = !this.isErasing;
            e.target.classList.toggle('active');
        });

        // Zoom controls
        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.zoomLevel = Math.min(this.zoomLevel * 1.2, 2);
            this.updateCanvasZoom();
        });

        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.1);
            this.updateCanvasZoom();
        });

        // Add listeners for dropdowns
        document.getElementById('mapSize').addEventListener('change', (e) => {
            const newSize = this.mapSizes[e.target.value];
            if (confirm('Changing map size will clear the current map. Continue?')) {
                this.mapWidth = newSize.width;
                this.mapHeight = newSize.height;
                this.map = this.createEmptyMap();
                this.initializeCanvas();
                this.setInitialZoom();
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

    getTileCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: Math.floor((event.clientX - rect.left) / (this.tileSize * this.zoomLevel)),
            y: Math.floor((event.clientY - rect.top) / (this.tileSize * this.zoomLevel))
        };
    }

    handleMouseDown(event) {
        if (!this.selectedTile && !this.isErasing) return;
        
        this.isDrawing = true;
        const tile = this.getTileCoordinates(event);
        this.startTile = tile;
        this.lastTile = tile;
        
        if (this.drawingMode === 'single') {
            this.placeTile(tile.x, tile.y);
        }
    }

    handleMouseMove(event) {
        if (!this.isDrawing) return;
        
        const tile = this.getTileCoordinates(event);
        
        if (this.drawingMode === 'line') {
            if (tile.x !== this.lastTile.x || tile.y !== this.lastTile.y) {
                this.placeTile(tile.x, tile.y);
                this.lastTile = tile;
            }
        } else if (this.drawingMode === 'rectangle') {
            this.updateRectanglePreview(tile);
        }
    }

    handleMouseUp(event) {
        if (!this.isDrawing) return;
        
        if (this.drawingMode === 'rectangle') {
            const endTile = this.getTileCoordinates(event);
            this.placeRectangle(this.startTile, endTile);
            this.previewOverlay.style.display = 'none';
        }
        
        this.isDrawing = false;
        this.startTile = null;
        this.lastTile = null;
    }

    updateRectanglePreview(currentTile) {
        const rect = this.canvas.getBoundingClientRect();
        const startX = Math.min(this.startTile.x, currentTile.x) * this.tileSize * this.zoomLevel;
        const startY = Math.min(this.startTile.y, currentTile.y) * this.tileSize * this.zoomLevel;
        const width = (Math.abs(currentTile.x - this.startTile.x) + 1) * this.tileSize * this.zoomLevel;
        const height = (Math.abs(currentTile.y - this.startTile.y) + 1) * this.tileSize * this.zoomLevel;

        this.previewOverlay.style.display = 'block';
        this.previewOverlay.style.left = `${rect.left + startX}px`;
        this.previewOverlay.style.top = `${rect.top + startY}px`;
        this.previewOverlay.style.width = `${width}px`;
        this.previewOverlay.style.height = `${height}px`;
        this.previewOverlay.className = `preview-overlay${this.isErasing ? ' erase' : ''}`;
    }

    placeRectangle(start, end) {
        const startX = Math.min(start.x, end.x);
        const startY = Math.min(start.y, end.y);
        const endX = Math.max(start.x, end.x);
        const endY = Math.max(start.y, end.y);

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                this.placeTile(x, y);
            }
        }
    }

    placeTile(x, y) {
        if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) return;

        const value = this.isErasing ? 0 : this.selectedTile.id;
        this.map[y][x] = value;

        // Apply mirroring
        if (this.mirrorVertical) {
            const mirrorX = x;
            const mirrorY = this.mapHeight - 1 - y;
            if (mirrorY >= 0 && mirrorY < this.mapHeight) {
                this.map[mirrorY][mirrorX] = value;
            }
        }

        if (this.mirrorHorizontal) {
            const mirrorX = this.mapWidth - 1 - x;
            const mirrorY = y;
            if (mirrorX >= 0 && mirrorX < this.mapWidth) {
                this.map[mirrorY][mirrorX] = value;
            }
        }

        if (this.mirrorDiagonal) {
            // Diagonal mirror across both axes
            const mirrorX = this.mapWidth - 1 - x;
            const mirrorY = this.mapHeight - 1 - y;
            if (mirrorX >= 0 && mirrorX < this.mapWidth && mirrorY >= 0 && mirrorY < this.mapHeight) {
                this.map[mirrorY][mirrorX] = value;
            }
        }

        this.drawMap();
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

    setInitialZoom() {
        const container = document.querySelector('.map-editor');
        const containerWidth = container.clientWidth - 32; // Account for padding
        const containerHeight = container.clientHeight - 32;
        const mapWidth = this.mapWidth * this.tileSize;
        const mapHeight = this.mapHeight * this.tileSize;
        
        const widthRatio = containerWidth / mapWidth;
        const heightRatio = containerHeight / mapHeight;
        this.zoomLevel = Math.min(widthRatio, heightRatio, 1);
        
        this.updateCanvasZoom();
    }

    updateCanvasZoom() {
        this.canvas.style.transform = `scale(${this.zoomLevel})`;
        
        // Check if scrolling is needed
        const container = document.querySelector('.map-editor');
        const mapWidth = this.mapWidth * this.tileSize * this.zoomLevel;
        const mapHeight = this.mapHeight * this.tileSize * this.zoomLevel;
        
        if (mapWidth > container.clientWidth - 32 || mapHeight > container.clientHeight - 32) {
            container.classList.add('scrollable');
        } else {
            container.classList.remove('scrollable');
        }
    }
}

// Initialize the map maker when the page loads
window.addEventListener('load', () => {
    new MapMaker();
});

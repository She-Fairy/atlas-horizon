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
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.draggedTileId = null;
        this.dragStartX = null;
        this.dragStartY = null;

        // Mirroring state
        this.mirrorVertical = false;
        this.mirrorHorizontal = false;
        this.mirrorDiagonal = false;

        // Game settings
        this.gamemode = 'custom';
        this.environment = 'desert';

        // Selection mode
        this.selectionMode = 'single';
        this.selectionStart = null;
        this.selectionEnd = null;
        this.hoveredTiles = new Set(); // For line selection

        // Environment and background
        this.bgDark = new Image();
        this.bgLight = new Image();
        this.loadEnvironmentBackgrounds();

        // Tile definitions with images and sizes
        this.tileDefinitions = {
            0: { name: 'Empty' },
            1: { name: 'Wall', img: '${env}/Tiles/Wall.png', size: 1 },
            2: { name: 'Bush', img: '${env}/Tiles/Bush.png', size: 1 },
            3: { name: 'Wall2', img: '${env}/Tiles/Wall2.png', size: 1 },
            4: { name: 'Crate', img: '${env}/Tiles/Crate.png', size: 1 },
            5: { name: 'Barrel', img: '${env}/Tiles/Barrel.png', size: 1 },
            6: { name: 'Cactus', img: '${env}/Tiles/Cactus.png', size: 1 },
            7: { name: 'Fence', img: '${env}/Fence/Fence.png', size: 1 },
            8: { name: 'Water', img: '${env}/Water/00000000.png', size: 1 },
            9: { name: 'Rope Fence', img: '${env}/Rope/Rope.png', size: 1 },
            10: { name: 'Skull', img: '${env}/Tiles/Skull.png', size: 1 },
            11: { name: 'Unbreakable', img: 'Global/Unbreakable.png', size: 1 },
            12: { name: 'Blue Spawn', img: 'Global/Spawns/3v3/1.png', size: 1 },
            13: { name: 'Red Spawn', img: 'Global/Spawns/3v3/2.png', size: 1 },
            14: { name: 'Smoke', img: 'Global/Special_Tiles/Smoke.png', size: 1 },
            15: { name: 'Heal Pad', img: 'Global/Special_Tiles/HealPad.png', size: 1 },
            16: { name: 'Slow Tile', img: 'Global/Special_Tiles/SlowTile.png', size: 1 },
            17: { name: 'Speed Tile', img: 'Global/Special_Tiles/SpeedTile.png', size: 1 },
            18: { name: 'Spikes', img: 'Global/Special_Tiles/Spikes.png', size: 1 },
            19: { name: 'Jump R', img: 'Global/Jumpads/R.png', size: 1 },
            20: { name: 'Jump L', img: 'Global/Jumpads/L.png', size: 1 },
            21: { name: 'Jump B', img: 'Global/Jumpads/B.png', size: 1 },
            22: { name: 'Jump T', img: 'Global/Jumpads/T.png', size: 1 },
            23: { name: 'Jump BR', img: 'Global/Jumpads/BR.png', size: 1 },
            24: { name: 'Jump TL', img: 'Global/Jumpads/TL.png', size: 1 },
            25: { name: 'Jump BL', img: 'Global/Jumpads/BL.png', size: 1 },
            26: { name: 'Jump TR', img: 'Global/Jumpads/TR.png', size: 1 },
            27: { name: 'Teleporter Blue', img: 'Global/Teleporters/Blue.png', size: 1 },
            28: { name: 'Teleporter Green', img: 'Global/Teleporters/Green.png', size: 1 },
            29: { name: 'Teleporter Red', img: 'Global/Teleporters/Red.png', size: 1 },
            30: { name: 'Teleporter Yellow', img: 'Global/Teleporters/Yellow.png', size: 1 }
        };

        // Load all tile images
        this.tileImages = {};
        this.loadTileImages();

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

        // Selection mode radio buttons
        document.querySelectorAll('input[name="selectionMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectionMode = e.target.value;
            });
        });

        eraseBtn.addEventListener('change', (e) => {
            this.isErasing = e.target.checked;
            eraseBtn.parentElement.classList.toggle('active', this.isErasing);
        });

        zoomInBtn.addEventListener('click', () => this.zoom(this.zoomStep));
        zoomOutBtn.addEventListener('click', () => this.zoom(-this.zoomStep));
        clearBtn.addEventListener('click', () => this.clearMap());
        saveBtn.addEventListener('click', () => this.saveMap());
        exportBtn.addEventListener('click', () => this.exportMap());

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
        environmentSelect.addEventListener('change', (e) => {
            this.setEnvironment(e.target.value);
        });

        // Canvas event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Add document-level mouse up to ensure we catch the event even if released outside canvas
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleMouseDown(event) {
        const coords = this.getTileCoordinates(event);
        if (coords.x < 0 || coords.x >= this.mapWidth || coords.y < 0 || coords.y >= this.mapHeight) return;

        // Check if we're starting to drag an existing tile
        if (!this.isErasing && this.mapData[coords.y][coords.x] !== 0) {
            this.isDragging = true;
            this.draggedTileId = this.mapData[coords.y][coords.x];
            this.dragStartX = coords.x;
            this.dragStartY = coords.y;
            
            // Remove tile from original position immediately
            this.mapData[coords.y][coords.x] = 0;
            
            // Apply mirroring for removal
            if (this.mirrorVertical) {
                const mirrorY = this.mapHeight - 1 - coords.y;
                this.mapData[mirrorY][coords.x] = 0;
            }
            if (this.mirrorHorizontal) {
                const mirrorX = this.mapWidth - 1 - coords.x;
                this.mapData[coords.y][mirrorX] = 0;
            }
            if (this.mirrorDiagonal) {
                const mirrorX = this.mapWidth - 1 - coords.x;
                const mirrorY = this.mapHeight - 1 - coords.y;
                this.mapData[mirrorY][mirrorX] = 0;
            }
            
            this.canvas.style.cursor = 'grabbing';
            this.draw();
            return;
        }

        // Start selection
        this.isDrawing = true;
        this.selectionStart = coords;
        this.selectionEnd = coords;
        
        if (this.selectionMode === 'line') {
            this.hoveredTiles.clear();
            this.hoveredTiles.add(`${coords.x},${coords.y}`);
        }
        
        this.draw();
        this.drawSelection();
    }

    handleMouseMove(event) {
        const coords = this.getTileCoordinates(event);
        if (coords.x < 0 || coords.x >= this.mapWidth || coords.y < 0 || coords.y >= this.mapHeight) return;
        
        if (this.isDragging) {
            this.draw(); // Redraw the base map
            
            // Draw preview
            const draggedTile = this.tileDefinitions[this.draggedTileId];

            if (draggedTile) {
                const img = this.tileImages[this.draggedTileId];
                if (img && img.complete) {
                    // Calculate position to align bottom of image with bottom of tile
                    const aspectRatio = img.height / img.width;
                    const drawHeight = this.tileSize * aspectRatio;
                    const drawY = coords.y * this.tileSize + this.tileSize - drawHeight;

                    this.ctx.drawImage(
                        img,
                        coords.x * this.tileSize,
                        drawY,
                        this.tileSize,
                        drawHeight
                    );
                    
                    // Show mirrored previews
                    if (this.mirrorVertical) {
                        const mirrorY = this.mapHeight - 1 - coords.y;
                        this.ctx.drawImage(
                            img,
                            coords.x * this.tileSize,
                            mirrorY * this.tileSize + this.tileSize - drawHeight,
                            this.tileSize,
                            drawHeight
                        );
                    }
                    if (this.mirrorHorizontal) {
                        const mirrorX = this.mapWidth - 1 - coords.x;
                        this.ctx.drawImage(
                            img,
                            mirrorX * this.tileSize,
                            coords.y * this.tileSize + this.tileSize - drawHeight,
                            this.tileSize,
                            drawHeight
                        );
                    }
                    if (this.mirrorDiagonal) {
                        const mirrorX = this.mapWidth - 1 - coords.x;
                        const mirrorY = this.mapHeight - 1 - coords.y;
                        this.ctx.drawImage(
                            img,
                            mirrorX * this.tileSize,
                            mirrorY * this.tileSize + this.tileSize - drawHeight,
                            this.tileSize,
                            drawHeight
                        );
                    }
                }
            }
            return;
        }

        if (this.isDrawing) {
            this.selectionEnd = coords;
            
            if (this.selectionMode === 'line') {
                // Get all tiles between last position and current position
                const lastPos = this.hoveredTiles.size > 0 ? 
                    Array.from(this.hoveredTiles).pop().split(',').map(Number) : 
                    [this.selectionStart.x, this.selectionStart.y];
                
                const [lastX, lastY] = lastPos;
                const dx = Math.abs(coords.x - lastX);
                const dy = Math.abs(coords.y - lastY);
                const sx = lastX < coords.x ? 1 : -1;
                const sy = lastY < coords.y ? 1 : -1;
                let err = dx - dy;
                
                let x = lastX;
                let y = lastY;
                
                // Add all tiles in between using Bresenham's line algorithm
                while (!(x === coords.x && y === coords.y)) {
                    if (err > -dy) {
                        err -= dy;
                        x += sx;
                    }
                    if (err < dx) {
                        err += dx;
                        y += sy;
                    }
                    const e2 = 2 * err;
                    this.hoveredTiles.add(`${x},${y}`);
                }
                this.hoveredTiles.add(`${coords.x},${coords.y}`);
            }
            
            this.draw();
            this.drawSelection();
        }
    }

    handleMouseUp(event) {
        if (!this.isDragging && this.isDrawing) {
            const coords = this.getTileCoordinates(event);
            if (coords.x >= 0 && coords.x < this.mapWidth && coords.y >= 0 && coords.y < this.mapHeight) {
                if (this.selectionMode === 'single') {
                    if (this.isErasing) {
                        this.eraseTile(coords.x, coords.y);
                    } else {
                        this.placeTile(coords.x, coords.y);
                    }
                } else {
                    this.placeTilesInSelection();
                }
            }
        } else if (this.isDragging) {
            const coords = this.getTileCoordinates(event);
            if (coords.x >= 0 && coords.x < this.mapWidth && coords.y >= 0 && coords.y < this.mapHeight) {
                // Place the tile
                this.mapData[coords.y][coords.x] = this.draggedTileId;
                
                // Apply mirroring
                if (this.mirrorVertical) {
                    const mirrorY = this.mapHeight - 1 - coords.y;
                    this.mapData[mirrorY][coords.x] = this.draggedTileId;
                }
                if (this.mirrorHorizontal) {
                    const mirrorX = this.mapWidth - 1 - coords.x;
                    this.mapData[coords.y][mirrorX] = this.draggedTileId;
                }
                if (this.mirrorDiagonal) {
                    const mirrorX = this.mapWidth - 1 - coords.x;
                    const mirrorY = this.mapHeight - 1 - coords.y;
                    this.mapData[mirrorY][mirrorX] = this.draggedTileId;
                }
            }
        }
        
        // Reset all states
        this.isDragging = false;
        this.isDrawing = false;
        this.draggedTileId = null;
        this.dragStartX = null;
        this.dragStartY = null;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.hoveredTiles.clear();
        this.canvas.style.cursor = 'crosshair';
        this.draw();
    }

    handleMouseLeave() {
        this.isDrawing = false;
        if (this.isDragging) {
            this.isDragging = false;
            this.draggedTileId = null;
            this.dragStartX = null;
            this.dragStartY = null;
            this.canvas.style.cursor = 'crosshair';
            this.draw();
        }
    }

    zoom(delta) {
        const oldZoom = this.zoomLevel;
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));
        
        if (oldZoom !== this.zoomLevel) {
            this.updateCanvasZoom();
        }
    }

    initializeTileSelector() {
        const container = document.getElementById('tileSelector');
        container.innerHTML = '';

        Object.entries(this.tileDefinitions).forEach(([id, def]) => {
            if (id === '0') return; // Skip empty tile

            const btn = document.createElement('button');
            btn.className = 'tile-btn';
            btn.title = def.name;
            
            if (def.img) {
                const img = document.createElement('img');
                img.src = `Resources/${def.img.replace('${env}', this.environment)}`;
                img.alt = def.name;
                btn.appendChild(img);
            }

            btn.addEventListener('click', () => {
                this.selectedTile = { id: parseInt(id), ...def };
                // Update selected state
                container.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });

            container.appendChild(btn);
        });
    }

    loadEnvironmentBackgrounds() {
        const envPath = `Resources/${this.environment}`;
        this.bgDark.src = `${envPath}/BGDark.png`;
        this.bgLight.src = `${envPath}/BGLight.png`;
        
        // If environment assets don't exist, fall back to desert
        this.bgDark.onerror = () => {
            this.environment = 'desert';
            this.bgDark.src = 'Resources/desert/BGDark.png';
        };
        this.bgLight.onerror = () => {
            this.environment = 'desert';
            this.bgLight.src = 'Resources/desert/BGLight.png';
        };

        // Redraw when images are loaded
        this.bgDark.onload = () => this.draw();
        this.bgLight.onload = () => this.draw();
    }

    loadTileImages() {
        Object.entries(this.tileDefinitions).forEach(([id, def]) => {
            if (def.img) {
                const img = new Image();
                const path = def.img.replace('${env}', this.environment);
                img.src = `Resources/${path}`;
                this.tileImages[id] = img;
                
                img.onerror = () => {
                    // If environment-specific tile fails, try desert
                    if (this.environment !== 'desert' && def.img.includes('${env}')) {
                        img.src = `Resources/${def.img.replace('${env}', 'desert')}`;
                    }
                };
                
                img.onload = () => this.draw();
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background grid
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const isDark = (x + y) % 2 === 0;
                const bgImg = isDark ? this.bgDark : this.bgLight;
                
                if (bgImg.complete) {
                    this.ctx.drawImage(
                        bgImg,
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }

        // Draw tiles
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.mapData[y][x];
                if (tileId === 0) continue;

                const img = this.tileImages[tileId];
                if (img && img.complete) {
                    // Calculate position to align bottom of image with bottom of tile
                    const aspectRatio = img.height / img.width;
                    const drawHeight = this.tileSize * aspectRatio;
                    const drawY = y * this.tileSize + this.tileSize - drawHeight;

                    this.ctx.drawImage(
                        img,
                        x * this.tileSize,
                        drawY,
                        this.tileSize,
                        drawHeight
                    );
                }
            }
        }
    }

    getTileCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Calculate actual tile size on screen
        const actualTileWidth = rect.width / this.mapWidth;
        const actualTileHeight = rect.height / this.mapHeight;
        
        // Convert mouse position to tile coordinates
        const x = Math.floor(mouseX / actualTileWidth);
        const y = Math.floor(mouseY / actualTileHeight);
        
        return { x, y };
    }

    drawSelection() {
        if (!this.selectionStart || !this.selectionEnd) return;

        // Set color based on erasing mode
        this.ctx.fillStyle = this.isErasing ? 'rgba(255, 0, 0, 0.5)' : 'rgba(128, 128, 128, 0.5)';
        
        if (this.selectionMode === 'line') {
            // Draw all hovered tiles
            for (const tilePos of this.hoveredTiles) {
                const [x, y] = tilePos.split(',').map(Number);
                this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        } else if (this.selectionMode === 'rectangle') {
            const startX = Math.min(this.selectionStart.x, this.selectionEnd.x);
            const endX = Math.max(this.selectionStart.x, this.selectionEnd.x);
            const startY = Math.min(this.selectionStart.y, this.selectionEnd.y);
            const endY = Math.max(this.selectionStart.y, this.selectionEnd.y);

            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        } else if (this.selectionMode === 'single') {
            // Only show preview at current position
            this.ctx.fillRect(
                this.selectionEnd.x * this.tileSize,
                this.selectionEnd.y * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        }
    }

    placeTilesInSelection() {
        if (!this.selectionStart || !this.selectionEnd) return;

        if (this.selectionMode === 'line') {
            // Place tiles in all hovered positions
            for (const tilePos of this.hoveredTiles) {
                const [x, y] = tilePos.split(',').map(Number);
                if (this.isErasing) {
                    this.eraseTile(x, y);
                } else {
                    this.placeTile(x, y);
                }
            }
        } else if (this.selectionMode === 'rectangle') {
            const startX = Math.min(this.selectionStart.x, this.selectionEnd.x);
            const endX = Math.max(this.selectionStart.x, this.selectionEnd.x);
            const startY = Math.min(this.selectionStart.y, this.selectionEnd.y);
            const endY = Math.max(this.selectionStart.y, this.selectionEnd.y);

            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    if (this.isErasing) {
                        this.eraseTile(x, y);
                    } else {
                        this.placeTile(x, y);
                    }
                }
            }
        }
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

    exportMap() {
        if (!confirm('Are you sure you want to download the map?')) {
            return;
        }

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.canvas.width;
        exportCanvas.height = this.canvas.height;
        const exportCtx = exportCanvas.getContext('2d');

        // Draw background grid
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const isDark = (x + y) % 2 === 0;
                const bgImg = isDark ? this.bgDark : this.bgLight;
                
                if (bgImg.complete) {
                    exportCtx.drawImage(
                        bgImg,
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }

        // Draw tiles
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.mapData[y][x];
                if (tileId === 0) continue;

                const img = this.tileImages[tileId];
                if (img && img.complete) {
                    // Calculate position to align bottom of image with bottom of tile
                    const aspectRatio = img.height / img.width;
                    const drawHeight = this.tileSize * aspectRatio;
                    const drawY = y * this.tileSize + this.tileSize - drawHeight;

                    exportCtx.drawImage(
                        img,
                        x * this.tileSize,
                        drawY,
                        this.tileSize,
                        drawHeight
                    );
                }
            }
        }

        // Create download link
        const link = document.createElement('a');
        link.download = 'map.png';
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
    }

    setEnvironment(env) {
        this.environment = env;
        this.loadEnvironmentBackgrounds();
        this.loadTileImages();
    }
}

// Initialize the map maker when the page loads
window.addEventListener('load', () => {
    new MapMaker('mapCanvas');
});

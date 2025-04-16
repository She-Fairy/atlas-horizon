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
        this.gamemode = 'Gem_Grab'; // Set default gamemode to Gem_Grab
        this.environment = 'Desert';

        // Selection mode
        this.selectionMode = 'single';
        this.selectionStart = null;
        this.selectionEnd = null;
        this.hoveredTiles = new Set(); // For line selection
        this.mouseDown = false;

        // Environment and background
        this.bgDark = new Image();
        this.bgLight = new Image();
        this.loadEnvironmentBackgrounds();

        let regularDownAdjust = -50;
        // Standard tile dimensions [width, height, horAdjust, verAdjust, opacity, zIndex]
        this.tileData = {
            'Wall': [1, 1.75, 0, regularDownAdjust, 1, 5],
            'Bush': [1, 1.8, 0, regularDownAdjust, 1, 5],
            'Wall2': [1, 1.75, 0, regularDownAdjust, 1, 5],
            'Crate': [1, 1.8, 0, regularDownAdjust, 1, 5],
            'Barrel': [1, 1.69, 0, regularDownAdjust, 1, 5],
            'Cactus': [1.1, 1.75, -5, regularDownAdjust, 1, 5],
            'Fence': [1, 1.75, 0, regularDownAdjust, 1, 5],
            'Water': [1, 1, 0, 0, 1, 5],
            'Rope Fence': [1, 1.75, 0, regularDownAdjust, 1, 5],
            'Skull': [1, 1.08, 0, 0, 1, 5],
            'Unbreakable': [1, 1.75, 0, regularDownAdjust, 1, 5],
            'Blue Spawn': [0.80, 0.80, -27.5, -27.5, 0.85, 5],
            'Red Spawn': [0.80, 0.80, -27.5, -27.5, 0.85, 5],
            'Objective': [2, 2.21, -50, -115, 1, 10],
            'Smoke': [1.5, 1.65, -10, -25, 1, 5],
            'Heal Pad': [1, 1.12, 0, 0, 1, 5],
            'Slow Tile': [1, 1.11, 0, 0, 1, 5],
            'Speed Tile': [1, 1.11, 0, 0, 1, 5],
            'Spikes': [1, 1.5, 0, -15, 1, 5],
            'Jump R': [1, 1.12, 0, 0, 1, 5],
            'Jump L': [1, 1.12, 0, 0, 1, 5],
            'Jump T': [1, 1.12, 0, 0, 1, 5],
            'Jump B': [1, 1.12, 0, 0, 1, 5],
            'Jump BR': [1, 1.12, 0, 0, 1, 5],
            'Jump TL': [1, 1.12, 0, 0, 1, 5],
            'Jump BL': [1, 1.12, 0, 0, 1, 5],
            'Jump TR': [1, 1.12, 0, 0, 1, 5],
            'Teleporter Blue': [1, 1, 0, 0, 1, 5],
            'Teleporter Green': [1, 1, 0, 0, 1, 5],
            'Teleporter Red': [1, 1, 0, 0, 1, 5],
            'Teleporter Yellow': [1, 1, 0, 0, 1, 5],
            'Bolt': [1, 1.18, 0, 0, 1, 5]
        };

        // Standard objective dimensions [width, height, horAdjust, verAdjust, opacity, zIndex]
        this.objectiveData = {
            'Gem_Grab': [2, 2, -50, -50, 1, 10],
            'Showdown': [1, 1.75, 0, regularDownAdjust, 1, 5],
            'Heist': [2, 2.21, -50, -115, 1, 10],
            'Bounty': [1.15, 2.0585, -10, -50, 1, 10],
            'Brawl_Ball': [1.3, 1.495, -20, -20, 1, 10],
            'Hot_Zone': [7, 7, -300, -300, 1, 10],
            'Snowtel_Thieves': [4, 4, -150, -150, 1, 10],
            'Basket_Brawl': [1.3, 1.495, -20, -20, 1, 10],
            'Volley_Brawl': [1.3, 1.495, -20, -20, 1, 10],
            'Siege': [2.5, 3.1, -60, -175, 1, 10],
            'Hold_The_Trophy': [2.5, 2.5, -75, -75, 1, 10]
        };

        // Environment-specific overrides
        this.environmentTileData = {
            'Mine': {
                'Wall': [1, 1.9, 0, regularDownAdjust, 1, 1],
                'Bush': [1, 1.5, 0, regularDownAdjust, 1, 2]
                // Add more overrides as needed
            },
            'Mortuary': {
                'Wall': [1, 1.8, 0, regularDownAdjust, 1, 1],
                'Skull': [1, 1.4, 0, -16, 0.9, 1]
                // Add more overrides as needed
            }
            // Add more environments as needed
        };

        this.environmentObjectiveData = {
            'Mine': {
                'Gem_Grab': [1.3, 1.5, 0, -20, 1, 1],
                'Heist': [1.4, 1.6, 0, -24, 1, 1]
                // Add more overrides as needed
            }
            // Add more environments as needed
        };

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
            14: { name: 'Objective', size: 1, getImg: (gamemode, y, mapHeight) => {
                const objectives = {
                    'Gem_Grab': { img: '${env}/Gamemode_Specifics/Gem_Grab.png' },
                    'Showdown': { img: 'Global/Objectives/Box.png' },
                    'Heist': { img: '${env}/Gamemode_Specifics/Heist.png' },
                    'Bounty': { img: 'Global/Objectives/Bounty.png' },
                    'Brawl_Ball': { img: '${env}/Gamemode_Specifics/Brawl_Ball.png' },
                    'Hot_Zone': { img: 'Global/Objectives/Hot_Zone.png' },
                    'Snowtel_Thieves': { 
                        img: `Global/Objectives/${y > mapHeight/2 ? 'SnowtelThievesBlue' : 'SnowtelThievesRed'}.png`,
                        displayImg: 'Global/Objectives/SnowtelThievesBlue.png'
                    },
                    'Basket_Brawl': { img: 'Global/Objectives/Basket_Brawl.png' },
                    'Volley_Brawl': { img: 'Global/Objectives/Volley_Brawl.png' },
                    'Siege': { 
                        img: `Global/Objectives/${y > mapHeight/2 ? 'IkeBlue' : 'IkeRed'}.png`,
                        displayImg: 'Global/Objectives/IkeRed.png'
                    },
                    'Hold_The_Trophy': { img: 'Global/Objectives/Hold_The_Trophy.png' }
                };
                return objectives[gamemode];
            }},
            15: { name: 'Smoke', img: 'Global/Special_Tiles/Smoke.png', size: 1 },
            16: { name: 'Heal Pad', img: 'Global/Special_Tiles/HealPad.png', size: 2 },
            17: { name: 'Slow Tile', img: 'Global/Special_Tiles/SlowTile.png', size: 1 },
            18: { name: 'Speed Tile', img: 'Global/Special_Tiles/SpeedTile.png', size: 1 },
            19: { name: 'Spikes', img: 'Global/Special_Tiles/Spikes.png', size: 1 },
            20: { name: 'Jump R', img: 'Global/Jumpads/R.png', size: 2 },
            21: { name: 'Jump L', img: 'Global/Jumpads/L.png', size: 2 },
            22: { name: 'Jump T', img: 'Global/Jumpads/T.png', size: 2 },
            23: { name: 'Jump B', img: 'Global/Jumpads/B.png', size: 2 },
            24: { name: 'Jump BR', img: 'Global/Jumpads/BR.png', size: 2 },
            25: { name: 'Jump TL', img: 'Global/Jumpads/TL.png', size: 2 },
            26: { name: 'Jump BL', img: 'Global/Jumpads/BL.png', size: 2 },
            27: { name: 'Jump TR', img: 'Global/Jumpads/TR.png', size: 2 },
            28: { name: 'Teleporter Blue', img: 'Global/Teleporters/Blue.png', size: 2 },
            29: { name: 'Teleporter Green', img: 'Global/Teleporters/Green.png', size: 2 },
            30: { name: 'Teleporter Red', img: 'Global/Teleporters/Red.png', size: 2 },
            31: { name: 'Teleporter Yellow', img: 'Global/Teleporters/Yellow.png', size: 2 },
            32: { name: 'Bolt', img: 'Global/Objectives/Bolt.png', size: 1, showInGamemode: 'Siege' }
        };

        // Tile Adjustments
        this.tileAdjustments = {
            default: {}, // Default adjustments for all environments
            // Environment-specific adjustments
            Desert: {
                1: { offsetY: 10 }, // Wall
                2: { offsetY: 5 },  // Bush
                // Add more tile adjustments as needed
            },
            // Add more environments as needed
        };

        // Objective Adjustments
        this.objectiveAdjustments = {
            default: {
                'Gem_Grab': { scale: 1, offsetY: 0 },
                'Showdown': { scale: 1, offsetY: 0 },
                // Add more gamemode adjustments as needed
            },
            // Environment-specific adjustments
            Desert: {
                'Gem_Grab': { scale: 1.2, offsetY: 5 },
                // Add more adjustments as needed
            }
        };

        // Load all tile images
        this.tileImages = {};
        this.loadTileImages();

        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 50;

        this.replaceMode = false;

        // Add showErrors property
        this.showErrors = false;
        this.errorTiles = new Set();

        this.initializeUI();
        this.initializeEventListeners();
        this.initializeTileSelector();
        
        // Set initial zoom to fit the map
        this.fitMapToScreen();
        this.draw();
    }

    initializeUI() {
        // Initialize gamemode selector
        const gamemodeSelect = document.getElementById('gamemode');
        gamemodeSelect.value = this.gamemode;
        
        // Initialize environment selector
        const environmentSelect = document.getElementById('environment');
        environmentSelect.value = this.environment;

        // Initialize tile selector with current gamemode
        this.initializeTileSelector();
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
        const errorsBtn = document.getElementById('errorsBtn');

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
        errorsBtn.addEventListener('click', () => this.toggleShowErrors());

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

        gamemodeSelect.addEventListener('change', (e) => this.setGamemode(e.target.value));
        environmentSelect.addEventListener('change', (e) => this.setEnvironment(e.target.value));

        // Undo/Redo buttons
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        
        // Replace button
        document.getElementById('replaceBtn').addEventListener('click', () => this.toggleReplaceMode());

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key.toLowerCase()) {
                case '1':
                    this.setSelectionMode('single');
                    break;
                case '2':
                    this.setSelectionMode('line');
                    break;
                case '3':
                    this.setSelectionMode('rectangle');
                    break;
                case 'r':
                    this.toggleReplaceMode();
                    break;
                case 'e':
                    this.toggleEraseMode();
                    break;
                case 'm':
                    this.toggleMirroring();
                    break;
                case 'q':
                    this.toggleShowErrors();
                    break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                    }
                    break;
                case 'y':
                    if (e.ctrlKey || e.metaKey) {
                        this.redo();
                    }
                    break;
            }
        });

        // Canvas event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Add document-level mouse up to ensure we catch the event even if released outside canvas
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    saveState() {
        // Save current state to undo stack
        const state = {
            mapData: this.mapData.map(row => [...row]),
            timestamp: Date.now()
        };

        this.undoStack.push(state);
        // Clear redo stack when new action is performed
        this.redoStack = [];

        // Limit stack size
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
    }

    undo() {
        if (this.undoStack.length === 0) return;

        // Save current state to redo stack
        const currentState = {
            mapData: this.mapData.map(row => [...row]),
            timestamp: Date.now()
        };
        this.redoStack.push(currentState);

        // Restore previous state
        const previousState = this.undoStack.pop();
        this.mapData = previousState.mapData.map(row => [...row]);
        this.draw();
    }

    redo() {
        if (this.redoStack.length === 0) return;

        // Save current state to undo stack
        const currentState = {
            mapData: this.mapData.map(row => [...row]),
            timestamp: Date.now()
        };
        this.undoStack.push(currentState);

        // Restore next state
        const nextState = this.redoStack.pop();
        this.mapData = nextState.mapData.map(row => [...row]);
        this.draw();
    }

    handleMouseDown(event) {
        this.mouseDown = true;
        const coords = this.getTileCoordinates(event);
        if (coords.x < 0 || coords.x >= this.mapWidth || coords.y < 0 || coords.y >= this.mapHeight) return;

        if (this.replaceMode) {
            this.handleReplace(coords.x, coords.y);
            return;
        }

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
        this.mouseDown = false;
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
                // Get the tile definition
                const def = this.tileDefinitions[this.draggedTileId];
                if (!def) return;
                
                // Check if we can place this tile (for 2x2 tiles)
                if (def.size === 2) {
                    if (coords.x >= this.mapWidth - 1 || coords.y >= this.mapHeight - 1) return;
                    // Check if any of the 4 tiles are occupied
                    for (let dy = 0; dy < 2; dy++) {
                        for (let dx = 0; dx < 2; dx++) {
                            if (this.mapData[coords.y + dy][coords.x + dx] !== 0) return;
                        }
                    }
                }
                
                // Place the tile
                this.mapData[coords.y][coords.x] = this.draggedTileId;
                
                // For 2x2 tiles, mark the other tiles as occupied
                if (def.size === 2) {
                    this.mapData[coords.y][coords.x + 1] = -1;
                    this.mapData[coords.y + 1][coords.x] = -1;
                    this.mapData[coords.y + 1][coords.x + 1] = -1;
                }
                
                // Apply mirroring
                if (this.mirrorVertical || this.mirrorHorizontal || this.mirrorDiagonal) {
                    // Calculate mirror positions
                    const mirrorY = this.mapHeight - 1 - coords.y;
                    const mirrorX = this.mapWidth - 1 - coords.x;
                    
                    // For 2x2 tiles, adjust the mirror position
                    const size = def.size || 1;
                    
                    // Get mirrored tile ID (for jump pads)
                    const mirrorV = this.getMirroredTileId(this.draggedTileId, 'vertical');
                    const mirrorH = this.getMirroredTileId(this.draggedTileId, 'horizontal');
                    const mirrorD = this.getMirroredTileId(this.draggedTileId, 'diagonal');
                    
                    // Helper function to place a tile and its occupied spaces
                    const placeMirroredTile = (ty, tx, mid) => {
                        if (ty < 0 || ty >= this.mapHeight || tx < 0 || tx >= this.mapWidth) return;
                        if (size === 2) {
                            if (tx >= this.mapWidth - 1 || ty >= this.mapHeight - 1) return;
                            // Check if any tiles are occupied
                            for (let dy = 0; dy < 2; dy++) {
                                for (let dx = 0; dx < 2; dx++) {
                                    if (this.mapData[ty + dy][tx + dx] !== 0) return;
                                }
                            }
                            // Place the tile and mark occupied spaces
                            this.mapData[ty][tx] = mid;
                            this.mapData[ty][tx + 1] = -1;
                            this.mapData[ty + 1][tx] = -1;
                            this.mapData[ty + 1][tx + 1] = -1;
                        } else {
                            this.mapData[ty][tx] = mid;
                        }
                    };
                    
                    // Apply vertical mirroring - for 2x2 tiles, adjust by 1 tile back in rows
                    if (this.mirrorVertical) {
                        const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                        placeMirroredTile(adjustedY, coords.x, mirrorV);
                    }
                    
                    // Apply horizontal mirroring - for 2x2 tiles, adjust by 1 tile back in columns
                    if (this.mirrorHorizontal) {
                        const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                        placeMirroredTile(coords.y, adjustedX, mirrorH);
                    }
                    
                    // Apply diagonal mirroring - for 2x2 tiles, adjust by 1 tile back in both rows and columns
                    if (this.mirrorDiagonal) {
                        const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                        const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                        placeMirroredTile(adjustedY, adjustedX, mirrorD);
                    }
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

        // Define the order of tiles
        const tileOrder = [
            'Wall', 'Wall2', 'Unbreakable', 'Crate', 'Barrel', 'Fence', 'Rope Fence',
            'Bush', 'Cactus', 'Water', 'Skull', 'Blue Spawn', 'Red Spawn', 'Objective',
            'Smoke', 'Heal Pad', 'Slow Tile', 'Speed Tile', 'Spikes',
            'Jump R', 'Jump L', 'Jump T', 'Jump B',
            'Jump BR', 'Jump TL', 'Jump BL', 'Jump TR',
            'Teleporter Blue', 'Teleporter Green', 'Teleporter Red', 'Teleporter Yellow',
            'Bolt'
        ];

        // Create buttons in the specified order
        tileOrder.forEach(tileName => {
            const tileEntry = Object.entries(this.tileDefinitions)
                .find(([_, def]) => def.name === tileName);
            
            if (!tileEntry) return;
            const [id, def] = tileEntry;

            if (id === '0' || id === '-1') return; // Skip empty and occupied tiles
            if (def.showInGamemode && def.showInGamemode !== this.gamemode) return;

            const btn = document.createElement('button');
            btn.className = 'tile-btn';
            btn.title = def.name;
            
            if (def.img || def.getImg) {
                const img = document.createElement('img');
                if (def.img) {
                    img.src = `Resources/${def.img.replace('${env}', this.environment)}`;
                } else if (def.getImg) {
                    const imgData = def.getImg(this.gamemode, 0, this.mapHeight);
                    if (imgData) {
                        const imgPath = imgData.displayImg || imgData.img;
                        img.src = `Resources/${imgPath.replace('${env}', this.environment)}`;
                        img.onerror = () => {
                            if (this.environment !== 'Desert' && imgPath.includes('${env}')) {
                                img.src = `Resources/${imgPath.replace('${env}', 'Desert')}`;
                            }
                        };
                    } else {
                        // Skip this tile if it's not valid for current gamemode
                        return;
                    }
                }
                img.alt = def.name;
                btn.appendChild(img);
            }

            btn.addEventListener('click', () => {
                this.selectedTile = { id: parseInt(id), ...def };
                container.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });

            container.appendChild(btn);
        });
    }

    loadEnvironmentBackgrounds() {
        this.bgDark.src = `Resources/${this.environment}/BGDark.png`;
        this.bgLight.src = `Resources/${this.environment}/BGLight.png`;

        // Fallback to Desert if environment backgrounds don't exist
        this.bgDark.onerror = () => {
            this.bgDark.src = 'Resources/Desert/BGDark.png';
        };
        this.bgLight.onerror = () => {
            this.bgLight.src = 'Resources/Desert/BGLight.png';
        };

        this.bgDark.onload = () => this.draw();
        this.bgLight.onload = () => this.draw();
    }

    loadTileImages() {
        this.tileImages = {};
        Object.entries(this.tileDefinitions).forEach(([id, def]) => {
            if (!def.img && !def.getImg) return;

            const img = new Image();
            if (def.img) {
                img.src = `Resources/${def.img.replace('${env}', this.environment)}`;
            } else if (def.getImg) {
                const imgData = def.getImg(this.gamemode, 0, this.mapHeight);
                if (imgData) {
                    img.src = `Resources/${imgData.img.replace('${env}', this.environment)}`;
                }
            }

            img.onerror = () => {
                if (this.environment !== 'Desert' && (def.img || '').includes('${env}')) {
                    img.src = `Resources/${(def.img || '').replace('${env}', 'Desert')}`;
                }
            };

            this.tileImages[id] = img;
        });
    }

    getTileAdjustment(tileId) {
        const envAdjustments = this.tileAdjustments[this.environment] || {};
        const defaultAdjustments = this.tileAdjustments.default || {};
        return { ...defaultAdjustments[tileId], ...envAdjustments[tileId] };
    }

    getObjectiveAdjustment(gamemode) {
        const envAdjustments = this.objectiveAdjustments[this.environment] || {};
        const defaultAdjustments = this.objectiveAdjustments.default || {};
        return { ...defaultAdjustments[gamemode], ...envAdjustments[gamemode] };
    }

    drawTile(ctx, tileId, x, y) {
        const def = this.tileDefinitions[tileId];
        if (!def) return;

        const img = this.tileImages[tileId];
        if (!img || !img.complete) return;

        // Get tile dimensions data
        let dimensions;
        if (def.name === 'Objective') {
            dimensions = this.environmentObjectiveData[this.environment]?.[this.gamemode] || 
                        this.objectiveData[this.gamemode];
        } else {
            dimensions = this.environmentTileData[this.environment]?.[def.name] || 
                        this.tileData[def.name];
        }
        if (!dimensions) return;

        const [scaleX, scaleY, offsetX, offsetY, opacity, zIndex] = dimensions;
        const tileSize = this.tileSize;

        // Calculate drawing dimensions
        const width = tileSize * scaleX * (def.size || 1);
        const height = tileSize * scaleY * (def.size || 1);
        
        // Calculate position with offsets
        const drawX = x * tileSize + (tileSize * offsetX / 100);
        const drawY = y * tileSize + (tileSize * offsetY / 100);

        // Set opacity
        ctx.globalAlpha = opacity;

        // Draw the tile
        ctx.drawImage(img, drawX, drawY, width, height);

        // Reset opacity
        ctx.globalAlpha = 1;
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

        // Group tiles by z-index
        const tilesByZIndex = new Map();
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.mapData[y][x];
                if (tileId === 0 || tileId === -1) continue;

                const def = this.tileDefinitions[tileId];
                if (!def) continue;

                let dimensions;
                if (def.name === 'Objective') {
                    dimensions = this.environmentObjectiveData[this.environment]?.[this.gamemode] || 
                                this.objectiveData[this.gamemode];
                } else {
                    dimensions = this.environmentTileData[this.environment]?.[def.name] || 
                                this.tileData[def.name];
                }
                if (!dimensions) continue;

                const zIndex = dimensions[5] || 0;
                if (!tilesByZIndex.has(zIndex)) {
                    tilesByZIndex.set(zIndex, []);
                }
                tilesByZIndex.get(zIndex).push({ x, y, tileId });
            }
        }

        // Draw tiles in z-index order
        Array.from(tilesByZIndex.keys())
            .sort((a, b) => a - b)
            .forEach(zIndex => {
                tilesByZIndex.get(zIndex).forEach(({ x, y, tileId }) => {
                    this.drawTile(this.ctx, tileId, x, y);
                });
            });

        // Draw error tiles if showErrors is enabled
        if (this.showErrors) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            for (const tilePos of this.errorTiles) {
                const [x, y] = tilePos.split(',').map(Number);
                this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
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

        // Save state before making changes - only once for the entire operation
        this.saveState();

        if (this.selectionMode === 'line') {
            // Place tiles in all hovered positions
            for (const tilePos of this.hoveredTiles) {
                const [x, y] = tilePos.split(',').map(Number);
                if (this.isErasing) {
                    this.eraseTile(x, y, false); // Pass false to prevent saving state for each tile
                } else {
                    this.placeTile(x, y, null, false); // Pass false to prevent saving state for each tile
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
                        this.eraseTile(x, y, false); // Pass false to prevent saving state for each tile
                    } else {
                        this.placeTile(x, y, null, false); // Pass false to prevent saving state for each tile
                    }
                }
            }
        }
        
        // Draw after all tiles are placed
        this.draw();
        this.checkForErrors();
    }

    placeTile(x, y, tileId = null, saveState = true) {
        const id = tileId ?? this.selectedTile.id;
        const def = this.tileDefinitions[id];
        if (!def) return;

        // Check if we can place this tile (for 2x2 tiles)
        if (def.size === 2) {
            if (x >= this.mapWidth - 1 || y >= this.mapHeight - 1) return;
            // Check if any of the 4 tiles are occupied
            for (let dy = 0; dy < 2; dy++) {
                for (let dx = 0; dx < 2; dx++) {
                    if (this.mapData[y + dy][x + dx] !== 0) return;
                }
            }
        }

        // Handle special cases for objectives
        if (def.getImg) {
            const imgData = def.getImg(this.gamemode, y, this.mapHeight);
            if (!imgData) return; // Invalid for current gamemode
        }

        // Only show Bolt in Siege mode
        if (def.showInGamemode && def.showInGamemode !== this.gamemode) return;

        // Save state before making changes if requested
        if (saveState) {
            this.saveState();
        }

        // Place the tile
        this.mapData[y][x] = id;

        // For 2x2 tiles, mark the other tiles as occupied
        if (def.size === 2) {
            this.mapData[y][x + 1] = -1;
            this.mapData[y + 1][x] = -1;
            this.mapData[y + 1][x + 1] = -1;
        }

        // Handle mirroring
        if (this.mirrorVertical || this.mirrorHorizontal || this.mirrorDiagonal) {
            // Calculate mirror positions first
            const mirrorY = this.mapHeight - 1 - y;
            const mirrorX = this.mapWidth - 1 - x;

            // For 2x2 tiles, we need to adjust the mirror position
            const size = def.size || 1;
            
            // Get mirrored tile ID (for jump pads)
            const mirrorV = this.getMirroredTileId(id, 'vertical');
            const mirrorH = this.getMirroredTileId(id, 'horizontal');
            const mirrorD = this.getMirroredTileId(id, 'diagonal');

            // Helper function to place a tile and its occupied spaces
            const placeMirroredTile = (ty, tx, mid) => {
                if (ty < 0 || ty >= this.mapHeight || tx < 0 || tx >= this.mapWidth) return;
                if (size === 2) {
                    if (tx >= this.mapWidth - 1 || ty >= this.mapHeight - 1) return;
                    // Check if any tiles are occupied
                    for (let dy = 0; dy < 2; dy++) {
                        for (let dx = 0; dx < 2; dx++) {
                            if (this.mapData[ty + dy][tx + dx] !== 0) return;
                        }
                    }
                    // Place the tile and mark occupied spaces
                    this.mapData[ty][tx] = mid;
                    this.mapData[ty][tx + 1] = -1;
                    this.mapData[ty + 1][tx] = -1;
                    this.mapData[ty + 1][tx + 1] = -1;
                } else {
                    this.mapData[ty][tx] = mid;
                }
            };

            // Apply vertical mirroring - for 2x2 tiles, adjust by 1 tile back in rows
            if (this.mirrorVertical) {
                const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                placeMirroredTile(adjustedY, x, mirrorV);
            }

            // Apply horizontal mirroring - for 2x2 tiles, adjust by 1 tile back in columns
            if (this.mirrorHorizontal) {
                const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                placeMirroredTile(y, adjustedX, mirrorH);
            }

            // Apply diagonal mirroring - for 2x2 tiles, adjust by 1 tile back in both rows and columns
            if (this.mirrorDiagonal) {
                const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                placeMirroredTile(adjustedY, adjustedX, mirrorD);
            }
        }

        if (saveState) {
            this.draw();
            this.checkForErrors();
        }
    }

    getMirroredTileId(tileId, direction) {
        const def = this.tileDefinitions[tileId];
        if (!def || !def.mirrorMap) return tileId;

        // Handle jump pad mirroring
        if (def.name.startsWith('Jump')) {
            const mirrorMaps = {
                'R': { vertical: 'R', horizontal: 'L', diagonal: 'L' },
                'L': { vertical: 'L', horizontal: 'R', diagonal: 'R' },
                'T': { vertical: 'B', horizontal: 'T', diagonal: 'B' },
                'B': { vertical: 'T', horizontal: 'B', diagonal: 'T' },
                'TR': { vertical: 'BR', horizontal: 'TL', diagonal: 'BL' },
                'TL': { vertical: 'BL', horizontal: 'TR', diagonal: 'BR' },
                'BR': { vertical: 'TR', horizontal: 'BL', diagonal: 'TL' },
                'BL': { vertical: 'TL', horizontal: 'BR', diagonal: 'TR' }
            };

            const currentDirection = def.name.split(' ')[1];
            const mirroredDirection = mirrorMaps[currentDirection][direction];

            // Find tile ID by mirrored name
            const mirroredDef = Object.entries(this.tileDefinitions)
                .find(([_, d]) => d.name === `Jump ${mirroredDirection}`);
            return mirroredDef ? parseInt(mirroredDef[0]) : tileId;
        }

        return tileId;
    }

    eraseTile(x, y, saveState = true) {
        if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) return;

        // Save state before making changes if requested
        if (saveState) {
            this.saveState();
        }

        // Check if this is part of a 2x2 tile
        const tileId = this.mapData[y][x];
        const def = this.tileDefinitions[tileId];
        const isPartOf2x2 = def && def.size === 2;
        
        // If this is part of a 2x2 tile, we need to find the top-left corner
        let startX = x;
        let startY = y;
        
        if (isPartOf2x2) {
            // Find the top-left corner of the 2x2 tile
            if (x > 0 && this.mapData[y][x-1] === -1) {
                startX = x - 1;
            }
            if (y > 0 && this.mapData[y-1][startX] === -1) {
                startY = y - 1;
            }
            
            // Erase the entire 2x2 tile
            for (let dy = 0; dy < 2; dy++) {
                for (let dx = 0; dx < 2; dx++) {
                    if (startY + dy < this.mapHeight && startX + dx < this.mapWidth) {
                        this.mapData[startY + dy][startX + dx] = 0;
                    }
                }
            }
        } else {
            // Just erase the single tile
            this.mapData[y][x] = 0;
        }

        // Apply mirroring
        if (this.mirrorVertical || this.mirrorHorizontal || this.mirrorDiagonal) {
            // Calculate mirror positions
            const mirrorY = this.mapHeight - 1 - startY;
            const mirrorX = this.mapWidth - 1 - startX;
            
            // For 2x2 tiles, adjust the mirror position
            const size = isPartOf2x2 ? 2 : 1;
            
            // Helper function to erase a tile and its occupied spaces
            const eraseMirroredTile = (ty, tx) => {
                if (ty < 0 || ty >= this.mapHeight || tx < 0 || tx >= this.mapWidth) return;
                if (size === 2) {
                    if (tx >= this.mapWidth - 1 || ty >= this.mapHeight - 1) return;
                    // Erase the entire 2x2 tile
                    for (let dy = 0; dy < 2; dy++) {
                        for (let dx = 0; dx < 2; dx++) {
                            if (ty + dy < this.mapHeight && tx + dx < this.mapWidth) {
                                this.mapData[ty + dy][tx + dx] = 0;
                            }
                        }
                    }
                } else {
                    this.mapData[ty][tx] = 0;
                }
            };

            // Apply vertical mirroring - for 2x2 tiles, adjust by 1 tile back in rows
            if (this.mirrorVertical) {
                const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                eraseMirroredTile(adjustedY, startX);
            }

            // Apply horizontal mirroring - for 2x2 tiles, adjust by 1 tile back in columns
            if (this.mirrorHorizontal) {
                const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                eraseMirroredTile(startY, adjustedX);
            }

            // Apply diagonal mirroring - for 2x2 tiles, adjust by 1 tile back in both rows and columns
            if (this.mirrorDiagonal) {
                const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                eraseMirroredTile(adjustedY, adjustedX);
            }
        }

        if (saveState) {
            this.draw();
            this.checkForErrors();
        }
    }

    clearMap() {
        if (confirm('Are you sure you want to clear the map?')) {
            // Save state before making changes
            this.saveState();

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
        const mapName = document.getElementById('mapName').value || 'Untitled Map';
        const canvas = document.createElement('canvas');
        canvas.width = this.mapWidth * this.tileSize;
        canvas.height = this.mapHeight * this.tileSize;
        const ctx = canvas.getContext('2d');

        // Draw background grid
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const isDark = (x + y) % 2 === 0;
                const bgImg = isDark ? this.bgDark : this.bgLight;
                
                if (bgImg.complete) {
                    ctx.drawImage(
                        bgImg,
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }

        // Group tiles by z-index
        const tilesByZIndex = new Map();

        // Collect tiles by z-index
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.mapData[y][x];
                if (tileId === 0 || tileId === -1) continue;

                const def = this.tileDefinitions[tileId];
                if (!def) continue;

                let dimensions;
                if (def.name === 'Objective') {
                    dimensions = this.environmentObjectiveData[this.environment]?.[this.gamemode] || 
                                this.objectiveData[this.gamemode];
                } else {
                    dimensions = this.environmentTileData[this.environment]?.[def.name] || 
                                this.tileData[def.name];
                }
                if (!dimensions) continue;

                const zIndex = dimensions[5] || 0;
                if (!tilesByZIndex.has(zIndex)) {
                    tilesByZIndex.set(zIndex, []);
                }
                tilesByZIndex.get(zIndex).push({ x, y, tileId });
            }
        }

        // Draw tiles in z-index order
        Array.from(tilesByZIndex.keys())
            .sort((a, b) => a - b)
            .forEach(zIndex => {
                tilesByZIndex.get(zIndex).forEach(({ x, y, tileId }) => {
                    this.drawTile(ctx, tileId, x, y);
                });
            });

        // Export with map name
        const link = document.createElement('a');
        link.download = `${mapName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    setGamemode(gamemode) {
        this.gamemode = gamemode;
        this.loadTileImages();
        this.initializeTileSelector();
        this.draw();
    }

    setEnvironment(environment) {
        this.environment = environment;
        this.loadEnvironmentBackgrounds();
        this.loadTileImages();
        this.initializeTileSelector();
        this.draw();
    }

    toggleReplaceMode() {
        this.replaceMode = !this.replaceMode;
        
        // Update UI
        const replaceBtn = document.getElementById('replaceBtn');
        if (replaceBtn) {
            replaceBtn.checked = this.replaceMode;
            replaceBtn.parentElement.classList.toggle('active', this.replaceMode);
        }
    }

    handleReplace(x, y) {
        // Get the source tile ID (the tile that was clicked)
        const sourceId = this.mapData[y][x];
        if (sourceId === undefined) return;
        
        // Get the target tile ID (the currently selected tile)
        const targetId = this.selectedTile.id;
        
        // Save state before making changes
        this.saveState();
        
        // Replace all instances of the source tile with the target tile
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.mapData[y][x] === sourceId) {
                    this.mapData[y][x] = targetId;
                }
            }
        }
        
        // Draw the updated map
        this.draw();
        
        // Turn off replace mode
        this.toggleReplaceMode();
    }

    // Add new methods for the shortcuts
    setSelectionMode(mode) {
        if (this.mouseDown) return;
        this.selectionMode = mode;
        // Update UI to reflect the change
        document.querySelectorAll('input[name="selectionMode"]').forEach(radio => {
            radio.checked = radio.value === mode;
        });
    }

    toggleMirroring() {
        // Get the mirror checkboxes
        const mirrorCheckboxes = [
            document.getElementById('mirrorDiagonal'),
            document.getElementById('mirrorVertical'),
            document.getElementById('mirrorHorizontal')
        ];
        
        // Store the current states
        const previousStates = mirrorCheckboxes.map(checkbox => checkbox.checked);
        
        // If any mirroring was active, disable all
        if (previousStates.some(state => state)) {
            // Store the previous states for later restoration
            this.previousMirrorStates = previousStates;
            
            // Disable all mirroring
            mirrorCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.style.borderColor = '#ff4444'; // Red border for active checkboxes
            });
            
            // Update the internal state
            this.mirrorDiagonal = false;
            this.mirrorVertical = false;
            this.mirrorHorizontal = false;
        } else {
            // If we have previous states stored, restore them
            if (this.previousMirrorStates) {
                mirrorCheckboxes.forEach((checkbox, index) => {
                    checkbox.checked = this.previousMirrorStates[index];
                    checkbox.style.borderColor = ''; // Reset border color
                });
                
                // Update the internal state
                this.mirrorDiagonal = this.previousMirrorStates[0];
                this.mirrorVertical = this.previousMirrorStates[1];
                this.mirrorHorizontal = this.previousMirrorStates[2];
                
                // Clear the stored states
                this.previousMirrorStates = null;
            } else {
                // If no previous states, just reset the border colors
                mirrorCheckboxes.forEach(checkbox => {
                    checkbox.style.borderColor = '';
                });
            }
        }
        
        this.draw();
    }

    toggleEraseMode() {
        this.isErasing = !this.isErasing;
        const eraseBtn = document.getElementById('eraseBtn');
        eraseBtn.checked = this.isErasing;
        eraseBtn.parentElement.classList.toggle('active', this.isErasing);
    }

    // Add method to check if a tile is a block
    isBlock(tileId) {
        const blockIds = [1, 3, 4, 5, 6, 8, 9, 11]; // IDs for Wall, Wall2, Crate, Barrel, Cactus, Water, Fence, Rope Fence, Unbreakable
        return blockIds.includes(tileId);
    }
    
    // Add method to check if two blocks are connected in a continuous line
    areBlocksConnected(x1, y1, x2, y2) {
        // Check if they're adjacent (including diagonally)
        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);
        return dx <= 1 && dy <= 1;
    }
    
    // Add method to check for errors
    checkForErrors() {
        if (!this.showErrors) return;
        
        this.errorTiles.clear();
        
        // Check each tile in the map
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.mapData[y][x];
                
                // Skip if the tile is a block or empty
                if (this.isBlock(tileId)) continue;
                
                // Count adjacent blocks
                let blockCount = 0;
                const blocks = [];
                
                // Check all 8 surrounding tiles
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx < 0 || nx >= this.mapWidth || ny < 0 || ny >= this.mapHeight) continue;
                        
                        const neighborId = this.mapData[ny][nx];
                        if (this.isBlock(neighborId)) {
                            blockCount++;
                            blocks.push({x: nx, y: ny});
                        }
                    }
                }
                
                // If there are at least 2 blocks, check if they form a continuous line
                if (blockCount >= 2) {
                    let hasError = false;
                    
                    // Check all pairs of blocks
                    for (let i = 0; i < blocks.length; i++) {
                        for (let j = i + 1; j < blocks.length; j++) {
                            if (blocks[i].x !== x && blocks[j].x !== x && blocks[i].y !== y && blocks[j].y !== y) continue;
                            // If these two blocks are not connected, we have an error
                            if (!this.areBlocksConnected(blocks[i].x, blocks[i].y, blocks[j].x, blocks[j].y)) {
                                hasError = true;
                                break;
                            }


                        }
                        if (hasError) break;
                    }
                    
                    if (hasError) {
                        this.errorTiles.add(`${x},${y}`);
                    }
                }
            }
        }
    }

    // Add toggleShowErrors method
    toggleShowErrors() {
        this.showErrors = !this.showErrors;
        
        // Update UI
        const showErrorsBtn = document.getElementById('errorsBtn');
        if (showErrorsBtn) {
            showErrorsBtn.checked = this.showErrors;
        }
        
        // Clear error tiles if deactivated
        if (!this.showErrors) {
            this.errorTiles.clear();
        } else {
            // Check for errors if activated
            this.checkForErrors();
        }
        
        this.draw();
    }
}

// Initialize the map maker when the page loads
window.addEventListener('load', () => {
    new MapMaker('mapCanvas');
});

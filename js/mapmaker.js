// Constants for fence logic types
const FENCE_LOGIC_TYPES = {
    SIMPLE_BLOCK: 1,    // Logic 1: Block, horizontal, vertical
    BINARY_CODE: 2,     // Logic 2: Binary code system (0001, 0010, etc.)
    SIX_PIECE: 3,       // Logic 3: Hor, Ver, TL, TR, BL, BR
    FOUR_PIECE: 4       // Logic 4: Single, T, TR, R
};

// Map environments to their fence logic types
const FENCE_LOGIC_BY_ENVIRONMENT = {
    // To be filled with actual environment mappings
    // Example: 'Desert': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Desert': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Mine': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Oasis': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Grassy_Field': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Wasteland': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Holiday': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'City': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Retropolis': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Mortuary': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Pirate_Ship': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Arcade': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Stadium': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Bazaar': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Super_City': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Gift_Shop': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Bandstand': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Snowtel': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Scrapyard': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Starr_Force': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Wild_West': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Water_Park': FENCE_LOGIC_TYPES.SIX_PIECE,
    'Castle_Courtyard': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Brawlywood': FENCE_LOGIC_TYPES.FOUR_PIECE,
    'Fighting_Game': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Biodome': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Stunt_Show': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Deep_Sea': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Robot_Factory': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Ghost_Station': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Candyland': FENCE_LOGIC_TYPES.BINARY_CODE,
    'The_Hub': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Rumble_Jungle': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Enchanted_Woods': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Circus': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Starr_Toon': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Swamp_of_Love': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Rooftop': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Coin_Factory': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Ice_Island': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Medieval_Manor': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Super_City_2': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Spongebob': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Oddities_Shop': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Skating_Bowl': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Hockey': FENCE_LOGIC_TYPES.SIX_PIECE,
    'Escape_Room': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Tropical_Island': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Brawl_Arena': FENCE_LOGIC_TYPES.SIX_PIECE
};

const BORDER_FENCE_LOGIC_BY_ENVIRONMENT = {
    'Tropical_Island': FENCE_LOGIC_TYPES.BINARY_CODE,
};

class FenceLogicHandler {
    constructor() {
        this.logicImplementations = {
            [FENCE_LOGIC_TYPES.SIMPLE_BLOCK]: this.handleSimpleBlockLogic,
            [FENCE_LOGIC_TYPES.BINARY_CODE]: this.handleBinaryCodeLogic,
            [FENCE_LOGIC_TYPES.SIX_PIECE]: this.handleSixPieceLogic,
            [FENCE_LOGIC_TYPES.FOUR_PIECE]: this.handleFourPieceLogic
        };
    }

    getFenceImageName(x, y, mapData, environment, isFence = true, isBorder = false) {
        
        // Determine which logic to use based on environment
        const logicType = isBorder ? BORDER_FENCE_LOGIC_BY_ENVIRONMENT[environment] : isFence ? FENCE_LOGIC_BY_ENVIRONMENT[environment] : FENCE_LOGIC_TYPES.FOUR_PIECE;
        
        // Get the implementation for this logic type
        const logicHandler = this.logicImplementations[logicType];
        if (!logicHandler) {
            console.error(`No handler found for fence logic type: ${logicType}`);
            return 'Fence'; // Default fallback
        }

        // Get connections (true if connected, false if not)
        const connections = this.getConnections(x, y, mapData, isFence, isBorder, environment);
        
        // Call the appropriate logic handler
        const result = isBorder ? 'B' + logicHandler.call(this, connections) : logicHandler.call(this, connections);
        return result;
    }

    getConnections(x, y, mapData, isFence, isBorder, environment) {
        const height = mapData.length;
        const width = mapData[0].length;
        
        // Helper function to check if a tile is a fence/rope
        const isSameType = (x, y) => {
            if (x < 0 || x >= width || y < 0 || y >= height) return false;
            const tileId = mapData[y][x];
            if (environment === 'Brawl_Arena') return tileId === 40 || tileId === 43 || tileId === 44;
            if (isBorder) return tileId === 45;
            return isFence ? (tileId === 7) : (tileId === 9); // Assuming 7 is fence and 9 is rope
        };

        return {
            top: isSameType(x, y - 1),
            right: isSameType(x + 1, y),
            bottom: isSameType(x, y + 1),
            left: isSameType(x - 1, y)
        };
    }

    handleSimpleBlockLogic(connections) {
        const { top, right, bottom, left } = connections;
        
        // Horizontal case: connected on both sides but not top/bottom
        if (left && right && !top && !bottom) return 'Horizontal';
        
        // Vertical case: connected on top/bottom but not sides
        if (top && bottom && !left && !right) return 'Vertical';
        
        // Default to block for all other cases
        return 'Fence';
    }

    handleBinaryCodeLogic(connections) {
        const { top, right, bottom, left } = connections;
        
        // Convert connections to binary string
        const code = [top, left, right, bottom].map(c => c ? '1' : '0').join('');
        
        // Handle special cases first
        const connectedCount = (top ? 1 : 0) + (right ? 1 : 0) + (bottom ? 1 : 0) + (left ? 1 : 0);
        
        if (connectedCount >= 3) {
            // If two sides are connected, use 0110
            if (left && right) return 'Fence';
            // Otherwise use 1001
            return '1001';
        }

        // For two or fewer connections
        if (left && right) return 'Fence';  // Priority to horizontal connection
        if (!left && !right && !top && !bottom) return 'Fence'; // Default when no side connections
        
        // Check if the binary code is one of the valid combinations
        const validCodes = ['0001', '0010', '0011', '0100', '0101', 'Fence', 
                           '1000', '1001', '1010', '1100'];
        
        return validCodes.includes(code) ? code : '0110'; // Default to 0110 if invalid
    }

    handleSixPieceLogic(connections) {
        const { top, right, bottom, left } = connections;
        
        // Handle corners first
        if (top && right && !bottom && !left) return 'TR';
        if (top && left && !bottom && !right) return 'TL';
        if (bottom && right && !top && !left) return 'BR';
        if (bottom && left && !top && !right) return 'BL';
        
        // Handle vertical cases
        if ((top || bottom) && (!right && !left) || // Connected vertically and not horizontally
            (top && bottom && (left || right))) { // Three connections with two vertical 
            return 'Ver';
        }
        
        // All other cases use horizontal
        return 'Fence';
    }

    handleFourPieceLogic(connections) {
        const { top, right } = connections;
        
        if (top && right) return 'TR';
        if (top) return 'T';
        if (right) return 'R';
        return 'Fence';
    }
}

export class MapMaker {
    constructor(canvasId, headless = false) {
        if (typeof canvasId === 'string') {
            this.canvas = document.getElementById(canvasId);
        } else {
            this.canvas = canvasId;
        }

        if (!this.canvas) {
            throw new Error('Canvas not found');
        }

        this.headless = headless;
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        this.canvasPadding = 16;  // Add padding for the canvas

        this.tileImages = {};
        
        // Map size configurations
        this.mapSizes = {
            regular: { width: 21, height: 33 },
            showdown: { width: 60, height: 60 },
            arena: { width: 59, height: 59 },
            siege: { width: 27, height: 39 },
            volley: { width: 21, height: 25 },
            basket: { width: 21, height: 17 }
        };
        
        // Initialize with default size (regular)
        this.mapWidth = this.mapSizes.regular.width;
        this.mapHeight = this.mapSizes.regular.height;
        this.mapSize = this.mapSizes.regular;
        
        // Initialize undo/redo stacks
        this.undoStack = [];
        this.redoStack = [];
        
        this.zoomLevel = 1;
        this.minZoom = 0.25;  // Allow zooming out more
        this.maxZoom = 3;     // Allow zooming in more
        this.zoomStep = 0.1;  // Make zoom steps smaller for more gradual zooming

        this.updateCanvasSize();

        // Initialize map data
        this.mapData = Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));
        
        this.selectedTile = { id: 1, name: 'Wall', color: '#666666' };
        this.selectedTiles = [];
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
        this.blue2Red = false;

        // Game settings
        this.gamemode = 'Gem_Grab';
        this.environment = 'Desert';
        this.goalImages = [];
        this.goalImageCache = {}; // key: goalName+env, value: loaded Image


        // Selection mode
        this.selectionMode = 'single';
        this.selectionStart = null;
        this.selectionEnd = null;
        this.hoveredTiles = new Set();
        this.errorTiles = new Set();
        this.mouseDown = false;

        this.showErrors = false;
        this.showGuides = false; 

        // Environment and background
        this.bgDark = new Image();
        this.bgLight = new Image();

        // Initialize tile data
        this.tileData = {
            'Wall': [1, 1.75, 0, -50, 1, 5],
            'Bush': [1, 1.8, 0, -51, 1, 5],
            'Wall2': [1, 1.75, 0, -50, 1, 5],
            'Crate': [1, 1.8, 0, -51, 1, 5],
            'Barrel': [1, 1.69, 0, -42.5, 1, 5],
            'Cactus': [1*1.1, 1.67*1.1, -5, -51, 1, 5],
            'Water': [1, 1, 0, 0, 1, 5],
            // Base fence types
            'Fence': [1, 1.61, 0, -40, 1, 5],
            'Rope Fence': [1, 1.75, 0, -50, 1, 5],
            // Simple Block Logic variations
            'Horizontal': [1.05, 1.323, -2.5, -12.5, 1, 5],
            'Vertical': [1, 1.84, 0, -50, 1, 5],
            // Binary Code Logic variations
            '0001': [1/1.39, 1.39/1.39, 15, -28, 1, 5],
            '0010': [1, 1.85, 0, -55, 1, 5],
            '0011': [1/1.2, 1.85, 17, -55, 1, 5],
            '0100': [1, 1.85, 0, -55, 1, 5],
            '0101': [1/1.14, 1.85, 0, -55, 1, 5],
            '0110': [1, 1.75, 0, -50, 1, 5],
            '1000': [1/1.39, 1.83/1.39, 15, -30, 1, 5],
            '1001': [1/1.39, 1.44/1.39, 15, -30, 1, 5],
            '1010': [1/1.18, 2.1, 16, -80, 1, 5],
            '1100': [1/1.15, 2.3, 0, -100, 1, 5],
            // Six Piece Logic variations
            'TL': [1, 1.75, 0, -50, 1, 5],
            'TR': [1, 1.75, 0, -50, 1, 5],
            'BL': [1, 1.75, 0, -50, 1, 5],
            'BR': [1, 1.75, 0, -50, 1, 5],
            'Ver': [1, 1.75, 0, -50, 1, 5],
            // Four Piece Logic variations
            'T': [1, 1.75, 0, -50, 1, 5],
            'R': [1, 1.75, 0, -50, 1, 5],
            // Rope Fence variations
            'Post': [1, 1.8, 0, -50, 1, 5],
            'Post_TR': [1.5, 2.47, 0, -116.75, 1, 5],
            'Post_R': [1.5, 1.8, 0, -50, 1, 5],
            'Post_T': [1, 2.47, 0, -116.75, 1, 5],
            // Border Fence Variations Binary Code
            'B0001': [1, 1.6, 0, -55, 1, 5],
            'B0010': [1, 1.8, 0, -55, 1, 5],
            'B0011': [1, 1.5, 0, -55, 1, 5],
            'B0100': [1, 1.8, 0, -55, 1, 5],
            'B0101': [1, 1.5, 0, -55, 1, 5],
            'B1000': [1, 1.8, 0, -55, 1, 5],
            'B1001': [1, 1.05, 0, -55, 1, 5],
            'B1010': [1, 2, 0, -75, 1, 5],
            'B1100': [1, 2, 0, -75, 1, 5],
            'BFence': [1, 1.80, 0, -55, 1, 5],
            'Skull': [1, 1.08, 0, 0, 1, 5],
            'Unbreakable': [1, 1.75, 0, -50, 1, 5],
            'Blue Spawn': [1.7, 1.7, -35, -35, 0.85, 5],
            'Red Spawn': [1.7, 1.7, -35, -35, 0.85, 5],
            'Blue Respawn': [1.7, 1.7, -35, -35, 0.85, 5],
            'Red Respawn': [1.7, 1.7, -35, -35, 0.85, 5],
            'Trio Spawn': [1.7, 1.7, -27.5, -27.5, 0.85, 5],
            'Objective': [2, 2.21, -50, -115, 1, 10],
            'Smoke': [1*1.4, 1.1*1.4, -15, -35, 1, 5],
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
            'Bolt': [1, 1.18, 0, 0, 1, 5],
            'Box': [1, 1.75, 0, -50, 1, 5],
            'Boss Zone': [7, 7, -300, -300, 1, 10],
            'Monster Zone': [7, 7, -300, -300, 1, 10],
            'Track': [1, 1, 0, 0, 1, 2],
            'Base Ike Blue': [5, 6.12, -200, -270, 1, 10],
            'Small Ike Blue': [3, 3.82, -100, -145, 1, 10],
            'Base Ike Red': [5, 6.12, -200, -270, 1, 10],
            'Small Ike Red': [3, 3.4825, -100, -110, 1, 10],
        };

        // Initialize objective data
        this.objectiveData = {
            'Gem_Grab': [2, 2, -50, -50, 1, 10],
            'Heist': [2, 2.21, -50, -115, 1, 10],
            'Bounty': [1.15, 2.0585, -10, -50, 1, 10],
            'Brawl_Ball': [1.3, 1.495, -15, -20, 1, 10],
            'Hot_Zone': [7, 7, -300, -300, 1, 10],
            'Snowtel_Thieves': [4, 4, -150, -150, 1, 2],
            'Basket_Brawl': [1.3, 1.495, -20, -20, 1, 10],
            'Volley_Brawl': [1.3, 1.495, -20, -20, 1, 10],
            'Siege': [2.5, 3.1, -60, -175, 1, 10],
            'Hold_The_Trophy': [2.5, 2.5, -75, -75, 1, 10]
        };

        // Initialize environment data
        this.environmentObjectiveData = {
            Bazaar: {
                'Gem_Grab': [2, 2.24, -50, -60, 1, 10],
            },
            City: {
                'Gem_Grab': [2, 2.24, -50, -60, 1, 10],
            },
            Snowtel: {
                'Gem_Grab': [2, 2.24, -50, -60, 1, 10],
            },
            Castle_Courtyard: {
                'Gem_Grab': [2, 2.24, -50, -60, 1, 10],
            },
            Arcade: {
                'Gem_Grab': [2, 2.24, -50, -60, 1, 10],
            },
            Bandstand: {
                'Gem_Grab': [2, 2.24, -50, -60, 1, 10],
            },
            Retropolis: {
                'Gem_Grab': [2, 2.24, -50, -60, 1, 10],
            },
            Oddities_Shop: {
                'Gem_Grab': [2.7, 2.376, -85, -70, 1, 10]
            },
            Swamp_of_Love: {
                'Gem_Grab': [2*1.1, 2.09*1.1, -55, -60, 1, 10]
            },
            Fighting_Game: {
                'Gem_Grab': [2*1.1, 2.09*1.1, -55, -60, 1, 10],
                'Heist': [2*0.9, 3.56*0.9, -37.5, -95, 1, 10]
            }
        };

        this.environmentTileData = {
            Mine: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1*1.1, 1.65*1.1, -5, -50, 1, 5],
                'Cactus': [1, 1.68, 0, -50, 1, 5],
            },
            Arcade: {
                'Wall': [1, 1.8, 0, -55, 1, 5],
                'Barrel': [1, 1.91, 0, -61, 1, 5],
                'Cactus': [1, 1.71, 0, -48, 1, 5],
                'Skull': [1, 1.51, 0, -45, 1, 5],
                'Fence': [1, 1.63, 0, -55, 1, 5],
                'Horizontal': [1.1, 1.54, -5, -45, 1, 5],
                'Vertical': [1, 1.71, 0, -48, 1, 5],
            },
            Bandstand:{
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Fence': [1, 1.85, 0, -55, 1, 5],
                'Skull': [1*1.1, 1.59*1.1, -5, -42.5, 1, 5],
            },
            Castle_Courtyard: {
                'Bush': [1, 1.75, 0, -50, 1, 5],
                'Cactus': [1, 1.64, 0, -45, 1, 5],
                'Skull': [1, 1.28, 0, -25, 1, 5],
                'Crate': [1, 1.75, 0, -55, 1, 5],
                'Fence': [1, 1.8, 0, -55, 1, 5],
                'Horizontal': [1, 1.54, 0, -40, 1, 5],
                'Vertical': [1, 1.75, 0, -50, 1, 5],
            },
            Bazaar: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Fence': [1, 1.85, 0, -55, 1, 5],
                'Crate': [1*1.1, 1.63*1.1, -5, -50, 1, 5],
                'Cactus': [1, 1.62, 0, -45, 1, 5],
                'Skull': [1*1.1, 1.59*1.1, -5, -42.5, 1, 5],
            },
            Oddities_Shop: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.88, 0, -58.5, 1, 5],
                'Fence': [1, 1.80, 0, -55, 1, 5],
                'Crate': [1, 1.63, 0, -55, 1, 5],
                'Cactus': [1, 1.62, 0, -50, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -55, 1, 5],
                '0011': [1, 1.5, 0, -55, 1, 5],
                '0100': [1, 1.8, 0, -55, 1, 5],
                '0101': [1, 1.5, 0, -55, 1, 5],
                '1000': [1, 1.8, 0, -55, 1, 5],
                '1001': [1, 1.05, 0, -55, 1, 5],
                '1010': [1, 2, 0, -75, 1, 5],
                '1100': [1, 2, 0, -75, 1, 5],
                'Post': [1, 1.75, 0, -50, 1, 5],
                'Post_TR': [1.5, 2.565, 0, -132.5, 1, 5],
                'Post_R': [1.5, 1.7475, 0, -50, 1, 5],
                'Post_T': [1, 2.61, 0, -130, 1, 5],
            },
            Super_City_2: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Crate': [1, 1.8, 0, -51, 1, 5],
                'Barrel': [1, 1.81, 0, -51, 1, 5],
                'Skull': [1, 1.8, 0, 51, 1, 5],
                'B0001': [1, 1.6, 0, -55, 1, 5],
                'B0010': [1, 1.8, 0, -55, 1, 5],
                'B0011': [1, 1.5, 0, -55, 1, 5],
                'B0100': [1, 1.8, 0, -55, 1, 5],
                'B0101': [1, 1.5, 0, -55, 1, 5],
                'B1000': [1, 1.8, 0, -55, 1, 5],
                'B1001': [1, 1.05, 0, -55, 1, 5],
                'B1010': [1, 2, 0, -75, 1, 5],
                'B1100': [1, 2, 0, -75, 1, 5],
                'BFence': [1, 1.80, 0, -55, 1, 5],
            },
            Swamp_of_Love: {
                'Horizontal': [1.05, 1.323, -2.5, -25, 1, 5],
                'Cactus': [1*1.2, 1.36*1.2, -10, -40, 1, 5]
            },
            Tropical_Island: {
                'Cactus': [1.8, 2.45, -40, -100, 1, 5.5],
                'Skull': [1*1.1, 1.59*1.1, -5, -42.5, 1, 5],
                'Post': [1, 2, 0, -75, 1, 5],
                'Post_TR': [2/1.465, 2.18, 0, -92.5, 1, 5],
                'Post_R': [2/1.465, 2, 0, -75, 1, 5],
                'Post_T': [1, 2.18, 0, -92.5, 1, 5],
                'Horizontal': [1, 1.26, 0, -10, 1, 5],                
            },
            Oasis: {
                'Wall2': [1, 1.8, 0, -50, 1, 5],
                'Skull': [1*1.1, 1.59*1.1, -5, -42.5, 1, 5],
            },
            City: {
              'Horizontal': [1.05, 1.323, -2.5, -15, 1, 5],
              'Cactus': [1, 2.2, 0, -82.5, 1, 5],
              'Wall': [1, 1.76, 0, -50, 1, 5],
            },
            Retropolis: {
                'Wall2': [1, 1.79, 0, -51, 1, 5],
                'Barrel': [1, 1.81, 0, -51, 1, 5],
                'Cactus': [1, 2.2, 0, -82.5, 1, 5],
                'Skull': [1, 1.51, 0, -45, 1, 5],
                'Fence': [1, 1.49, 0, -45, 1, 5],
                '0001': [1/1.39, 1.39/1.39, 15, -28, 1, 5],
                '0010': [1, 1.49, 0, -45, 1, 5],
                '0011': [1, 1.5, 0, -45, 1, 5],
                '0100': [1, 1.49, 0, -45, 1, 5],
                '0101': [1, 1.5, 0, -45, 1, 5],
                '0110': [1, 1.75, 0, -50, 1, 5],
                '1000': [1/1.39, 1.83/1.39, 15, -30, 1, 5],
                '1001': [1/1.39, 1.44/1.39, 15, -30, 1, 5],
                '1010': [1, 1.65, 0, -60, 1, 5],
                '1100': [1, 1.65, 0, -60, 1, 5],
            },
            Mortuary: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Cactus': [1*1.1, 1.42*1.1, -5, -27.5, 1, 5],
                'Skull': [1, 1.49, 0, -20, 1, 5],
                'Horizontal': [1, 1.67, 0, -37.5, 1, 5],
                'Fence': [1, 1.85, 0, -55, 1, 5]
            },
            Stadium: {
                'Cactus': [1, 2.2, 0, -82.5, 1, 5],
                'Fence': [1, 1.63, 0, -55, 1, 5],
                'Horizontal': [1.1, 1.54, -5, -45, 1, 5],
                'Vertical': [1, 1.71, 0, -48, 1, 5],
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.79, 0, -51, 1, 5],
                'Barrel': [1, 1.81, 0, -51, 1, 5],
            },
            Snowtel: {
                'Horizontal': [1.05, 1.323, -2.5, -15, 1, 5],
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Skull': [1*1.1, 1.22*1.1, -5, -30, 1, 5]
            },
            Wild_West: {
                'Wall': [1*1.1, 1.63*1.1, -5, -50, 1, 5],
                'Wall2': [1*1.1, 1.63*1.1, -5, -50, 1, 5],
                'Skull': [1*1.1, 1.22*1.1, -5, -5, 1, 5]
            },
            Holiday: {
                'Wall': [1*1.05, 1.73*1.05, -2.5, -55, 1, 5],
                'Wall2': [1*1.1, 1.64*1.1, -5, -50, 1, 5],
                'Barrel': [1, 1.83, 0, -52, 1, 5],
                'Skull': [1*1.1, 1.22*1.1, -5, -5, 1, 5]
            },
            Fighting_Game: {
                'Cactus': [1*1.1, 1.63*1.1, -5, -50, 1, 5],
                'Bush': [1, 1.75, 0, -50, 1, 5],
                'Skull': [1, 1.7, 0, -49, 1, 5],
                'Barrel': [1, 1.75, 0, -50, 1, 5],
                'Post': [1*0.6, 2.83*0.6, 20, -50, 1, 5],
                'Post_TR': [1*1.15, 1.87*1.15, 20, -95, 1, 5],
                'Post_R': [1*1.15, 1.48*1.15, 20, -50, 1, 5],
                'Post_T': [1*0.6, 3.58*0.6, 20, -95, 1, 5],
                'Fence': [1, 1.7, 0, -47.5, 1, 5],
                '0001': [1/1.39, 1.39/1.39, 15, -28, 1, 5],
                '0010': [1, 1.7, 0, -47.5, 1, 5],
                '0011': [1*0.875, 2*0.85, 15.25, -48, 1, 5],
                '0100': [1, 1.7, 0, -47.5, 1, 5],
                '0101': [1*0.875, 2*0.85, 0, -48, 1, 5],
                '0110': [1, 1.75, 0, -50, 1, 5],
                '1000': [1/1.39, 1.83/1.39, 15, -30, 1, 5],
                '1001': [1/1.39, 1.44/1.39, 15, -30, 1, 5],
                '1010': [1*0.875, 2.47*0.85, 15.25, -87.5, 1, 5],
                '1100': [1*0.875, 2.47*0.85, 0, -87.5, 1, 5],
            }
        };
        
        // Initialize tile definitions
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
            9: { name: 'Rope Fence', img: '${env}/Rope/Post.png', size: 1 },
            10: { name: 'Skull', img: '${env}/Tiles/Skull.png', size: 1 },
            11: { name: 'Unbreakable', img: 'Global/Unbreakable.png', size: 1 },
            12: { name: 'Blue Spawn', size: 1, getImg: (gamemode) => {
                return { img: gamemode === 'Showdown' ? 'Global/Spawns/3.png' : 'Global/Spawns/1.png' };
            }},
            13: { name: 'Red Spawn', size: 1, getImg: (gamemode) => {
                return { img: gamemode === 'Showdown' ? 'Global/Spawns/4.png' : 'Global/Spawns/2.png' };
            }},
            14: { name: 'Objective', size: 1, getImg: (gamemode, y, mapHeight) => {
                const objectives = {
                    'Gem_Grab': { img: '${env}/Gamemode_Specifics/Gem_Grab.png' },
                    'Heist': { img: '${env}/Gamemode_Specifics/Heist.png' },
                    'Bounty': { img: 'Global/Objectives/Bounty.png' },
                    'Brawl_Ball': { img: '${env}/Gamemode_Specifics/Brawl_Ball.png' },
                    'Hot_Zone': { img: 'Global/Objectives/Hot_Zone.png', size: 7 },
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
            32: { name: 'Bolt', img: 'Global/Objectives/Bolt.png', size: 1, showInGamemode: 'Siege' },
            36: { name: 'Trio Spawn', size: 1, showInGamemode: 'Showdown', img: 'Global/Spawns/1.png' },
            37: { name: 'Box', img: 'Global/Objectives/Box.png', showInGamemode: 'Showdown', size: 1},
            38: { name: 'Boss Zone', img: 'Global/Arena/Boss_Zone.png', showInGamemode: 'Brawl_Arena', size: 1},
            39: { name: 'Monster Zone', img: 'Global/Arena/Monster_Zone.png', showInGamemode: 'Brawl_Arena', size: 1},
            40: { name: 'Track', img: 'Global/Arena/Track/Blue/Fence.png', showInGamemode: 'Brawl_Arena', size: 1},
            41: { name: 'Blue Respawn', img: 'Global/Spawns/5.png', showInGamemode: 'Brawl_Ball', size: 1},
            42: { name: 'Red Respawn', img: 'Global/Spawns/6.png', showInGamemode: 'Brawl_Ball', size: 1},
            43: { name: 'Base Ike Blue', img: 'Global/Arena/Base_Ike_Blue.png', showInGamemode: 'Brawl_Arena', size: 1 },
            44: { name: 'Small Ike Blue', img: 'Global/Arena/Small_Ike_Blue.png', showInGamemode: 'Brawl_Arena', size: 1 },
            45: { name: 'BFence', img: '${env}/Fence_5v5/BFence.png', showInEnvironment: ['Tropical_Island'], size: 1 },
            46: { name: 'Base Ike Red', img: 'Global/Arena/Base_Ike_Red.png', showInGamemode: 'Brawl_Arena', size: 1 },
            47: { name: 'Small Ike Red', img: 'Global/Arena/Small_Ike_Red.png', showInGamemode: 'Brawl_Arena', size: 1 },
        };

        // Initialize water tile filenames
        this.waterTileFilenames = [
            "00000000.png",
            "00000010.png",
            "00001000.png",
            "00001010.png",
            "00001011.png",
            "00010000.png",
            "00010010.png",
            "00010110.png",
            "00011000.png",
            "00011010.png",
            "00011011.png",
            "00011110.png",
            "00011111.png",
            "01000000.png",
            "01000010.png",
            "01001000.png",
            "01001010.png",
            "01001011.png",
            "01010000.png",
            "01010010.png",
            "01010110.png",
            "01011000.png",
            "01011010.png",
            "01011011.png",
            "01011110.png",
            "01011111.png",
            "01101000.png",
            "01101010.png",
            "01101011.png",
            "01111000.png",
            "01111010.png",
            "01111011.png",
            "01111110.png",
            "01111111.png",
            "11010000.png",
            "11010010.png",
            "11010110.png",
            "11011000.png",
            "11011010.png",
            "11011011.png",
            "11011110.png",
            "11011111.png",
            "11111000.png",
            "11111010.png",
            "11111011.png",
            "11111110.png",
            "11111111.png"
          ];
          
          
        
        // Initialize fence logic handler
        this.fenceLogicHandler = new FenceLogicHandler();

        // Initialize UI and event listeners
        this.initializeUI();
        this.initializeEventListeners();
        this.initializeTileSelector();
        
        // Set initial zoom to fit the map
        this.fitMapToScreen();

        // Initialize the map maker
        this.initialize();
        
        // Preload water tiles
        this.preloadWaterTiles();

        this.baseObjectiveData           = { ...this.objectiveData };
        this.baseEnvironmentObjectiveData = { ...this.environmentObjectiveData };

        this.isSelectDragging = false;
        this.selectDragStart = null;
        this.selectDragOffset = {x: 0, y: 0};
        this.selectDragTiles = [];
        this.selectDragLastPos = null;
    }

    

    // Add a method to preload all water tile images
    preloadWaterTiles() {
        if (!this.tileImages) this.tileImages = {};
        if (!this.tileImagePaths) this.tileImagePaths = {};

        this.waterTileFilenames.forEach(filename => {
            const imagePath = `Resources/${this.environment}/Water/${filename}`;
            const cacheKey = `${this.environment}_water_${filename}`;

            // Skip if already loaded with the same path
            if (this.tileImagePaths[cacheKey] === imagePath && this.tileImages[cacheKey]?.complete) {
                return;
            }

            const img = new Image();
            img.src = imagePath;

            img.onerror = () => {
                console.error(`Failed to load water image: ${imagePath}`);
                const fallbackPath = `Resources/${this.environment}/Water/00000000.png`;
                img.src = fallbackPath;
                this.tileImagePaths[cacheKey] = fallbackPath;
            };

            this.tileImages[cacheKey] = img;
            this.tileImagePaths[cacheKey] = imagePath;
        });
    }


    async preloadGoalImage(name, environment) {
        if (!this.goalImageCache) this.goalImageCache = {};
        if (!this.tileImagePaths) this.tileImagePaths = {};

        const key = `${name}_${environment}`;
        const fallbackKey = `${name}`;
        const primaryPath = `Resources/Global/Goals/${name}${environment}.png`;
        const fallbackPath = `Resources/Global/Goals/${name}.png`;

        // If already loaded with the correct path, return
        if (this.goalImageCache[key] && this.tileImagePaths[key] === primaryPath) {
            return this.goalImageCache[key];
        }
        if (this.goalImageCache[fallbackKey] && this.tileImagePaths[fallbackKey] === fallbackPath) {
            return this.goalImageCache[fallbackKey];
        }

        const img = new Image();

        return new Promise((resolve) => {
            img.onload = () => {
                this.goalImageCache[key] = img;
                this.tileImagePaths[key] = primaryPath;
                resolve(img);
            };
            img.onerror = () => {
                const fallbackImg = new Image();
                fallbackImg.onload = () => {
                    this.goalImageCache[fallbackKey] = fallbackImg;
                    this.tileImagePaths[fallbackKey] = fallbackPath;
                    resolve(fallbackImg);
                };
                fallbackImg.onerror = () => resolve(null);
                fallbackImg.src = fallbackPath;
            };
            img.src = primaryPath;
        });
    }




    // Update the setEnvironment method to preload water tiles when environment changes
    setEnvironment(environment) {
        this.environment = environment;
        this.loadEnvironmentBackgrounds();
        this.loadTileImages();
        this.preloadWaterTiles(); // Ensure water tiles are preloaded
        this.initializeTileSelector();
        // Force a redraw after a short delay to ensure images are loaded
        setTimeout(() => this.draw(), 100);
    }

    async initialize() {
        try {
            await this.loadEnvironmentBackgrounds();
            await this.loadTileImages();
            if (this.headless) return;
            await this.setGamemode(this.gamemode);
        } catch (error) {
            console.error('Error initializing MapMaker:', error);
        }
    }

    async loadEnvironmentBackgrounds() {
        return new Promise((resolve) => {
            let loadedCount = 0;
            const onLoad = () => {
                loadedCount++;
                if (loadedCount === 2) {
                    this.draw();
                    resolve();
                }
            };

            this.bgDark.onload = onLoad;
            this.bgLight.onload = onLoad;

            this.bgDark.src = `Resources/${this.environment}/BGDark.png`;
            this.bgLight.src = `Resources/${this.environment}/BGLight.png`;

            // Handle errors by falling back to Desert environment
            this.bgDark.onerror = () => {
                this.bgDark.src = 'Resources/Desert/BGDark.png';
            };
            this.bgLight.onerror = () => {
                this.bgLight.src = 'Resources/Desert/BGLight.png';
            };
        });
    }

    async loadTileImages() {
        if (!this.tileImages) this.tileImages = {};
        if (!this.tileImagePaths) this.tileImagePaths = {};
        
        return new Promise((resolve) => {
            let loadedCount = 0;
            const tileDefs = Object.entries(this.tileDefinitions);
            const relevantTiles = tileDefs.filter(([id, def]) => 
                (def.img || def.getImg) &&
                (!def.showInEnvironment || def.showInEnvironment.includes(this.environment))
            );
    
            const totalImages = relevantTiles.length;
    
            const onLoad = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    this.draw();
                    resolve();
                }
            };
    
            relevantTiles.forEach(([id, def]) => {
                let imgPath = null;
    
                if (def.getImg) {
                    const imgData = def.getImg(this.gamemode, 0, this.mapHeight);
                    if (!imgData) {
                        onLoad();
                        return;
                    }
                    imgPath = `Resources/${imgData.img.replace('${env}', this.environment)}`;
                } else if (def.img) {
                    imgPath = `Resources/${def.img.replace('${env}', this.environment)}`;
                }
    
                // Check if the same image was already loaded
                if (this.tileImagePaths[id] === imgPath && this.tileImages[id]?.complete) {
                    onLoad();
                    return;
                }
    
                const img = new Image();
                img.onload = onLoad;
                img.onerror = () => {
                    // Try fallback to 'Desert' environment if current fails and uses '${env}'
                    if (this.environment !== 'Desert' && imgPath.includes(this.environment)) {
                        const fallbackPath = imgPath.replace(this.environment, 'Desert');
                        img.src = fallbackPath;
                        this.tileImagePaths[id] = fallbackPath;
                    } else {
                        onLoad();
                    }
                };
    
                img.src = imgPath;
                this.tileImages[id] = img;
                this.tileImagePaths[id] = imgPath;
            });
        });
    }
    

    initializeUI() {
        // Initialize gamemode selector
        if (this.headless) return;
        const gamemodeSelect = document.getElementById('gamemode');
        gamemodeSelect.value = this.gamemode;
        
        // Initialize environment selector
        const environmentSelect = document.getElementById('environment');
        environmentSelect.value = this.environment;

        // Initialize tile selector with current gamemode
        this.initializeTileSelector();
        
        // Update canvas size to include padding
        this.updateCanvasSize();
    }

    fitMapToScreen() {
        if (this.headless) return;
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = container.clientHeight - 40;
        
        const scaleX = containerWidth / this.canvas.width;
        const scaleY = containerHeight / this.canvas.height;
        this.zoomLevel = Math.min(scaleX, scaleY, 1);
        
        this.updateCanvasZoom();
    }

    updateCanvasSize() {
        // Set canvas size to map size plus padding
        // Add 1 to tileSize to account for pixel rounding and prevent tiles from being cut off
        const effectiveTileSize = this.tileSize + 1;
        this.canvas.width = this.mapWidth * this.tileSize + this.canvasPadding * 2;
        this.canvas.height = this.mapHeight * this.tileSize + this.canvasPadding * 2;

        
        // Update the map container size and alignment
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.style.width = `${this.canvas.width}px`;
            mapContainer.style.height = `${this.canvas.height}px`;
            mapContainer.style.display = 'flex';
            mapContainer.style.justifyContent = 'flex-start';
            mapContainer.style.alignItems = 'flex-start';
            mapContainer.style.padding = '20px';
        }
    }

    updateCanvasZoom() {
        const container = this.canvas.parentElement;
        const mapWidth = this.canvas.width * this.zoomLevel;
        const mapHeight = this.canvas.height * this.zoomLevel;
        
        // Set the canvas size to match zoomed dimensions
        this.canvas.style.width = `${mapWidth}px`;
        this.canvas.style.height = `${mapHeight}px`;
        
        // Apply zoom transform from top-left corner
        this.canvas.style.transform = `scale(${this.zoomLevel})`;
        
        // Make container scrollable if content is larger than container
        if (mapWidth > container.clientWidth - 40 || mapHeight > container.clientHeight - 40) {
            container.classList.add('scrollable');
        } else {
            container.classList.remove('scrollable');
        }
    }

    initializeEventListeners() {
        // Tool buttons
        if (this.headless) return;
        const eraseBtn = document.getElementById('eraseBtn');
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const clearBtn = document.getElementById('clearBtn');
        const saveBtn = document.getElementById('saveBtn');
        const exportBtn = document.getElementById('exportBtn');
        const errorsBtn = document.getElementById('errorsBtn');
        const guidesBtn = document.getElementById('guidesBtn');

        // Mirror checkboxes
        const mirrorVertical = document.getElementById('mirrorVertical');
        const mirrorHorizontal = document.getElementById('mirrorHorizontal');
        const mirrorDiagonal = document.getElementById('mirrorDiagonal');
        const blue2Red = document.getElementById('blue2RedBtn');

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
        exportBtn.addEventListener('click', async () => await this.exportMap());
        errorsBtn.addEventListener('click', () => this.toggleShowErrors());
        guidesBtn.addEventListener('click', () => this.toggleGuides());

        // Mirror listeners
        mirrorVertical.addEventListener('change', (e) => this.mirrorVertical = e.target.checked);
        mirrorHorizontal.addEventListener('change', (e) => this.mirrorHorizontal = e.target.checked);
        mirrorDiagonal.addEventListener('change', (e) => this.mirrorDiagonal = e.target.checked);
        blue2Red.addEventListener('change', () =>  this.toggleBlue2Red());

        // Map setting listeners
        mapSizeSelect.addEventListener('change', (e) => this.setSize(e.target.value));


        gamemodeSelect.addEventListener('change', async (e) => await this.setGamemode(e.target.value));
        environmentSelect.addEventListener('change', (e) => this.setEnvironment(e.target.value));

        // Undo/Redo buttons
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        
        // Replace button
        document.getElementById('replaceBtn').addEventListener('click', () => this.toggleReplaceMode());

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
           switch (e.code) {
                case 'Digit1':
                case 'Numpad1':
                    if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.mirrorDiagonal = !this.mirrorDiagonal;
                        document.getElementById('mirrorDiagonal').checked = this.mirrorDiagonal;
                        return;
                    }
                    this.setSelectionMode('single');
                    break;

                case 'Digit2':
                case 'Numpad2':
                    if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.mirrorVertical = !this.mirrorVertical;
                        document.getElementById('mirrorVertical').checked = this.mirrorVertical;
                        return;
                    }
                    this.setSelectionMode('line');
                    break;

                case 'Digit3':
                case 'Numpad3':
                    if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.mirrorHorizontal = !this.mirrorHorizontal;
                        document.getElementById('mirrorHorizontal').checked = this.mirrorHorizontal;
                        return;
                    }
                    this.setSelectionMode('rectangle');
                    break;
                    
                case 'Digit4':
                case 'Numpad4':
                    this.setSelectionMode('fill');
                    break;

                case 'Digit5':
                case 'Numpad5':
                    this.setSelectionMode('select');
                    break;

                case 'KeyR':
                    this.toggleReplaceMode();
                    break;

                case 'KeyE':
                    this.toggleEraseMode();
                    break;

                case 'KeyM':
                    this.toggleMirroring();
                    break;

                case 'KeyN':
                    this.toggleBlue2Red();
                    break;

                case 'KeyQ':
                    this.toggleShowErrors();
                    break;

                case 'KeyW':
                    this.toggleGuides();
                    break;

                case 'KeyZ':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                    }
                    break;

                case 'KeyY':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.redo();
                    }
                    break;

                case 'Backspace':
                case 'Delete':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.clearMap(true);
                    }
                    break;
            }
        });
        


        // Canvas event listeners
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.canvas.addEventListener('contextmenu', this.handleRightClick.bind(this));
        this.canvas.addEventListener('dragstart', e => {
          e.preventDefault();
        });


        // Document-level mouseup fallback
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), {passive: false });
        this.canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
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

    handleRightClick(event) {
        event.preventDefault();
        
        const coords = this.getTileCoordinates(event);
        if (coords.x < 0 || coords.x >= this.mapWidth || coords.y < 0 || coords.y >= this.mapHeight) return;

        if (this.replaceMode) {
            this.handleReplace(coords.x, coords.y);
            return;
        }

        if (this.mapData[coords.y][coords.x] < 1) return;

        this.selectedTile = { id: this.mapData[coords.y][coords.x], ...this.tileDefinitions[this.mapData[coords.y][coords.x]] };
        document.getElementById('tileSelector').querySelectorAll('.tile-btn').forEach(b => b.classList.remove('selected'));
        document.getElementById('tileSelector').querySelector(`.tile-btn[id="${this.selectedTile.id}"]`).classList.add('selected');
    }

    handleMouseDown(event) {
        if (event.button !== 0) return;
        this.mouseDown = true;
        const coords = this.getTileCoordinates(event);
        
        if (coords.x < 0 || coords.x >= this.mapWidth || coords.y < 0 || coords.y >= this.mapHeight) return;

        if (this.selectionMode === 'select' && this.selectedTiles.length > 0 && this.selectedTiles.some(t => t.x === coords.x && t.y === coords.y)) {
            // Start select-drag
            this.isSelectDragging = true;
            this.selectDragStart = { ...coords };
            this.selectDragLastPos = { ...coords };
            this.selectDragTiles = this.selectedTiles.map(t => ({ ...t })); // deep copy

            // Remove tiles from map (including mirrored tiles)
            for (const t of this.selectDragTiles) {
                this.mapData[t.y][t.x] = 0;
                // Mirroring logic for erasing
                const size = this.tileDefinitions[t.id]?.size || 1;
                const mirrorY = this.mapHeight - 1 - t.y;
                const mirrorX = this.mapWidth - 1 - t.x;
                if (this.mirrorVertical) {
                    const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                    if (adjustedY >= 0 && adjustedY < this.mapHeight)
                        this.mapData[adjustedY][t.x] = 0;
                }
                if (this.mirrorHorizontal) {
                    const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                    if (adjustedX >= 0 && adjustedX < this.mapWidth)
                        this.mapData[t.y][adjustedX] = 0;
                }
                if (this.mirrorDiagonal) {
                    const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                    const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                    if (adjustedX >= 0 && adjustedX < this.mapWidth && adjustedY >= 0 && adjustedY < this.mapHeight)
                        this.mapData[adjustedY][adjustedX] = 0;
                }
            }
            this.draw();
            // Draw ghost tiles at original positions
            this.drawSelectDragGhost(0, 0);
            return;
        }

        if (this.selectionMode !== 'select' || !this.selectedTiles.some(t => t.x === coords.x && t.y === coords.y)) {
            this.selectedTiles = [];
        }

        if (this.gamemode === 'Brawl_Ball' && this.mapSize === this.mapSizes.regular) {
            const { x, y } = coords;
            const atTop    = y < 4;
            const atBottom = y >= this.mapHeight - 4;
            const atLeft   = x < 7;
            const atRight  = x >= this.mapWidth - 7;
            if ((atTop || atBottom) && (atLeft || atRight)) {
                // cancel *all* drawing state
                this.isDrawing = false;
                this.isDragging = false;
                this.mouseDown = false;
                return;
            }
        }

        if (this.replaceMode) {
            this.handleReplace(coords.x, coords.y);
            return;
        }

        // Check if we're starting to drag an existing tile
        if (!this.isErasing && this.mapData[coords.y][coords.x] !== 0 && this.selectionMode !== 'fill' && this.selectionMode !== 'select') {
            this.isDragging = true;
            this.draggedTileId = this.mapData[coords.y][coords.x];
            this.dragStartX = coords.x;
            this.dragStartY = coords.y;
            this.saveState();
            
            // Get the tile definition to check if it's a 2x2 tile
            const def = this.tileDefinitions[this.draggedTileId];
            const is2x2 = def && def.size === 2;
            
            // Remove tile from original position immediately
            this.mapData[coords.y][coords.x] = 0;
            
            // If it's a 2x2 tile, also remove the other three tiles
            if (is2x2) {
                this.mapData[coords.y][coords.x + 1] = 0;
                this.mapData[coords.y + 1][coords.x] = 0;
                this.mapData[coords.y + 1][coords.x + 1] = 0;
            }
            
            // Apply mirroring for removal
            if (this.mirrorVertical) {
                const mirrorY = this.mapHeight - 1 - coords.y;
                this.mapData[mirrorY][coords.x] = 0;
                
                // If it's a 2x2 tile, also remove the other three tiles
                if (is2x2) {
                    this.mapData[mirrorY][coords.x + 1] = 0;
                    this.mapData[mirrorY - 1][coords.x] = 0;
                    this.mapData[mirrorY - 1][coords.x + 1] = 0;
                }
            }
            if (this.mirrorHorizontal) {
                const mirrorX = this.mapWidth - 1 - coords.x;
                this.mapData[coords.y][mirrorX] = 0;
                
                // If it's a 2x2 tile, also remove the other three tiles
                if (is2x2) {
                    this.mapData[coords.y][mirrorX - 1] = 0;
                    this.mapData[coords.y + 1][mirrorX] = 0;
                    this.mapData[coords.y + 1][mirrorX - 1] = 0;
                }
            }
            if (this.mirrorDiagonal) {
                const mirrorX = this.mapWidth - 1 - coords.x;
                const mirrorY = this.mapHeight - 1 - coords.y;
                this.mapData[mirrorY][mirrorX] = 0;
                
                // If it's a 2x2 tile, also remove the other three tiles
                if (is2x2) {
                    this.mapData[mirrorY][mirrorX - 1] = 0;
                    this.mapData[mirrorY - 1][mirrorX] = 0;
                    this.mapData[mirrorY - 1][mirrorX - 1] = 0;
                }
            }
            
            this.canvas.style.cursor = 'crosshair';
            this.draw();
            return;
        }

        // Start selection

        this.isDrawing = true;
        this.selectionStart = coords;
        this.selectionEnd = coords;
        
        // Initialize hoveredTiles with the starting tile
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
        
        if (this.isSelectDragging) {
            const offsetX = coords.x - this.selectDragStart.x;
            const offsetY = coords.y - this.selectDragStart.y;
            this.selectDragOffset = { x: offsetX, y: offsetY };
            this.draw();
            this.drawSelectDragGhost(offsetX, offsetY);
            this.selectDragLastPos = { ...coords };
            return;
        }

        if (this.isDragging) {
            this.draw(); // Redraw the base map

            const draggedTile = this.tileDefinitions[this.draggedTileId];
            if (draggedTile) {
                this.drawTilePreview(this.draggedTileId, coords.x, coords.y, 0.7); // 0.7 alpha for preview

                // ...mirroring logic, use this.drawTilePreview for each mirrored tile
            }
            return;
        }

        if (this.isDrawing) {
            this.selectionEnd = coords;
            
            // Add the current tile to hoveredTiles for line selection
            if (this.selectionMode === 'line') {
                this.hoveredTiles.add(`${coords.x},${coords.y}`);
            }
            
            this.draw();
            this.drawSelection();
        }
    }

    handleMouseUp(event) {
        this.mouseDown = false;
        if (this.isSelectDragging) {
            const offsetX = this.selectDragOffset.x;
            const offsetY = this.selectDragOffset.y;
            for (const t of this.selectDragTiles) {
                const newX = t.x + offsetX;
                const newY = t.y + offsetY;
                if (
                    newX >= 0 && newX < this.mapWidth &&
                    newY >= 0 && newY < this.mapHeight
                ) {
                    this.mapData[newY][newX] = t.id;

                    // Mirroring logic
                    const size = this.tileDefinitions[t.id]?.size || 1;
                    const mirrorY = this.mapHeight - 1 - newY;
                    const mirrorX = this.mapWidth - 1 - newX;

                    if (this.mirrorVertical) {
                        const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                        const mirrorId = this.getMirroredTileId(t.id, 'vertical');
                        if (adjustedY >= 0 && adjustedY < this.mapHeight)
                            this.mapData[adjustedY][newX] = mirrorId;
                    }
                    if (this.mirrorHorizontal) {
                        const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                        const mirrorId = this.getMirroredTileId(t.id, 'horizontal');
                        if (adjustedX >= 0 && adjustedX < this.mapWidth)
                            this.mapData[newY][adjustedX] = mirrorId;
                    }
                    if (this.mirrorDiagonal) {
                        const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                        const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                        const mirrorId = this.getMirroredTileId(t.id, 'diagonal');
                        if (adjustedX >= 0 && adjustedX < this.mapWidth && adjustedY >= 0 && adjustedY < this.mapHeight)
                            this.mapData[adjustedY][adjustedX] = mirrorId;
                    }
                }
            }
            this.isSelectDragging = false;
            this.selectDragStart = null;
            this.selectDragOffset = {x: 0, y: 0};
            this.selectDragTiles = [];
            this.selectedTiles = [];
            this.draw();
            return;
        }
        
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
                this.draw();
                this.checkForErrors();
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

    handleTouchStart(e) {
        if (e.touches.length > 1) return; // Ignore multi-touch
        e.preventDefault();

        const touch = e.touches[0];
        const simulatedEvent = {
            button: 0,
            clientX: touch.clientX,
            clientY: touch.clientY,
        };

        this.handleMouseDown(simulatedEvent);
    }

    handleTouchMove(e) {
        if (e.touches.length > 1) return;
        e.preventDefault();

        const touch = e.touches[0];
        const simulatedEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
        };

        this.handleMouseMove(simulatedEvent);
    }

    handleTouchEnd(e) {
        e.preventDefault && e.preventDefault();

        // touchend has changedTouches: the touches that just ended
        const touch = e.changedTouches[0];
        if (!touch) {
            this.handleMouseUp(e); // fallback, no coordinates
            return;
        }

        const simulatedEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            // You can add button if your mouse handler expects it
            button: 0,
        };

        this.handleMouseUp(simulatedEvent);
    }


    handleTouchCancel(e) {
        this.handleMouseLeave();
    }


    zoom(delta) {
        const oldZoom = this.zoomLevel;
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));
        
        if (oldZoom !== this.zoomLevel) {
            this.updateCanvasZoom();
        }
    }

    initializeTileSelector() {
        if (this.headless) return;
        const container = document.getElementById('tileSelector');
        container.innerHTML = '';

        // Define the order of tiles
        const tileOrder = [
            'Wall', 'Wall2', 'Unbreakable', 'Crate', 'Barrel', 'Fence', 'BFence', 'Rope Fence',
            'Bush', 'Cactus', 'Water', 'Skull', 'Blue Spawn', 'Blue Respawn', 'Red Spawn', 'Red Respawn', 'Trio Spawn', 'Objective', 'Box', 'Boss Zone', 'Monster Zone', 'Track',
            'Smoke', 'Heal Pad', 'Slow Tile', 'Speed Tile', 'Spikes',
            'Jump R', 'Jump L', 'Jump T', 'Jump B',
            'Jump BR', 'Jump TL', 'Jump BL', 'Jump TR',
            'Teleporter Blue', 'Teleporter Green', 'Teleporter Red', 'Teleporter Yellow',
            'Bolt', 'Base Ike Blue', 'Base Ike Red', 'Small Ike Blue', 'Small Ike Red'
        ];

        // Create buttons in the specified order
        tileOrder.forEach(tileName => {
            const tileEntry = Object.entries(this.tileDefinitions)
                .find(([_, def]) => def.name === tileName);
            
            if (!tileEntry) return;
            const [id, def] = tileEntry;

            if (id === '0' || id === '-1') return; // Skip empty and occupied tiles
            if (def.showInGamemode && def.showInGamemode !== this.gamemode) return;
            if (def.showInEnvironment && !def.showInEnvironment.includes(this.environment)) return;

            const btn = document.createElement('button');
            btn.className = 'tile-btn';
            btn.title = def.name;
            btn.id = id;
            
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
                this.toggleEraseMode(false);
                
            });

            container.appendChild(btn);
        });

        document.getElementById('tileSelector').querySelector(`.tile-btn[id="1"]`).classList.add('selected');
    }

    loadEnvironmentBackgrounds() {
        const bgDarkPromise = new Promise(resolve => {
            this.bgDark.onload = resolve;
            this.bgDark.src = `Resources/${this.environment}/BGDark.png`;
            this.bgDark.onerror = () => {
                this.bgDark.src = 'Resources/Desert/BGDark.png';
            };
        });

        const bgLightPromise = new Promise(resolve => {
            this.bgLight.onload = resolve;
            this.bgLight.src = `Resources/${this.environment}/BGLight.png`;
            this.bgLight.onerror = () => {
                this.bgLight.src = 'Resources/Desert/BGLight.png';
            };
        });

        // Wait for both backgrounds to load then draw
        Promise.all([bgDarkPromise, bgLightPromise]).then(() => {
            this.draw();
        });
    }

    setCanvas(newCanvas) {
        this.canvas = newCanvas;
        this.ctx    = newCanvas.getContext('2d');
        // if you use mapSize & tileSize to size it:
        this.canvas.width  = this.mapSize.width  * this.tileSize;
        this.canvas.height = this.mapSize.height * this.tileSize;
    }


    drawTile(ctx, tileId, x, y, red = false) {
        const def = this.tileDefinitions[tileId];
        if (!def) return;

        let img;
        if (tileId === 8) { // Water tile
            // Initialize the 8-bit code array
            const code = new Array(8).fill('0');
            
            // Check for edge conditions
            const isTopEdge = y === 0;
            const isBottomEdge = y === this.mapHeight - 1;
            const isLeftEdge = x === 0;
            const isRightEdge = x === this.mapWidth - 1;

            // Check direct connections first
            const hasTop = !isTopEdge && this.mapData[y - 1][x] === 8;
            const hasBottom = !isBottomEdge && this.mapData[y + 1][x] === 8;
            const hasLeft = !isLeftEdge && this.mapData[y][x - 1] === 8;
            const hasRight = !isRightEdge && this.mapData[y][x + 1] === 8;

            // Set direct connections
            if (hasTop) code[1] = '1';    // Top
            if (hasBottom) code[6] = '1'; // Bottom
            if (hasLeft) code[3] = '1';   // Left
            if (hasRight) code[4] = '1';  // Right

            // Check corner connections with adjacency rules
            // Top-left corner
            if (!isTopEdge && !isLeftEdge && 
                this.mapData[y - 1][x - 1] === 8 && hasTop && hasLeft) {
                code[0] = '1';
            }

            // Top-right corner
            if (!isTopEdge && !isRightEdge && 
                this.mapData[y - 1][x + 1] === 8 && hasTop && hasRight) {
                code[2] = '1';
            }

            // Bottom-left corner
            if (!isBottomEdge && !isLeftEdge && 
                this.mapData[y + 1][x - 1] === 8 && hasBottom && hasLeft) {
                code[5] = '1';
            }

            // Bottom-right corner
            if (!isBottomEdge && !isRightEdge && 
                this.mapData[y + 1][x + 1] === 8 && hasBottom && hasRight) {
                code[7] = '1';
            }

            // Convert code array to string for image name
            const imageName = code.join('') + '.png';
            const cacheKey = `water_${imageName}`;
            
            // Get the image from the cache
            img = this.tileImages[cacheKey];
            
            // If image doesn't exist in cache, create it
            if (!img) {
                const imagePath = `Resources/${this.environment}/Water/${imageName}`;
                img = new Image();
                img.src = imagePath;
                
                // Add error handling
                img.onerror = () => {
                    console.error(`Failed to load water image: ${imagePath}`);
                    // Try to load a fallback image
                    img.src = `Resources/${this.environment}/Water/00000000.png`;
                };
                
                // Store in cache
                this.tileImages[cacheKey] = img;
            }
            
            // If image isn't loaded yet, draw a placeholder
            if (!img.complete || img.naturalWidth === 0) {
                // Wait for image to load before drawing
                img.onload = () => {
                    this.drawTile(this.ctx, tileId, x, y); // Or whatever your method is to redraw that tile
                };
                return;
            }

            // Get water tile dimensions
            const dimensions = this.environmentTileData[this.environment]?.['Water'] || 
                             this.tileData['Water'] ||
                             [1, 1, 0, 0, 1, 5]; // Default dimensions if none specified

            // Draw the water tile
            const [scaleX, scaleY, offsetX, offsetY, opacity] = dimensions;
            const tileSize = this.tileSize;
            
            // Calculate drawing dimensions
            const width = tileSize * scaleX;
            const height = tileSize * scaleY;
            
            // Calculate position with offsets and padding
            const drawX = x * tileSize + (tileSize * offsetX / 100) + this.canvasPadding;
            const drawY = y * tileSize + (tileSize * offsetY / 100) + this.canvasPadding;

            // Set opacity and draw the image
            ctx.globalAlpha = opacity;
            ctx.drawImage(img, drawX, drawY, width, height);
            ctx.globalAlpha = 1.0;
            
            return;
        } else if (tileId === 7 || tileId === 9) { // Fence or Rope Fence
            const isFence = tileId === 7;
            const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData, this.environment, isFence);
            
            // For rope fence, map the image name to the corresponding Post variation
            const ropeMapping = {
                'T': 'Post_T',
                'R': 'Post_R',
                'TR': 'Post_TR',
                'Fence': 'Post'
            };
            
            const finalImageName = isFence ? imageName : (ropeMapping[imageName] || 'Post');
            const imagePath = `Resources/${this.environment}/${isFence ? 'Fence' : 'Rope'}/${finalImageName}.png`;
            
            img = this.tileImages[imagePath];
            
            if (!img) {
                img = new Image();
                img.onload = () => this.draw();
                img.src = imagePath;
                img.onerror = () => {
                    console.error(`Failed to load ${isFence ? 'fence' : 'rope'} image: ${imagePath}`);
                    // Load fallback image
                    img.src = `Resources/${this.environment}/${isFence ? 'Fence' : 'Rope'}/Fence.png`;
                };
                this.tileImages[imagePath] = img;
            }
            
            if (!img.complete || img.naturalWidth === 0) {
                // Wait for image to load before drawing
                img.onload = () => {
                    this.drawTile(this.ctx, tileId, x, y); // Or whatever your method is to redraw that tile
                };
                return;
            }
        } else if (tileId === 40) {
            const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData, 'Brawl_Arena');

            const pathColor = red ? 'Red' : 'Blue';
            const imagePath = `Resources/Global/Arena/Track/${pathColor}/${imageName}.png`;


            
            img = this.tileImages[imagePath];
            
            if (!img) {
                img = new Image();
                img.onload = () => this.draw();
                img.src = imagePath;
                img.onerror = () => {
                    console.error(`Failed to load track image: ${imagePath}`);
                    // Load fallback image
                    img.src = `Resources/Global/Arena/Track/Blue/Fence.png`;
                };
                this.tileImages[imagePath] = img;
            }
            
            if (!img.complete || img.naturalWidth === 0) {
                // Wait for image to load before drawing
                img.onload = () => {
                    this.drawTile(this.ctx, tileId, x, y); // Or whatever your method is to redraw that tile
                };
                return;
            }

        } else if (tileId === 45) {
            // Robust check: Only try to draw BFence if allowed in this environment
            const def = this.tileDefinitions[tileId];
            if (!def.showInEnvironment || !def.showInEnvironment.includes(this.environment)) {
                // Do not attempt to load or draw BFence if not supported in this environment
                return;
            }

            const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData, this.environment, false, true);
            
            const imagePath = `Resources/${this.environment}/Fence_5v5/${imageName}.png`;
            
            img = this.tileImages[imagePath];
            
            if (!img) {
                img = new Image();
                img.onload = () => this.draw();
                img.src = imagePath;
                img.onerror = () => {
                    console.error(`Failed to load border fence image: ${imagePath}`);
                    // Load fallback image
                    img.src = `Resources/${this.environment}/Fence_5v5/BFence.png`;
                };
                this.tileImages[imagePath] = img;
            }
            
            if (!img.complete || img.naturalWidth === 0) {
                // Wait for image to load before drawing
                img.onload = () => {
                    this.drawTile(this.ctx, tileId, x, y); // Or whatever your method is to redraw that tile
                };
                return;
            }
        } else {
            img = this.tileImages[tileId];
        }

        if (!img || !img.complete) return;

        // Get tile dimensions data
        let dimensions;
        if (def.name === 'Objective') {
            dimensions = this.environmentObjectiveData[this.environment]?.[this.gamemode] || this.objectiveData[this.gamemode];
        } else {
            // For fence and rope fence variations, use the specific variation's dimensions
            const isFence = tileId === 7;
            const isRope = tileId === 9;
            const isBorder = tileId === 45;
            if (isFence || isRope || isBorder) {
                const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData, this.environment, isFence, isBorder);
                const ropeMapping = {
                    'T': 'Post_T',
                    'R': 'Post_R',
                    'TR': 'Post_TR',
                    'Fence': 'Post'
                };
                const finalImageName = isBorder ? imageName : isFence ? imageName : (ropeMapping[imageName] || 'Post');
                
                // First check environment-specific data
                dimensions = this.environmentTileData[this.environment]?.[finalImageName] ||
                           // Then check base tile data
                           this.tileData[finalImageName] ||
                           // Fall back to base fence/rope fence in environment data
                           this.environmentTileData[this.environment]?.[isBorder ? 'BFence' : isFence ? 'Fence' : 'Rope Fence'] ||
                           // Finally fall back to base tile data
                           this.tileData[isBorder ? 'BFence' : isFence ? 'Fence' : 'Rope Fence'];
            } else {
                dimensions = this.environmentTileData[this.environment]?.[def.name] || 
                            this.tileData[def.name];
            }
        }
        if (!dimensions) return;

        const [scaleX, scaleY, offsetX, offsetY, opacity, zIndex] = dimensions;
        const tileSize = this.tileSize;

        // Calculate drawing dimensions
        const width = tileSize * scaleX * (def.size || 1);
        const height = tileSize * scaleY * (def.size || 1);
        
        // Calculate position with offsets and padding
        const drawX = x * tileSize + (tileSize * offsetX / 100) + this.canvasPadding;
        const drawY = y * tileSize + (tileSize * offsetY / 100) + this.canvasPadding;

        // Set opacity
        ctx.globalAlpha = opacity;

        // Draw the tile
        ctx.drawImage(img, drawX, drawY, width, height);

        // Reset opacity
        ctx.globalAlpha = 1;
    }

    draw() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the background grid
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                // Check if this tile should have no background in Brawl Ball mode
                let skipBackground = false;
                // in draw(), before drawing the checker background:
                if (this.gamemode === 'Brawl_Ball' && this.mapSize === this.mapSizes.regular) {
                    // rows <4 or > mapHeight-5, cols <7 or > mapWidth-8
                    const atTop    = y < 4;
                    const atBottom = y >= this.mapHeight - 4;
                    const atLeft   = x < 7;
                    const atRight  = x >= this.mapWidth - 7;

                    if ((atTop   || atBottom) &&
                        (atLeft  || atRight)) {
                        skipBackground = true;
                    }
                }

                
                if (!skipBackground) {
                    const isDark = (x + y) % 2 === 0;
                    const bgImg = isDark ? this.bgDark : this.bgLight;
                    
                    if (bgImg.complete) {
                        this.ctx.drawImage(
                            bgImg,
                            x * this.tileSize + this.canvasPadding,
                            y * this.tileSize + this.canvasPadding,
                            this.tileSize,
                            this.tileSize
                        );
                    }
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

                let originalZ = dimensions[5] || 0;
                let lastInRow = !Number.isInteger(originalZ);
                let zIndex = lastInRow ? originalZ - 0.5 : originalZ;

                if (!tilesByZIndex.has(zIndex)) {
                    tilesByZIndex.set(zIndex, []);
                }
                tilesByZIndex.get(zIndex).push({ x, y, tileId, lastInRow, red: false });

            }
        }

        function getTileAt(zIndex, x, y) {
            const tiles = tilesByZIndex.get(zIndex);
            if (!tiles) return null;

            return tiles.find(tile => tile.x === x && tile.y === y) || null;
        }

        if (this.gamemode === 'Brawl_Arena'){
            const getTrackConnections = (x, y) => {
                const height = this.mapData.length;
                const width = this.mapData[0].length;
                
                // Helper function to check if a tile is a fence/rope
                const isSameType = (x, y) => {
                    if (x < 0 || x >= width || y < 0 || y >= height) return false;
                    const id = this.mapData[y][x];
                    return id === 40;
                };

                return {
                    top: isSameType(x, y - 1),
                    right: isSameType(x + 1, y),
                    bottom: isSameType(x, y + 1),
                    left: isSameType(x - 1, y)
                };
            };

            for (let y = 0; y < this.mapHeight; y++) {
                for (let x = 0; x < this.mapWidth; x++) {
                    if (this.mapData[y][x] === 47){
                        const addRedToConnections = (x, y, firstRun = false) => {
                            if (!firstRun) {
                                const tile = getTileAt(2, x, y);
                                if (!tile) {
                                    return;
                                }
                                if (tile.red) {
                                    return;
                                }

                                tile.red = true;
                            }   

                            firstRun = false;
                            const { top, right, bottom, left } = getTrackConnections(x, y);
                            if (top) addRedToConnections(x, y - 1);
                            if (right) addRedToConnections(x + 1, y);
                            if (bottom) addRedToConnections(x, y + 1);
                            if (left) addRedToConnections(x - 1, y);
                        };

                        addRedToConnections(x + 1, y, true);
                        addRedToConnections(x - 1, y, true);
                        addRedToConnections(x, y + 1, true);
                        addRedToConnections(x, y - 1, true);
                    }
                }
            }
        }

        // Draw tiles in z-index order
        Array.from(tilesByZIndex.keys())
            .sort((a, b) => a - b)
            .forEach(zIndex => {
                const tiles = tilesByZIndex.get(zIndex);

                // Group tiles by row (y value)
                const rows = new Map();

                tiles.forEach(tile => {
                    const { y } = tile;
                    if (!rows.has(y)) {
                        rows.set(y, []);
                    }
                    rows.get(y).push(tile);
                });

                // Draw tiles row by row
                Array.from(rows.keys())
                    .sort((a, b) => a - b)
                    .forEach(y => {
                        const rowTiles = rows.get(y);

                        // Separate regular and lastInRow tiles
                        const normalTiles = [];
                        const lastInRowTiles = [];

                        rowTiles.forEach(tile => {
                            if (tile.lastInRow) {
                                lastInRowTiles.push(tile);
                            } else {
                                normalTiles.push(tile);
                            }
                        });

                        // Sort both groups by x
                        normalTiles.sort((a, b) => a.x - b.x);
                        lastInRowTiles.sort((a, b) => a.x - b.x); // Optional, just in case of multiple

                        [...normalTiles, ...lastInRowTiles].forEach(({ x, y, tileId }) => {
                            const tile = getTileAt(2, x, y);
                            const red = tile?.red ?? false;

                            this.drawTile(this.ctx, tileId, x, y, red);

                        });
                    });
            });

            

        // Draw error tiles if showErrors is enabled
        if (this.showErrors) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Adjusted opacity for better visibility
            for (const tilePos of this.errorTiles) {
                const [x, y] = tilePos.split(',').map(Number);
                this.ctx.fillRect(
                    x * this.tileSize + this.canvasPadding, 
                    y * this.tileSize + this.canvasPadding, 
                    this.tileSize, 
                    this.tileSize
                );
            }
        }

        if (this.goalImages?.length) {
            for (const goal of this.goalImages) {
                const img = this.goalImageCache[`${goal.name}_${this.environment}`] ||
                            this.goalImageCache[`${goal.name}`];
                if (!img) continue;

                this.ctx.drawImage(
                    img,
                    goal.x * this.tileSize + this.canvasPadding + (goal.offsetX || 0),
                    goal.y * this.tileSize + this.canvasPadding + (goal.offsetY || 0),
                    (goal.w || 1) * this.tileSize,
                    (goal.h || 1) * this.tileSize
                );
            }
        }

        if (this.selectionMode === 'select' && !this.mouseDown) {
            this.selectionStart = this.selectedTiles[0];
            this.selectionEnd = this.selectedTiles[this.selectedTiles.length - 1];
            this.drawSelection();
        }


        if (this.showGuides || this.isDragging || this.isSelectDragging) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'; // semi-transparent white
            this.ctx.lineWidth = 1;

            // Calculate central tile coordinates
            const centerX = (this.mapWidth / 2);
            const centerY = (this.mapHeight / 2);

            // Convert to canvas pixel coordinates
            const centerXCanvas = centerX * this.tileSize + this.canvasPadding;
            const centerYCanvas = centerY * this.tileSize + this.canvasPadding;

            // Vertical center line
            this.ctx.beginPath();
            this.ctx.moveTo(centerXCanvas + 0.5, 0);
            this.ctx.lineTo(centerXCanvas + 0.5, this.canvas.height);
            this.ctx.stroke();

            // Horizontal center line
            this.ctx.beginPath();
            this.ctx.moveTo(0, centerYCanvas + 0.5);
            this.ctx.lineTo(this.canvas.width, centerYCanvas + 0.5);
            this.ctx.stroke();
        }
    }

    getTileCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        // Calculate mouse position relative to canvas
        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;
        
        // Subtract padding to get position relative to map
        const mapX = mouseX - this.canvasPadding;
        const mapY = mouseY - this.canvasPadding;
        
        // Convert to tile coordinates
        const x = Math.floor(mapX / this.tileSize);
        const y = Math.floor(mapY / this.tileSize);
        
        return { x, y };
    }

    drawSelection() {
        if (!this.selectionStart || !this.selectionEnd) return;
        
        // Create a separate canvas for the selection overlay if it doesn't exist
        if (!this.selectionCanvas) {
            this.selectionCanvas = document.createElement('canvas');
            this.selectionCanvas.width = this.canvas.width;
            this.selectionCanvas.height = this.canvas.height;
            this.selectionCtx = this.selectionCanvas.getContext('2d');
        }
        
        // Clear the selection canvas
        this.selectionCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set the selection style
        this.selectionCtx.fillStyle = this.isErasing ? 'rgba(255, 0, 0, 0.4)' : 'rgba(255, 255, 0, 0.4)';

        // If still drawing, show full rectangle/area as before
        if (this.isDrawing && (this.selectionMode === 'rectangle' || this.selectionMode === 'select')) {
            const startX = Math.min(this.selectionStart.x, this.selectionEnd.x);
            const startY = Math.min(this.selectionStart.y, this.selectionEnd.y);
            const endX = Math.max(this.selectionStart.x, this.selectionEnd.x);
            const endY = Math.max(this.selectionStart.y, this.selectionEnd.y);
            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    this.selectionCtx.fillRect(
                        x * this.tileSize + this.canvasPadding,
                        y * this.tileSize + this.canvasPadding,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        } else if (this.selectionMode === 'select' && this.selectedTiles.length > 0) {
            // After selection, only cover actual selected (non-empty) tiles
            for (const t of this.selectedTiles) {
                this.selectionCtx.fillRect(
                    t.x * this.tileSize + this.canvasPadding,
                    t.y * this.tileSize + this.canvasPadding,
                    this.tileSize,
                    this.tileSize
                );
            }
        } else if (this.selectionMode === 'rectangle') {
            const startX = Math.min(this.selectionStart.x, this.selectionEnd.x);
            const startY = Math.min(this.selectionStart.y, this.selectionEnd.y);
            const endX = Math.max(this.selectionStart.x, this.selectionEnd.x);
            const endY = Math.max(this.selectionStart.y, this.selectionEnd.y);
            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    this.selectionCtx.fillRect(
                        x * this.tileSize + this.canvasPadding,
                        y * this.tileSize + this.canvasPadding,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        } else if (this.selectionMode === 'line') {
            for (const tilePos of this.hoveredTiles) {
                const [x, y] = tilePos.split(',').map(Number);
                this.selectionCtx.fillRect(
                    x * this.tileSize + this.canvasPadding,
                    y * this.tileSize + this.canvasPadding,
                    this.tileSize,
                    this.tileSize
                );
            }
        } else if (this.selectionMode === 'single' || this.selectionMode === 'fill') {
            this.selectionCtx.fillRect(
                this.selectionEnd.x * this.tileSize + this.canvasPadding,
                this.selectionEnd.y * this.tileSize + this.canvasPadding,
                this.tileSize,
                this.tileSize
            );
        }
        
        // Draw the selection overlay on top of the main canvas
        this.ctx.drawImage(this.selectionCanvas, 0, 0);
    }

    placeTilesInSelection() {
        if (!this.selectionStart || !this.selectionEnd) return;
        
        // Save state before making changes
        this.saveState();
        
        if (this.selectionMode === 'single') {
            if (this.isErasing) {
                this.eraseTile(this.selectionEnd.x, this.selectionEnd.y, false);
            } else {
                this.placeTile(this.selectionEnd.x, this.selectionEnd.y, null, false);
            }
        } else if (this.selectionMode === 'line') {
            // Place tiles in all hovered positions
            for (const tilePos of this.hoveredTiles) {
                const [x, y] = tilePos.split(',').map(Number);
                if (this.isErasing) {
                    this.eraseTile(x, y, false);
                } else {
                    this.placeTile(x, y, null, false);
                }
            }
        } else if (this.selectionMode === 'rectangle') {
            const startX = Math.min(this.selectionStart.x, this.selectionEnd.x);
            const startY = Math.min(this.selectionStart.y, this.selectionEnd.y);
            const endX = Math.max(this.selectionStart.x, this.selectionEnd.x);
            const endY = Math.max(this.selectionStart.y, this.selectionEnd.y);
            
            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    if (this.isErasing) {
                        this.eraseTile(x, y, false);
                    } else {
                        this.placeTile(x, y, null, false);
                    }
                }
            }
        } else if (this.selectionMode === 'fill') {
            const tileId = this.mapData[this.selectionEnd.y][this.selectionEnd.x];

            const getConnectionsOfSameTile = (x, y, tileId) => {
                const height = this.mapData.length;
                const width = this.mapData[0].length;

                const isSameType = (x, y) => {
                    if (x < 0 || x >= width || y < 0 || y >= height) return false;
                    const id = this.mapData[y][x];
                    return id === tileId;
                };

                return {
                    top: isSameType(x, y - 1),
                    right: isSameType(x + 1, y),
                    bottom: isSameType(x, y + 1),
                    left: isSameType(x - 1, y)
                };
            };

            const fill = (x, y) => {
                if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
                    return;
                }

                const currentTile = this.mapData[y][x];
                if (currentTile !== tileId) {
                    return;
                }

                if (this.isErasing) {
                    this.eraseTile(x, y, false);
                } else {
                    this.placeTile(x, y, null, false);
                }

                const { top, right, bottom, left } = getConnectionsOfSameTile(x, y, tileId);

                if (top) fill(x, y - 1);
                if (right) fill(x + 1, y);
                if (bottom) fill(x, y + 1);
                if (left) fill(x - 1, y);
            };

            fill(this.selectionEnd.x, this.selectionEnd.y);
        } else if (this.selectionMode === 'select') {
            const startX = Math.min(this.selectionStart.x, this.selectionEnd.x);
            const startY = Math.min(this.selectionStart.y, this.selectionEnd.y);
            const endX = Math.max(this.selectionStart.x, this.selectionEnd.x);
            const endY = Math.max(this.selectionStart.y, this.selectionEnd.y);
            
            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    if (this.mapData[y][x] !== 0 && this.mapData[y][x] !== -1 && this.mapData[y][x] !== 33) {
                        this.selectedTiles.push({
                            x: x, 
                            y: y,
                            id: this.mapData[y][x]
                        });
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

        const atTop    = y < 4;
        const atBottom = y >= this.mapHeight - 4;
        const atLeft   = x < 7;
        const atRight  = x >= this.mapWidth - 7;
        if (this.gamemode === 'Brawl_Ball' 
            && this.mapSize === this.mapSizes.regular
            && (atTop || atBottom) && (atLeft || atRight)) {
                this.isDrawing = false;
                return;
        }


        // Check if we can place this tile (for 2x2 tiles)
        if (def.size === 2) {
            if (x >= this.mapWidth - 1 || y >= this.mapHeight - 1) return;
            // Check if any of the 4 tiles are occupied
            for (let dy = 0; dy < 2; dy++) {
                for (let dx = 0; dx < 2; dx++) {
                    this.mapData[y + dy][x + dx] = 0;
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
        if (!def && !this.blue2Red) return tileId;

        // Handle jump pad mirroring
        if (def.name.startsWith('Jump')) {
            const mirrorMaps = {
                'Jump R': { vertical: 'R', horizontal: 'L', diagonal: 'L' },
                'Jump L': { vertical: 'L', horizontal: 'R', diagonal: 'R' },
                'Jump T': { vertical: 'B', horizontal: 'T', diagonal: 'B' },
                'Jump B': { vertical: 'T', horizontal: 'B', diagonal: 'T' },
                'Jump TR': { vertical: 'BR', horizontal: 'TL', diagonal: 'BL' },
                'Jump TL': { vertical: 'BL', horizontal: 'TR', diagonal: 'BR' },
                'Jump BR': { vertical: 'TR', horizontal: 'BL', diagonal: 'TL' },
                'Jump BL': { vertical: 'TL', horizontal: 'BR', diagonal: 'TR' }
            };

            const mirroredDirection = mirrorMaps[def.name][direction];

            // Find tile ID by mirrored name
            const mirroredDef = Object.entries(this.tileDefinitions)
                .find(([_, d]) => d.name === `Jump ${mirroredDirection}`);
            return mirroredDef ? parseInt(mirroredDef[0]) : tileId;
        }

        if (this.blue2Red) {
            switch (tileId){
                case 12: return 13;
                case 13: return 12;
                case 41: return 42;
                case 42: return 41;
                case 43: return 46;
                case 46: return 43;
                case 44: return 47;
                case 47: return 44;
            }
        }

        return tileId;
    }

    eraseTile(x, y, saveState = true) {
        if (saveState) {
            this.saveState();
        }

        const tileId = this.mapData[y][x];
        const def = this.tileDefinitions[tileId];
        if (def && def.size === 2) {
            // For 2x2 tiles, we need to clear all 4 tiles

            this.mapData[y][x + 1] = 0;
            this.mapData[y + 1][x] = 0;
            this.mapData[y + 1][x + 1] = 0;
        }
        this.mapData[y][x] = 0;

        // Handle mirroring for regular tiles
         if (this.mirrorVertical || this.mirrorHorizontal || this.mirrorDiagonal) {
            const mirrorY = this.mapHeight - 1 - y;
            const mirrorX = this.mapWidth - 1 - x;
            
            if (this.mirrorVertical) {
                if (def && def.size === 2) {
                    this.mapData[mirrorY - 1][x] = 0;
                    this.mapData[mirrorY - 1][x + 1] = 0;
                    this.mapData[mirrorY][x + 1] = 0;
                }
                this.mapData[mirrorY][x] = 0;
            }
            
            if (this.mirrorHorizontal) {
                if (def && def.size === 2) {
                    this.mapData[y + 1][mirrorX] = 0;
                    this.mapData[y][mirrorX - 1] = 0;
                    this.mapData[y + 1][mirrorX - 1] = 0;
                }
                this.mapData[y][mirrorX] = 0;
            }
            
            if (this.mirrorDiagonal) {
                if (def && def.size === 2) {
                    this.mapData[mirrorY - 1][mirrorX - 1] = 0;
                    this.mapData[mirrorY - 1][mirrorX] = 0;
                    this.mapData[mirrorY][mirrorX - 1] = 0;
                }
                this.mapData[mirrorY][mirrorX] = 0;
            }
        }

        if (saveState) {
            this.draw();
            this.checkForErrors();
        }
    }


    clearMap(confirmed = false) {
        if (confirmed || confirm('Are you sure you want to clear the map?')) {
            // Save state before making changes
            this.saveState();

            this.mapData = Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));
            this.draw();
        }
    }

    async generateMapId() {
        const maps = await Firebase.readDataOnce(`users/${localStorage.getItem('user')}/maps`);

        if (!maps) return 1;

        const mapIds = Object.keys(maps);
        const numericIds = mapIds.map(id => Number(id)).filter(n => !isNaN(n));
        const maxId = numericIds.length ? Math.max(...numericIds) : 0;

        return maxId + 1;
    }
    
    async saveMap() {
        try {
            const mapLinkElement = document.getElementById('mapLink');
            let mapId;
    
            // Check if map is being saved for the first time
            if (mapLinkElement.innerText === 'https://she-fairy.github.io/atlas-horizon/map.html') {
                mapId = await this.generateMapId();
                mapLinkElement.innerText = `https://she-fairy.github.io/atlas-horizon/map.html?id=${mapId}&user=${localStorage.getItem('user')}`;
            } else {
                const currentUrl = new URL(mapLinkElement.innerText);
                mapId = currentUrl.searchParams.get('id');
            }
    
            const mapData = {
                name: document.getElementById('mapName').value !== '' ? document.getElementById('mapName').value : 'Untitled Map',
                size: document.getElementById('mapSize').value,
                gamemode: document.getElementById('gamemode').value,
                environment: document.getElementById('environment').value,
                mapData: this.mapData
            };
    
            await window.Firebase.writeData(`users/${localStorage.getItem('user')}/maps/${mapId}`, mapData);
    
            alert('Map saved successfully!');
        } catch (error) {
            console.error('Error saving map:', error);
            alert('Failed to save map. Please try again.');
        }
    }

    async createMapPNG() {
        const tileSize = this.tileSize;
        const padding = this.canvasPadding;

        const canvas = document.createElement('canvas');
        canvas.width = (this.mapWidth * tileSize) + (padding * 2);
        canvas.height = (this.mapHeight * tileSize) + (padding * 2);
        const ctx = canvas.getContext('2d');

        // Draw background
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const isDark = (x + y) % 2 === 0;
                const bgImg = isDark ? this.bgDark : this.bgLight;

                // Skip Brawl Ball corners in regular size
                if (
                    this.gamemode === 'Brawl_Ball' &&
                    this.mapSize === this.mapSizes.regular
                ) {
                    const atTop = y < 4;
                    const atBottom = y >= this.mapHeight - 4;
                    const atLeft = x < 7;
                    const atRight = x >= this.mapWidth - 7;
                    if ((atTop || atBottom) && (atLeft || atRight)) continue;
                }

                if (bgImg?.complete) {
                    ctx.drawImage(
                        bgImg,
                        x * tileSize + padding,
                        y * tileSize + padding,
                        tileSize,
                        tileSize
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

                let originalZ = dimensions[5] || 0;
                let lastInRow = !Number.isInteger(originalZ);
                let zIndex = lastInRow ? originalZ - 0.5 : originalZ;

                if (!tilesByZIndex.has(zIndex)) {
                    tilesByZIndex.set(zIndex, []);
                }
                tilesByZIndex.get(zIndex).push({ x, y, tileId, lastInRow, red: false });

            }
        }

        function getTileAt(zIndex, x, y) {
            const tiles = tilesByZIndex.get(zIndex);
            if (!tiles) return null;

            return tiles.find(tile => tile.x === x && tile.y === y) || null;
        }

        if (this.gamemode === 'Brawl_Arena'){
            const getTrackConnections = (x, y) => {
                const height = this.mapData.length;
                const width = this.mapData[0].length;
                
                // Helper function to check if a tile is a fence/rope
                const isSameType = (x, y) => {
                    if (x < 0 || x >= width || y < 0 || y >= height) return false;
                    const id = this.mapData[y][x];
                    return id === 40;
                };

                return {
                    top: isSameType(x, y - 1),
                    right: isSameType(x + 1, y),
                    bottom: isSameType(x, y + 1),
                    left: isSameType(x - 1, y)
                };
            };

            for (let y = 0; y < this.mapHeight; y++) {
                for (let x = 0; x < this.mapWidth; x++) {
                    if (this.mapData[y][x] === 47){
                        let firstRun = true;
                        const addRedToConnections = (x, y) => {
                            if (!firstRun) {
                                const tile = getTileAt(2, x, y);
                                if (!tile) {
                                    return;
                                }
                                if (tile.red) {
                                    return;
                                }

                                tile.red = true;
                            }   

                            firstRun = false;
                            const { top, right, bottom, left } = getTrackConnections(x, y);
                            if (top) addRedToConnections(x, y - 1);
                            if (right) addRedToConnections(x + 1, y);
                            if (bottom) addRedToConnections(x, y + 1);
                            if (left) addRedToConnections(x - 1, y);
                        };

                        addRedToConnections(x, y);
                    }
                }
            }
        }

        // Draw tiles in z-index order
        Array.from(tilesByZIndex.keys())
            .sort((a, b) => a - b)
            .forEach(zIndex => {
                const tiles = tilesByZIndex.get(zIndex);

                // Group tiles by row (y value)
                const rows = new Map();

                tiles.forEach(tile => {
                    const { y } = tile;
                    if (!rows.has(y)) {
                        rows.set(y, []);
                    }
                    rows.get(y).push(tile);
                });

                // Draw tiles row by row
                Array.from(rows.keys())
                    .sort((a, b) => a - b)
                    .forEach(y => {
                        const rowTiles = rows.get(y);

                        // Separate regular and lastInRow tiles
                        const normalTiles = [];
                        const lastInRowTiles = [];

                        rowTiles.forEach(tile => {
                            if (tile.lastInRow) {
                                lastInRowTiles.push(tile);
                            } else {
                                normalTiles.push(tile);
                            }
                        });

                        // Sort both groups by x
                        normalTiles.sort((a, b) => a.x - b.x);
                        lastInRowTiles.sort((a, b) => a.x - b.x); // Optional, just in case of multiple

                        [...normalTiles, ...lastInRowTiles].forEach(({ x, y, tileId }) => {
                            const tile = getTileAt(2, x, y);
                            const red = tile?.red ?? false;

                            this.drawTile(ctx, tileId, x, y, red);

                        });
                    });
            });

        // Draw goal images if any
        if (this.goalImages?.length) {
            for (const goal of this.goalImages) {
                const img =
                    this.goalImageCache[`${goal.name}_${this.environment}`] ||
                    this.goalImageCache[goal.name];
                if (!img || !img.complete) continue;

                ctx.drawImage(
                    img,
                    goal.x * tileSize + padding + (goal.offsetX || 0),
                    goal.y * tileSize + padding + (goal.offsetY || 0),
                    (goal.w || 1) * tileSize,
                    (goal.h || 1) * tileSize
                );
            }
        }

        return canvas.toDataURL('image/png');
    }




    async exportMap(code = this.mapData, gamemode, env) {
        const mapName = document.getElementById('mapName').value || 'Untitled Map';
        const dataUrl = await this.createMapPNG(code, gamemode, env);

        const link = document.createElement('a');
        link.download = `${mapName}.png`;
        link.href = dataUrl;
        link.click();
    }


    loadGoalImage(name, environment) {
        return new Promise((resolve) => {
            const img = new Image();
            const fallback = `Resources/Global/Goals/${name}.png`;
            const envPath = `Resources/Global/Goals/${name}${environment}.png`;

            img.onload = () => resolve(img);
            img.onerror = () => {
                // Retry with default fallback if environment-specific one fails
                img.onerror = null;
                img.src = fallback;
            };
            img.src = envPath;
        });
    }

    async setGamemode(gamemode, apply = true) {
        const previousGamemode = this.gamemode;
        this.gamemode = gamemode;
        this.goalImages = [];


        // Remove objectives
        if (this.mapData.every(row => row.every(tile => tile === 0))) {
            for (let y = 0; y < this.mapHeight; y++) {
                for (let x = 0; x < this.mapWidth; x++) {
                    if (this.mapData[y][x] === 14) this.mapData[y][x] = 0;
                }
            }
        }

        Object.entries(this.tileDefinitions).forEach(([key, value]) => {
            if (value.showInGamemode && value.showInGamemode !== this.gamemode) {
                for (let y = 0; y < this.mapHeight; y++) {
                    for (let x = 0; x < this.mapWidth; x++) {
                        if (this.mapData[y][x] === parseInt(key)) this.mapData[y][x] = 0;
                    }
                }
            }
        });


        const middleX = Math.floor(this.mapWidth / 2);
        const middleY = Math.floor(this.mapHeight / 2);

        const isBrawl = gamemode === 'Brawl_Ball';
        const wasBrawl = previousGamemode === 'Brawl_Ball';

        // REGULAR MAP - Brawl Ball
        if (this.mapSize === this.mapSizes.regular) {
            const corners = [[0, 0], [0, 14], [29, 0], [29, 14]];
            if (isBrawl) {
                for (const [startX, startY] of corners) {
                    for (let y = 0; y < 4; y++) {
                        for (let x = 0; x < 7; x++) {
                            this.mapData[startX + y][startY + x] = 33; // Empty2 tile
                        }
                    }
                }
                let red = { name: 'goalRed', x: middleX - 3, y: 0, w: 7, h: 3.5, offsetX: 0, offsetY: -20 };
                let blue = { name: 'goalBlue', x: middleX - 3, y: this.mapHeight - 5, w: 7, h: 3.5, offsetX: 0, offsetY: -10 };

                if (this.environment === 'Stadium'){
                    red = { name: 'goalRed', x: middleX - 3, y: 0, w: 7, h: 4.5, offsetX: 0, offsetY: -20 };
                    blue = { name: 'goalBlue', x: middleX - 3, y: this.mapHeight - 4, w: 7, h: 4.5, offsetX: 0, offsetY: -10 };
                }
                this.goalImages.push(
                    red, blue
                );
                await Promise.all(
                    this.goalImages.map(goal => this.preloadGoalImage(goal.name, this.environment))
                );

                if (apply) {
                    // Clear previous spawn tiles
                    this.placeTile(middleX, 0, 42, false);                      // Red
                    this.placeTile(middleX, this.mapHeight - 1, 41, false);     // Blue
                    this.placeTile(middleX - 2, 0, 42, false);                  // Red
                    this.placeTile(middleX - 2, this.mapHeight - 1, 41, false); // Blue
                    this.placeTile(middleX + 2, 0, 42, false);                  // Red
                    this.placeTile(middleX + 2, this.mapHeight - 1, 41, false); // Blue

                    // Place spawn tiles
                    this.placeTile(middleX, 8, 13, false);      // Red
                    this.placeTile(middleX, this.mapHeight - 9, 12, false);   // Blue
                    this.placeTile(middleX - 2, 8, 13, false);                              // Red
                    this.placeTile(middleX - 2, this.mapHeight - 9, 12, false); // Blue
                    this.placeTile(middleX + 2, 8, 13, false);                              // Red
                    this.placeTile(middleX + 2, this.mapHeight - 9, 12, false); // Blue
                }

            } else if (wasBrawl) {
                for (const [startX, startY] of corners) {
                    for (let y = 0; y < 4; y++) {
                        for (let x = 0; x < 7; x++) {
                            if (this.mapData[startX + y][startY + x] === 33) {
                                this.mapData[startX + y][startY + x] = 0;
                            }
                        }
                    }
                }
            }
        }

        // SHOWDOWN MAP - Brawl Ball
        if (this.mapSize === this.mapSizes.showdown && isBrawl) {
            this.goalImages.push(
            { name: 'goal5v5Blue', x: 12, y: middleY - 8, w: 3, h: 16, offsetX: -10, offsetY: -8 },
            { name: 'goal5v5Red',  x: this.mapWidth - 15, y: middleY - 8, w: 3, h: 16, offsetX:  10, offsetY: -8 }
            );

            // ← add this:
            await Promise.all(
            this.goalImages.map(g => this.preloadGoalImage(g.name, this.environment))
            );
        }

        if (apply && (this.mapData.every(row => row.every(tile => tile === 0 || tile === 14 || tile === 13 || tile === 12 || tile === 33)))) 
            this.applyDefaultLayoutIfEmpty();


        this.initializeTileSelector();
        this.loadTileImages();
        this.draw();
    }

    applyDefaultLayoutIfEmpty() {
        const { mapWidth, mapHeight } = this;
        const midX = Math.floor(mapWidth / 2);
        const topY = 0;
        const bottomY = mapHeight - 1;

        this.mapData = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(0));

        // Place spawns for regular maps
        if (this.mapSize === this.mapSizes.regular) {
            if (this.gamemode === 'Duels') {
                this.mapData[topY][midX] = 13;      // Red
                this.mapData[bottomY][midX] = 12;   // Blue
                if (this.mapData[topY][midX - 2] === 13) {
                    this.mapData[topY][midX - 2] = 0;
                }
                if (this.mapData[topY][midX + 2] === 13) {
                    this.mapData[topY][midX + 2] = 0;
                }
                if (this.mapData[bottomY][midX - 2] === 12) {
                    this.mapData[bottomY][midX - 2] = 0;
                }
                if (this.mapData[bottomY][midX + 2] === 12) {
                    this.mapData[bottomY][midX + 2] = 0;
                }
            } else if (this.gamemode === 'Brawl_Ball') {
                this.mapData[8][midX] = 13;      // Red
                this.mapData[bottomY - 8][midX] = 12;   // Blue
                this.mapData[8][midX - 2] = 13;  // Red
                this.mapData[bottomY - 8][midX - 2] = 12; // Blue
                this.mapData[8][midX + 2] = 13;  // Red
                this.mapData[bottomY - 8][midX + 2] = 12; // Blue
                for (let x = 0; x < mapWidth; x++) {
                    if (this.mapData[0][x] === 13) {
                        this.mapData[0][x] = 0;
                    }
                }
                for (let x = 0; x < mapWidth; x++) {
                    if (this.mapData[bottomY][x] === 12) {
                        this.mapData[bottomY][x] = 0;
                    }
                }
            } else {
                [midX - 2, midX, midX + 2].forEach(x => {
                    this.mapData[topY][x] = 13;
                    this.mapData[bottomY][x] = 12;
                });
            }

            // Center objectives
            const centerY = Math.floor(mapHeight / 2);
            const centerX = midX;
            const objectiveModes = [
                'Gem_Grab', 'Brawl_Ball', 'Bounty', 'Hot_Zone',
                'Hold_The_Trophy', 'Basket_Brawl', 'Volley_Brawl'
            ];
            if (objectiveModes.includes(this.gamemode)) {
                this.placeTile(centerX, centerY, 14, false); // Place objective tile
            } else if (this.gamemode === 'Heist' || this.gamemode === 'Snowtel_Thieves') {
                this.placeTile(centerX, 4, 14, false);
                this.placeTile(centerX, mapHeight - 5, 14, false);
            }
        }

        // Showdown-specific Brawl Ball setup
        if (this.mapSize === this.mapSizes.showdown && this.gamemode === 'Brawl_Ball') {
            const centerX = Math.floor(mapWidth / 2);
            const centerY = Math.floor(mapHeight / 2);
            const topLeft = centerX - 1;
            const topTop = centerY - 1;
            this.mapData[topTop][topLeft] = 14;

            // Unbreakables on col 10 and mirrored
            for (let y = centerY - 8; y <= centerY + 7; y++) {
                this.mapData[y][10] = 11;
                this.mapData[y][mapWidth - 11] = 11;
            }
            // Extend Unbreakables
            for (let x = 10; x <= 14; x++) {
                this.mapData[centerY + 7][x] = 11;
                this.mapData[centerY + 7][mapWidth - x - 1] = 11;
                this.mapData[centerY - 8][x] = 11;
                this.mapData[centerY - 8][mapWidth - x - 1] = 11;
            }

            // Fill water from edges to col 1–9 and col width-10–width
            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x <= 9; x++) this.mapData[y][x] = 8;
                for (let x = mapWidth - 10; x < mapWidth; x++) this.mapData[y][x] = 8;
            }

        } else if (this.mapSize === this.mapSizes.showdown && (this.gamemode === 'Gem_Grab' || this.gamemode === 'Bounty' || this.gamemode === 'Hot_Zone')) {
            // Gem Grab-specific setup
            const centerX = Math.floor(mapWidth / 2);
            const centerY = Math.floor(mapHeight / 2);
            const topLeft = centerX - 1;
            const topTop = centerY - 1;
            this.mapData[topTop][topLeft] = 14;
        }
        this.draw();
    }
    
    setSize(size, changing = true) {
        const newSize = this.mapSizes[size];
            if (!newSize) return;

            if (!changing || confirm('Changing map size will clear the current map. Continue?')) {
                this.mapSize   = newSize;
                this.mapWidth  = newSize.width;
                this.mapHeight = newSize.height;
                this.mapData   = Array(this.mapHeight).fill().map(() => Array(this.mapWidth).fill(0));

                // ——— Showdown ↔ other: adjust Objective tile + data sizes ———
                const isShowdown = size => size === this.mapSizes.showdown;
                const isShowdownNow = isShowdown(newSize);

                if (!isShowdownNow) {
                    this.tileDefinitions[14].size = 1;
                    this.objectiveData.Gem_Grab[0] = 2; // width
                    this.objectiveData.Gem_Grab[1] = 2; // height
                    this.objectiveData.Gem_Grab[2] = -50; 
                    this.objectiveData.Gem_Grab[3] = -50;
                    this.objectiveData.Brawl_Ball[0] = 1.3;
                    this.objectiveData.Brawl_Ball[1] = 1.495;
                    this.objectiveData.Brawl_Ball[2] = -15;
                    this.objectiveData.Brawl_Ball[3] = -20; 
                    this.objectiveData.Basket_Brawl[0] = 1.3;
                    this.objectiveData.Basket_Brawl[1] = 1.495;
                    this.objectiveData.Basket_Brawl[2] = -15;
                    this.objectiveData.Basket_Brawl[3] = -20; 
                    this.objectiveData.Volley_Brawl[0] = 1.3;
                    this.objectiveData.Volley_Brawl[1] = 1.495;
                    this.objectiveData.Volley_Brawl[2] = -15;
                    this.objectiveData.Volley_Brawl[3] = -20; 
                    this.objectiveData.Hot_Zone[0] = 7;
                    this.objectiveData.Hot_Zone[1] = 7;
                    this.objectiveData.Hot_Zone[2] = -300;
                    this.objectiveData.Hot_Zone[3] = -300; 
                    this.objectiveData.Bounty[0] = 1.15;
                    this.objectiveData.Bounty[1] = 2.0585;
                    this.objectiveData.Bounty[2] = -10;
                    this.objectiveData.Bounty[3] = -50;
                    this.objectiveData.Heist[0] = 2;
                    this.objectiveData.Heist[1] = 2.21;
                    this.objectiveData.Heist[2] = -50;
                    this.objectiveData.Heist[3] = -115; 
                    this.objectiveData.Snowtel_Thieves[0] = 4;
                    this.objectiveData.Snowtel_Thieves[1] = 4;
                    this.objectiveData.Snowtel_Thieves[2] = -150;
                    this.objectiveData.Snowtel_Thieves[3] = -150; 
                } else {
                    this.tileDefinitions[14].size = 2;
                    // restore original width/height
                    this.objectiveData.Gem_Grab[0] = 1;
                    this.objectiveData.Gem_Grab[1] = 1;
                    this.objectiveData.Gem_Grab[2] = 0;
                    this.objectiveData.Gem_Grab[3] = 0;
                    this.objectiveData.Brawl_Ball[0] = 0.65;
                    this.objectiveData.Brawl_Ball[1] = 0.7475;
                    this.objectiveData.Brawl_Ball[2] = 30;
                    this.objectiveData.Brawl_Ball[3] = 30;
                    this.objectiveData.Basket_Brawl[0] = 0.65;
                    this.objectiveData.Basket_Brawl[1] = 0.7475;
                    this.objectiveData.Basket_Brawl[2] = 30;
                    this.objectiveData.Basket_Brawl[3] = 30;
                    this.objectiveData.Volley_Brawl[0] = 0.65;
                    this.objectiveData.Volley_Brawl[1] = 0.7475;
                    this.objectiveData.Volley_Brawl[2] = 30;
                    this.objectiveData.Volley_Brawl[3] = 30;
                    this.objectiveData.Hot_Zone[0] = 3.5;
                    this.objectiveData.Hot_Zone[1] = 3.5;
                    this.objectiveData.Hot_Zone[2] = -250;
                    this.objectiveData.Hot_Zone[3] = -250;
                    this.objectiveData.Bounty[0] = 0.575;
                    this.objectiveData.Bounty[1] = 1.02925;
                    this.objectiveData.Bounty[2] = 41.5;
                    this.objectiveData.Bounty[3] = 35;
                    this.objectiveData.Heist[0] = 1;
                    this.objectiveData.Heist[1] = 1.105;
                    this.objectiveData.Heist[2] = 0;
                    this.objectiveData.Heist[3] = -20; 
                    this.objectiveData.Snowtel_Thieves[0] = 2;
                    this.objectiveData.Snowtel_Thieves[1] = 2;
                    this.objectiveData.Snowtel_Thieves[2] = -100;
                    this.objectiveData.Snowtel_Thieves[3] = -100; 
                }

                // ————————————————————————————————————————————————

                this.updateCanvasSize();
                this.fitMapToScreen();
                this.setGamemode(this.gamemode);
            } else {
                // reset dropdown if cancelled
                e.target.value = Object.entries(this.mapSizes)
                    .find(([k, v]) => v.width === this.mapWidth && v.height === this.mapHeight)[0];
            }
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

    toggleBlue2Red() {
        this.blue2Red = !this.blue2Red;
        const blue2RedBtn = document.getElementById('blue2RedBtn');
        blue2RedBtn.checked = this.blue2Red;
        blue2RedBtn.parentElement.classList.toggle('active', this.blue2Red);
    }

    toggleEraseMode(state = !this.isErasing) {
        this.isErasing = state;
        const eraseBtn = document.getElementById('eraseBtn');
        eraseBtn.checked = this.isErasing;
        eraseBtn.parentElement.classList.toggle('active', this.isErasing);
    }

    toggleGuides(state = !this.showGuides) {
        this.showGuides = state;
        const guidesBtn = document.getElementById('guidesBtn');
        guidesBtn.checked = this.showGuides;
        guidesBtn.parentElement.classList.toggle('active', this.showGuides);
        this.draw();
    }

    // Add method to check if a tile is a block
    isBlock(tileId) {
        const blockIds = [1, 3, 4, 5, 6, 7, 8, 9, 11]; // IDs for Wall, Wall2, Crate, Barrel, Cactus, Water, Fence, Rope Fence, Unbreakable
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
    
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.mapData[y][x];
    
                // Skip block tiles
                if (this.isBlock(tileId)) continue;
    
                // Get 8 neighbors in clockwise order (starting top-left)
                const directions = [
                    { dx: -1, dy: -1 }, // top-left
                    { dx:  0, dy: -1 }, // top
                    { dx:  1, dy: -1 }, // top-right
                    { dx:  1, dy:  0 }, // right
                    { dx:  1, dy:  1 }, // bottom-right
                    { dx:  0, dy:  1 }, // bottom
                    { dx: -1, dy:  1 }, // bottom-left
                    { dx: -1, dy:  0 }, // left
                ];
    
                // Create circular array of block booleans
                const neighborBlocks = directions.map(dir => {
                    const nx = x + dir.dx;
                    const ny = y + dir.dy;
                    return this.isBlockAt(nx, ny);
                });
    
                // Shift starting point to avoid false positives from block lines
                let startIndex = 0;
                for (let i = 0; i < 7; i++) {
                    if (neighborBlocks[i] !== neighborBlocks[(i + 1) % 8]) {
                        startIndex = (i + 1) % 8;
                        break;
                    }
                }
    
                // Count transitions and total blocks
                let transitions = -1;
                let blockCount = 0;
                for (let i = 0; i < 8; i++) {
                    const current = neighborBlocks[(startIndex + i) % 8];
                    const next = neighborBlocks[(startIndex + i + 1) % 8];
                    if (current !== next) transitions++;
                    if (next) blockCount++;
                }
                
                if (transitions > 1 && blockCount === 2){
                    const trueIndexes = neighborBlocks
                    .map((val, index) => val ? index : -1)
                    .filter(index => index !== -1);

                    if (trueIndexes.every(a => a % 2 === 0) && trueIndexes[1] % 4 - trueIndexes[0] % 4 === 2) break;
                }

                    // Extra helper check for vertical/horizontal aligned blocks
                const verticalPair = this.isBlockAt(x, y - 1) && this.isBlockAt(x, y + 1);
                const horizontalPair = this.isBlockAt(x - 1, y) && this.isBlockAt(x + 1, y);

                const fullySurrounded = transitions === 0 && neighborBlocks[startIndex];
                const disconnected = transitions >= 2;
                const denseCluster = transitions === 1 && blockCount > 5;
                const specialCase = transitions === 1 && blockCount === 5 && (verticalPair || horizontalPair);

                if (fullySurrounded || disconnected || denseCluster || specialCase) {
                    this.errorTiles.add(`${x},${y}`);
                }
            }
        }
    }
    
    isBlockAt(x, y) {
        if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) return true;
        return this.isBlock(this.mapData[y][x]);
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
        // Get the tile coordinates
        const coords = this.getTileCoordinates(event);
        if (coords.x < 0 || coords.x >= this.mapWidth || coords.y < 0 || coords.y >= this.mapHeight) return;
        
        // Get the tile ID at the clicked position
        const tileId = this.mapData[coords.y][coords.x];
        if (tileId === 0 || tileId === -1) return; // Skip empty and occupied tiles
        
        // Get the tile definition
        const def = this.tileDefinitions[tileId];
        if (!def) return;
        
        // Set the selected tile
        this.selectedTile = { id: tileId, ...def };
        
        // Update the UI to show the selected tile
        const container = document.getElementById('tileSelector');
        container.querySelectorAll('.tile-btn').forEach(b => {
            if (b.title === def.name) {
                b.classList.add('selected');
            } else {
                b.classList.remove('selected');
            }
        });
    }

    drawTilePreview(tileId, x, y, alpha = 0.75) {
        const def = this.tileDefinitions[tileId];
        if (!def) return;

        let img = this.tileImages[tileId];
        if (!img || !img.complete) return;

        // Get tile dimensions from environment-specific or base data
        let dimensions;
        if (def.name === 'Objective') {
            dimensions = this.environmentObjectiveData[this.environment]?.[this.gamemode] ||
                         this.objectiveData[this.gamemode];
        } else {
            dimensions = this.environmentTileData[this.environment]?.[def.name] ||
                         this.tileData[def.name];
        }

        if (!dimensions) return;

        const [scaleX, scaleY, offsetX = 0, offsetY = 0, opacity = 1] = dimensions;
        const size = def.size || 1;
        const tileSize = this.tileSize;

        // Calculate drawing dimensions
        const width = tileSize * scaleX * size;
        const height = tileSize * scaleY * size;

        // Calculate position with offsets and padding
        const drawX = x * tileSize + (tileSize * offsetX / 100) + this.canvasPadding;
        const drawY = y * tileSize + (tileSize * offsetY / 100) + this.canvasPadding;

        // Set opacity and draw the tile
        this.ctx.save();
        this.ctx.globalAlpha = alpha * opacity;
        this.ctx.drawImage(img, drawX, drawY, width, height);
        this.ctx.restore();
    }

    drawSelectDragGhost(offsetX, offsetY) {
        for (const t of this.selectDragTiles) {
            const newX = t.x + offsetX;
            const newY = t.y + offsetY;
            if (
                newX >= 0 && newX < this.mapWidth &&
                newY >= 0 && newY < this.mapHeight
            ) {
                this.drawTilePreview(t.id, newX, newY, 0.5);

                // Mirroring logic
                const size = this.tileDefinitions[t.id]?.size || 1;
                const mirrorY = this.mapHeight - 1 - newY;
                const mirrorX = this.mapWidth - 1 - newX;

                if (this.mirrorVertical) {
                    const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                    const mirrorId = this.getMirroredTileId(t.id, 'vertical');
                    if (adjustedY >= 0 && adjustedY < this.mapHeight)
                        this.drawTilePreview(mirrorId, newX, adjustedY, 0.5);
                }
                if (this.mirrorHorizontal) {
                    const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                    const mirrorId = this.getMirroredTileId(t.id, 'horizontal');
                    if (adjustedX >= 0 && adjustedX < this.mapWidth)
                        this.drawTilePreview(mirrorId, adjustedX, newY, 0.5);
                }
                if (this.mirrorDiagonal) {
                    const adjustedY = size === 2 ? mirrorY - 1 : mirrorY;
                    const adjustedX = size === 2 ? mirrorX - 1 : mirrorX;
                    const mirrorId = this.getMirroredTileId(t.id, 'diagonal');
                    if (adjustedX >= 0 && adjustedX < this.mapWidth && adjustedY >= 0 && adjustedY < this.mapHeight)
                        this.drawTilePreview(mirrorId, adjustedX, adjustedY, 0.5);
                }
            }
        }
    }
}

window.addEventListener('load', () => {
    window.mapMaker = new MapMaker('mapCanvas');
    const urlParams = new URLSearchParams(window.location.search);
    const mapId = urlParams.get('id') || null;
    const user = urlParams.get('user') || null;

    if (mapId && user === localStorage.getItem('user')) {
        window.Firebase.readDataOnce(`users/${user}/maps/${mapId}`)
            .then(async data => {
                if (!data) return alert('Map not found.');

                const sizeKey = data.size;  // e.g. "regular"
                const newSize  = window.mapMaker.mapSizes[sizeKey];
                window.mapMaker.setSize(sizeKey, false);
                window.mapMaker.mapWidth  = newSize.width;
                window.mapMaker.mapHeight = newSize.height;
                window.mapMaker.mapData   = data.mapData;

                window.mapMaker.updateCanvasSize();
                window.mapMaker.fitMapToScreen();

                window.mapMaker.setEnvironment(data.environment);

                document.getElementById('mapName').value = data.name;
                document.getElementById('mapSize').value = data.size;
                document.getElementById('gamemode').value = data.gamemode;
                document.getElementById('environment').value = data.environment;
                document.getElementById('mapLink').innerText = `https://she-fairy.github.io/atlas-horizon/map.html?id=${mapId}&user=${user}`;
                window.mapMaker.draw();
                await window.mapMaker.setGamemode(data.gamemode, false);
            })
            .catch(error => {
                console.error('Error loading map:', error);
                alert('Failed to load map. Please try again.');
            });
    } else if (mapId && user){
        window.Firebase.readDataOnce(`users/${user}/maps/${mapId}`)
            .then(async data => {
                if (data) {
                    data.name += `by- ${user}`;
                    let newId = window.mapMaker.generateMapId();
                    await window.Firebase.writeData(`users/${localStorage.getItem('user')}/maps/${newId}`, data);
                    window.location.href = `https://she-fairy.github.io/atlas-horizon/map.html?id=${newId}&user=${localStorage.getItem('username')}`;
                }
            })
    }
});

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
    'Snowtel_2': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Medieval_Manor': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Super_City_2': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Spongebob': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Oddity_Shop': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Skating_Bowl': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Hockey': FENCE_LOGIC_TYPES.SIX_PIECE,
    'Escape_Room': FENCE_LOGIC_TYPES.BINARY_CODE
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

    getFenceImageName(x, y, mapData, environment, isFence = true) {
        console.log(`Getting fence image for ${isFence ? 'fence' : 'rope'} at (${x},${y}) in ${environment}`);
        
        // Determine which logic to use based on environment
        const logicType = isFence ? FENCE_LOGIC_BY_ENVIRONMENT[environment] : FENCE_LOGIC_TYPES.FOUR_PIECE;
        console.log(`Using logic type: ${logicType}`);
        
        // Get the implementation for this logic type
        const logicHandler = this.logicImplementations[logicType];
        if (!logicHandler) {
            console.error(`No handler found for fence logic type: ${logicType}`);
            return 'Fence'; // Default fallback
        }

        // Get connections (true if connected, false if not)
        const connections = this.getConnections(x, y, mapData, isFence);
        console.log(`Connections:`, connections);
        
        // Call the appropriate logic handler
        const result = logicHandler.call(this, connections);
        console.log(`Resulting image name: ${result}`);
        return result;
    }

    getConnections(x, y, mapData, isFence) {
        const height = mapData.length;
        const width = mapData[0].length;
        
        // Helper function to check if a tile is a fence/rope
        const isSameType = (x, y) => {
            if (x < 0 || x >= width || y < 0 || y >= height) return false;
            const tileId = mapData[y][x];
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
        if ((top && bottom) || // Connected vertically
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

class MapMaker {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        this.canvasPadding = 16;  // Add padding for the canvas

        this.tileImages = {};
        
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
        
        // Initialize undo/redo stacks
        this.undoStack = [];
        this.redoStack = [];
        
        this.zoomLevel = 1;
        this.minZoom = 0.25;  // Allow zooming out more
        this.maxZoom = 3;     // Allow zooming in more
        this.zoomStep = 0.1;  // Make zoom steps smaller for more gradual zooming

        // Initialize canvas size with padding
        this.canvas.width = (this.mapWidth * this.tileSize) + (this.canvasPadding * 2);
        this.canvas.height = (this.mapHeight * this.tileSize) + (this.canvasPadding * 2);

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
        this.gamemode = 'Gem_Grab';
        this.environment = 'Desert';

        // Selection mode
        this.selectionMode = 'single';
        this.selectionStart = null;
        this.selectionEnd = null;
        this.hoveredTiles = new Set();
        this.mouseDown = false;

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
            'Cactus': [1.1, 1.75, -5, -50, 1, 5],
            'Water': [1, 1, 0, 0, 1, 5],
            // Base fence types
            'Fence': [1, 1.61, 0, -50, 1, 5],
            'Rope Fence': [1, 1.75, 0, -50, 1, 5],
            // Simple Block Logic variations
            'Horizontal': [1, 1.26, 0, -12.6, 1, 5],
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
            'Post_TR': [1.5, 2.75, 0, -145, 1, 5],
            'Post_R': [1.5, 1.8, 0, -50, 1, 5],
            'Post_T': [1, 2.75, 0, -145, 1, 5],
            'Skull': [1, 1.08, 0, 0, 1, 5],
            'Unbreakable': [1, 1.75, 0, -50, 1, 5],
            'Blue Spawn': [1.7, 1.7, -27.5, -27.5, 0.85, 5],
            'Red Spawn': [1.7, 1.7, -27.5, -27.5, 0.85, 5],
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
            'Bolt': [1, 1.18, 0, 0, 1, 5]
        };

        // Initialize objective data
        this.objectiveData = {
            'Gem_Grab': [2, 2, -50, -50, 1, 10],
            'Showdown': [1, 1.75, 0, -50, 1, 5],
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
                'Skull': [1, 1.59, -2.5, -42.5, 1, 5],
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
                'Skull': [1, 1.59, -2.5, -42.5, 1, 5],
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

    }

    

    // Add a method to preload all water tile images
    preloadWaterTiles() {
        console.log("Preloading water tiles...");
        this.waterTileFilenames.forEach(filename => {
            const imagePath = `Resources/${this.environment}/Water/${filename}`;
            const cacheKey = `water_${filename}`; // Use a specific cache key for water tiles
            
            // Create and load the image if it doesn't exist in cache
            if (!this.tileImages[cacheKey]) {
                const img = new Image();
                img.src = imagePath;
                
                // Add error handling
                img.onerror = () => {
                    console.error(`Failed to load water image: ${imagePath}`);
                    // Try to load a fallback image
                    img.src = `Resources/${this.environment}/Water/00000000.png`;
                };
                
                // Store the image in the tileImages object with the cache key
                this.tileImages[cacheKey] = img;
            }
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

    // Update the drawTile method to handle water tiles more robustly
    drawTile(ctx, tileId, x, y) {
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
            if (!img || !img.complete) {
                ctx.fillStyle = 'rgba(0, 0, 255, 0.1)'; // Reduced opacity from 0.2 to 0.1
                ctx.fillRect(
                    x * this.tileSize + this.canvasPadding,
                    y * this.tileSize + this.canvasPadding,
                    this.tileSize,
                    this.tileSize
                );
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
            
            if (!img.complete) {
                // Draw placeholder
                ctx.fillStyle = 'rgba(150, 150, 150, 0.2)';
                ctx.fillRect(
                    x * this.tileSize + this.canvasPadding,
                    y * this.tileSize + this.canvasPadding,
                    this.tileSize,
                    this.tileSize
                );
                return;
            }
        } else {
            img = this.tileImages[tileId];
        }

        if (!img || !img.complete) return;

        // Get tile dimensions data
        let dimensions;
        if (def.name === 'Objective') {
            dimensions = this.environmentObjectiveData[this.environment]?.[this.gamemode] || 
                        this.objectiveData[this.gamemode];
        } else {
            // For fence and rope fence variations, use the specific variation's dimensions
            const isFence = tileId === 7;
            const isRope = tileId === 9;
            if (isFence || isRope) {
                const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData, this.environment, isFence);
                const ropeMapping = {
                    'T': 'Post_T',
                    'R': 'Post_R',
                    'TR': 'Post_TR',
                    'Fence': 'Post'
                };
                const finalImageName = isFence ? imageName : (ropeMapping[imageName] || 'Post');
                
                // First check environment-specific data
                dimensions = this.environmentTileData[this.environment]?.[finalImageName] ||
                           // Then check base tile data
                           this.tileData[finalImageName] ||
                           // Fall back to base fence/rope fence in environment data
                           this.environmentTileData[this.environment]?.[isFence ? 'Fence' : 'Rope Fence'] ||
                           // Finally fall back to base tile data
                           this.tileData[isFence ? 'Fence' : 'Rope Fence'];
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

    async initialize() {
        try {
            await this.loadEnvironmentBackgrounds();
            await this.loadTileImages();
            this.setGamemode(this.gamemode);
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
        this.tileImages = {};
        const imageLoadPromises = [];

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
            'Blue Spawn': [1.7, 1.7, -27.5, -27.5, 0.85, 5],
            'Red Spawn': [1.7, 1.7, -27.5, -27.5, 0.85, 5],
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
        
        // Return a Promise that resolves when all images are loaded
        return new Promise((resolve) => {
            let loadedCount = 0;
            const totalImages = Object.keys(this.tileDefinitions).length;
            
            const onLoad = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    this.draw();
                    resolve();
                }
            };
            
            // Load each tile image
            Object.entries(this.tileDefinitions).forEach(([id, def]) => {
                if (!def.img && !def.getImg) {
                    onLoad(); // Skip tiles without images
                    return;
                }
                
                const img = new Image();
                if (def.img) {
                    img.src = `Resources/${def.img.replace('${env}', this.environment)}`;
                } else if (def.getImg) {
                    const imgData = def.getImg(this.gamemode, 0, this.mapHeight);
                    if (imgData) {
                        img.src = `Resources/${imgData.img.replace('${env}', this.environment)}`;
                    }
                }
                
                img.onload = onLoad;
                img.onerror = () => {
                    if (this.environment !== 'Desert' && (def.img || '').includes('${env}')) {
                        img.src = `Resources/${(def.img || '').replace('${env}', 'Desert')}`;
                    } else {
                        onLoad(); // Count as loaded even if it fails
                    }
                };
                
                this.tileImages[id] = img;
            });
        });
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
        
        // Update canvas size to include padding
        this.updateCanvasSize();
    }

    fitMapToScreen() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = container.clientHeight - 40;
        
        const scaleX = containerWidth / this.canvas.width;
        const scaleY = containerHeight / this.canvas.height;
        this.zoomLevel = Math.min(scaleX, scaleY, 1);
        
        this.updateCanvasZoom();
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
                case 'backspace':
                case 'delete':
                    if (e.ctrlKey || e.metaKey) 
                        this.clearMap(true);
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
            
            this.canvas.style.cursor = 'grabbing';
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
        
        if (this.isDragging) {
            this.draw(); // Redraw the base map
            
            // Draw preview
            const draggedTile = this.tileDefinitions[this.draggedTileId];

            if (draggedTile) {
                const drawTilePreview = (tileId, x, y) => {
                    const img = this.tileImages[tileId];
                    if (img && img.complete) {
                        const aspectRatio = img.height / img.width;
                        const drawHeight = this.tileSize * aspectRatio;
                        const baseDrawY = y * this.tileSize + this.tileSize - drawHeight;
                        
                        // Get tile dimensions from tileData
                        const tileData = this.tileData[draggedTile.name];
                        const [scaleX, scaleY, offsetX = 0, offsetY = 0] = tileData || [1, 1, 0, 0];
                        
                        // Calculate width and height based on tile size
                        const width = this.tileSize * scaleX * (draggedTile.size || 1);
                        const height = drawHeight * scaleY * (draggedTile.size || 1);
                        
                        // Calculate position with offsets
                        const drawX = x * this.tileSize + (this.tileSize * offsetX / 100) + this.canvasPadding;
                        const drawY = baseDrawY + (this.tileSize * offsetY / 100) + this.canvasPadding;
                        
                        this.ctx.drawImage(
                            img,
                            drawX,
                            drawY,
                            width,
                            height
                        );
                    }
                };

                // Draw the main dragged tile
                drawTilePreview(this.draggedTileId, coords.x, coords.y);
                
                // Show mirrored previews with correct directions
                if (this.mirrorVertical) {
                    const mirrorY = this.mapHeight - 1 - coords.y;
                    const mirrorTileId = this.getMirroredTileId(this.draggedTileId, 'vertical');
                    const adjustedY = draggedTile.size === 2 ? mirrorY - 1 : mirrorY;
                    drawTilePreview(mirrorTileId, coords.x, adjustedY);
                }
                if (this.mirrorHorizontal) {
                    const mirrorX = this.mapWidth - 1 - coords.x;
                    const mirrorTileId = this.getMirroredTileId(this.draggedTileId, 'horizontal');
                    const adjustedX = draggedTile.size === 2 ? mirrorX - 1 : mirrorX;
                    drawTilePreview(mirrorTileId, adjustedX, coords.y);
                }
                if (this.mirrorDiagonal) {
                    const mirrorX = this.mapWidth - 1 - coords.x;
                    const mirrorY = this.mapHeight - 1 - coords.y;
                    const mirrorTileId = this.getMirroredTileId(this.draggedTileId, 'diagonal');
                    const adjustedX = draggedTile.size === 2 ? mirrorX - 1 : mirrorX;
                    const adjustedY = draggedTile.size === 2 ? mirrorY - 1 : mirrorY;
                    drawTilePreview(mirrorTileId, adjustedX, adjustedY);
                }
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

    loadTileImages() {
        this.tileImages = {};
        const imageLoadPromises = [];

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
            imageLoadPromises.push(new Promise(resolve => {
                img.onload = resolve;
            }));
        });

        // Wait for all images to load then draw
        Promise.all(imageLoadPromises).then(() => {
            this.draw();
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
            if (!img || !img.complete) {
                ctx.fillStyle = 'rgba(0, 0, 255, 0.1)'; // Reduced opacity from 0.2 to 0.1
                ctx.fillRect(
                    x * this.tileSize + this.canvasPadding,
                    y * this.tileSize + this.canvasPadding,
                    this.tileSize,
                    this.tileSize
                );
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
            
            if (!img.complete) {
                // Draw placeholder
                ctx.fillStyle = 'rgba(150, 150, 150, 0.2)';
                ctx.fillRect(
                    x * this.tileSize + this.canvasPadding,
                    y * this.tileSize + this.canvasPadding,
                    this.tileSize,
                    this.tileSize
                );
                return;
            }
        } else {
            img = this.tileImages[tileId];
        }

        if (!img || !img.complete) return;

        // Get tile dimensions data
        let dimensions;
        if (def.name === 'Objective') {
            dimensions = this.environmentObjectiveData[this.environment]?.[this.gamemode] || 
                        this.objectiveData[this.gamemode];
        } else {
            // For fence and rope fence variations, use the specific variation's dimensions
            const isFence = tileId === 7;
            const isRope = tileId === 9;
            if (isFence || isRope) {
                const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData, this.environment, isFence);
                const ropeMapping = {
                    'T': 'Post_T',
                    'R': 'Post_R',
                    'TR': 'Post_TR',
                    'Fence': 'Post'
                };
                const finalImageName = isFence ? imageName : (ropeMapping[imageName] || 'Post');
                
                // First check environment-specific data
                dimensions = this.environmentTileData[this.environment]?.[finalImageName] ||
                           // Then check base tile data
                           this.tileData[finalImageName] ||
                           // Fall back to base fence/rope fence in environment data
                           this.environmentTileData[this.environment]?.[isFence ? 'Fence' : 'Rope Fence'] ||
                           // Finally fall back to base tile data
                           this.tileData[isFence ? 'Fence' : 'Rope Fence'];
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
        this.selectionCtx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        
        if (this.selectionMode === 'single') {
            this.selectionCtx.fillRect(
                this.selectionEnd.x * this.tileSize + this.canvasPadding,
                this.selectionEnd.y * this.tileSize + this.canvasPadding,
                this.tileSize,
                this.tileSize
            );
        } else if (this.selectionMode === 'line') {
            // Highlight all tiles that have been hovered over
            for (const tilePos of this.hoveredTiles) {
                const [x, y] = tilePos.split(',').map(Number);
                this.selectionCtx.fillRect(
                    x * this.tileSize + this.canvasPadding,
                    y * this.tileSize + this.canvasPadding,
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
        if (!def) return tileId;

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

        return tileId;
    }

    eraseTile(x, y, saveState = true) {
        if (saveState) {
            this.saveState();
        }
        
        this.mapData[y][x] = 0;
        
        // Handle mirroring for regular tiles
        if (this.mirrorVertical || this.mirrorHorizontal || this.mirrorDiagonal) {
            const mirrorY = this.mapHeight - 1 - y;
            const mirrorX = this.mapWidth - 1 - x;
            
            if (this.mirrorVertical) {
                this.mapData[mirrorY][x] = 0;
            }
            
            if (this.mirrorHorizontal) {
                this.mapData[y][mirrorX] = 0;
            }
            
            if (this.mirrorDiagonal) {
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
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        const ctx = canvas.getContext('2d');
        
        // Draw the background grid
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const isDark = (x + y) % 2 === 0;
                const bgImg = isDark ? this.bgDark : this.bgLight;
                
                if (bgImg.complete) {
                    ctx.drawImage(
                        bgImg,
                        x * this.tileSize + this.canvasPadding,
                        y * this.tileSize + this.canvasPadding,
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
                    this.drawTile(ctx, tileId, x, y);
                });
            });
        
        // Create a download link
        const link = document.createElement('a');
        link.download = `${mapName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    setGamemode(gamemode) {
        this.gamemode = gamemode;
        
        // Remove all objectives from the map
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.mapData[y][x];
                if (tileId === 14) { // Objective tile ID
                    this.mapData[y][x] = 0;
                }
            }
        }

        // Check if there are any spawns on the map
        let hasSpawns = false;
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.mapData[y][x] === 12 || this.mapData[y][x] === 13) {
                    hasSpawns = true;
                    break;
                }
            }
            if (hasSpawns) break;
        }

        // Place spawns if none exist
        if (!hasSpawns) {
            const middleX = Math.floor(this.mapWidth / 2);
            
            // Check if spawn positions are empty
            const canPlaceSpawns = [
                this.mapData[0][middleX - 2] === 0,
                this.mapData[0][middleX] === 0,
                this.mapData[0][middleX + 2] === 0,
                this.mapData[this.mapHeight - 1][middleX - 2] === 0,
                this.mapData[this.mapHeight - 1][middleX] === 0,
                this.mapData[this.mapHeight - 1][middleX + 2] === 0
            ].every(Boolean);

            if (canPlaceSpawns) {
                // Place red spawns on top
                this.mapData[0][middleX - 2] = 13;
                this.mapData[0][middleX] = 13;
                this.mapData[0][middleX + 2] = 13;

                // Place blue spawns on bottom
                this.mapData[this.mapHeight - 1][middleX - 2] = 12;
                this.mapData[this.mapHeight - 1][middleX] = 12;
                this.mapData[this.mapHeight - 1][middleX + 2] = 12;
            }
        }

        // Place objectives based on gamemode
        const middleX = Math.floor(this.mapWidth / 2);
        const middleY = Math.floor(this.mapHeight / 2);

        const placeObjective = (x, y) => {
            if (this.mapData[y][x] === 0) {
                this.mapData[y][x] = 14; // Objective tile ID
            }
        };

        switch (gamemode) {
            case 'Gem_Grab':
            case 'Bounty':
            case 'Hot_Zone':
            case 'Hold_The_Trophy':
            case 'Brawl_Ball':
            case 'Basket_Brawl':
            case 'Volley_Brawl':
                if (this.mapData[middleY][middleX] === 0) {
                    placeObjective(middleX, middleY);
                }
                break;

            case 'Heist':
            case 'Snowtel_Thieves':
                const row = 4; // 5th row (0-based index)
                if (this.mapData[row][middleX] === 0 && 
                    this.mapData[this.mapHeight - 1 - row][middleX] === 0) {
                    placeObjective(middleX, row);
                    placeObjective(middleX, this.mapHeight - 1 - row);
                }
                break;

            case 'Siege':
                const siegeRow = 3; // 4th row (0-based index)
                if (this.mapData[siegeRow][middleX] === 0 && 
                    this.mapData[this.mapHeight - 1 - siegeRow][middleX] === 0) {
                    placeObjective(middleX, siegeRow);
                    placeObjective(middleX, this.mapHeight - 1 - siegeRow);
                }
                break;
        }

        // Update UI and reload images
        this.initializeTileSelector();
        this.loadTileImages();
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

    // Update the canvas size to include padding and align to top left
    updateCanvasSize() {
        // Set canvas size to map size plus padding
        this.canvas.width = (this.mapWidth * this.tileSize) + (this.canvasPadding * 2);
        this.canvas.height = (this.mapHeight * this.tileSize) + (this.canvasPadding * 2);
        
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
}

// Initialize the map maker when the page loads
window.addEventListener('load', () => {
    new MapMaker('mapCanvas');
});

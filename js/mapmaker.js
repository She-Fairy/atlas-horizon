const FENCE_LOGIC_TYPES = {
    SIMPLE_BLOCK: 1,    // Logic 1: Block, horizontal, vertical
    BINARY_CODE: 2,     // Logic 2: Binary code system (0001, 0010, etc.)
    SIX_PIECE: 3,       // Logic 3: Hor, Ver, TL, TR, BL, BR
    FOUR_PIECE: 4       // Logic 4: Single, T, TR, R
};

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
    'Beach': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
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
    'Water_Park': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Castle_Courtyard': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Brawlywood': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Fighting_Game': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Biodome': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Stunt_Show': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Deep_Sea': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Robot_Factory': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Ghost_Station': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Candyland': FENCE_LOGIC_TYPES.BINARY_CODE,
    'The_Hub': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Rooftop': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Rumble_Jungle': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Enchanted_Woods': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Ranger_Ranch': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Circus': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Starr_Toon': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Swamp_of_Love': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Coin_Factory': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Ice_Island': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Medieval_Manor': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Super_City_2': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Spongebob': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Oddities_Shop': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Skating_Bowl': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Hockey': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Escape_Room': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Katana_Kingdom': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Tropical_Island': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Brawl_Arena': FENCE_LOGIC_TYPES.SIX_PIECE,
    'Subway_Surfers': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Rails': FENCE_LOGIC_TYPES.SIX_PIECE,
    'Train': FENCE_LOGIC_TYPES.SIX_PIECE,
    'Stranger_Things': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Stranger_Things_Lab': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Stranger_Things_Lair': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Stranger_Things_Forest': FENCE_LOGIC_TYPES.BINARY_CODE,
};

const BORDER_FENCE_LOGIC_BY_ENVIRONMENT = {
    'Bazaar': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Ice_Island': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Medieval_Manor': FENCE_LOGIC_TYPES.SIMPLE_BLOCK,
    'Super_City_2': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Spongebob': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Hockey': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Katana_Kingdom': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Tropical_Island': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Subway_Surfers': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Stranger_Things_Lab': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Stranger_Things_Lair': FENCE_LOGIC_TYPES.BINARY_CODE,
    'Stranger_Things_Forest': FENCE_LOGIC_TYPES.BINARY_CODE,
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
            if (environment === 'Rails' || environment === 'Train') return tileId === 68;
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
    constructor(canvasId, headless = false, existingMap = false) {
        if (typeof canvasId === 'string') {
            this.canvas = document.getElementById(canvasId);
        } else {
            this.canvas = canvasId;
        }

        if (!this.canvas) {
            throw new Error('Canvas not found');
        }

        this.canvas.onload = () => this.centerCanvas();

        this.headless = headless;
        this.existingMap = existingMap;
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        this.canvasPadding = 16;  // Add padding for the canvas

        this.layerCount = 5;
        this.defaultTileLayer = 2;

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
        
        this.zoomLevel = 0.775;
        this.minZoom = 0.4;  // Allow zooming out more
        this.maxZoom = 3;     // Allow zooming in more
        this.zoomStep = 0.1;  // Make zoom steps smaller for more gradual zooming
        this.delta = 1.75;


        // Initialize map data
        this.mapData = this.createEmptyLayeredMap(this.mapWidth, this.mapHeight);

        
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
        this.correctMirroring = false;

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
            'Fence': [1.08, 1.71, -4, -50, 1, 5],
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
            'TNT': [1, 1.75, 0, -50, 1, 5],
            'Unbreakable': [1, 1.75, 0, -50, 1, 5],
            'Blue Spawn': [1.7, 1.7, -35, -35, 0.85, 7],
            'Red Spawn': [1.7, 1.7, -35, -35, 0.85, 7],
            'Blue Respawn': [1.7, 1.7, -35, -35, 0.85, 7],
            'Red Respawn': [1.7, 1.7, -35, -35, 0.85, 7],
            'Trio Spawn': [1.7, 1.7, -35, -35, 0.85, 7],
            'Yellow Spawn': [1.7, 1.7, -35, -35, 0.85, 7],
            'Objective': [2, 2.21, -50, -115, 1, 10],
            'Smoke': [1*1.4, 1.1*1.4, -15, -35, 1, 5],
            'Heal Pad': [1, 1.12, 0, 0, 1, 5],
            'Slow Tile': [1, 1.11, 0, 0, 1, 5],
            'Speed Tile': [1, 1.11, 0, 0, 1, 5],
            'Spikes': [1, 1.5, 0, -15, 1, 5],
            'Bumper': [1, 1.8, 0, -50, 1, 5],
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
            'TokenBlue': [1.7, 1.7, -35, -35, 1, 7],
            'TokenRed': [1.7, 1.7, -35, -35, 1, 7],
            'Box': [1, 1.75, 0, -50, 1, 5],
            'Bot_Zone': [1.9, 1.9, -46.5, -46.5, 0.85, 7],
            'Boss Zone': [7, 7, -300, -300, 1, 10],
            'Monster Zone': [7, 7, -300, -300, 1, 10],
            'Track': [1, 1, 0, 0, 1, 2],
            'Base Ike Blue': [4.8, 6, -190, -270, 1, 10],
            'Small Ike Blue': [3, 3.82, -100, -145, 1, 10],
            'Base Ike Red': [4.8, 6, -190, -270, 1, 10],
            'Small Ike Red': [3, 3.4825, -100, -110, 1, 10],
            'GodzillaCity1': [1, 1.60, 0, -45, 1, 5],
            'GodzillaCity2': [1, 1.75, 0, -53, 1, 5],
            'GodzillaCity3': [1, 1.90, 0, -75, 1, 5],
            'GodzillaCity4': [1, 2.10, 0, -95, 1, 5],
            'GodzillaExplosive': [1, 1.8, 0, -51, 1, 5],
            'GodzillaSpawn': [1.7, 1.7, -27.5, -27.5, 0.85, 7],
            'Escape': [3.5, 3.7, -172, -170, 1, 10], // Trophy Escape Portal
            'HalloweenBoss1': [6.5, 6.5, -275, -275, 1, 10],
            'HalloweenBoss2': [6.5, 6.5, -275, -275, 1, 10],
            'HalloweenBoss3': [6.5, 6.5, -275, -275, 1, 10],
            'HalloweenBoss4': [6.5, 6.5, -275, -275, 1, 10],
            'HalloweenBoss5': [6.5, 6.5, -275, -275, 1, 10],
            'OniHunt': [6.5, 6.5, -275, -275, 1, 10],
            'BossSpawn': [6.5, 6.5, -275, -275, 1, 10],
            'KaijuBoss': [6.5, 6.5, -275, -275, 1, 10],
            'SubwayRun1': [1, 0.9, 0, 40, 1, 5],
            'SubwayRun2': [0.85, 1, 15, 0, 1, 5],
            'Rails': [1, 1, 0, 0, 1, 2],
            'IceTile': [1, 1, 0, 0, 1, 5],
            'SnowTile': [1, 1, 0, 0, 1, 5],
            'TreasurePad1': [2.1, 2.21, -53, -53, 1, 7],
            'TreasurePad2': [2.1, 2.21, -53, -53, 1, 7],
            'Train_Fence': [1.85, 1.7, -44, -90, 1, 5],
            'Train_Ver': [1.3, 2.5, -15, -140, 1, 5],
            'Train_TL': [2, 2.4, -82, -155, 1, 3],
            'Train_TR': [2, 2.4, -12, -155, 1, 5],
            'Train_BL': [2, 2.4, -82, -90, 1, 3],
            'Train_BR': [2, 2.4, -12, -90, 1, 5],
            'HawkinsBoss1': [6.5, 6.5, -275, -275, 1, 10],
            'HawkinsBoss2': [6.5, 6.5, -275, -275, 1, 10],
            'HawkinsBoss3': [6.5, 6.5, -275, -275, 1, 10],
        };

        // Initialize objective data
        this.objectiveData = {
            'Gem_Grab': [2, 2, -50, -50, 1, 10],
            'Heist': [2, 2.21, -50, -115, 1, 10],
            'Bounty': [1.2, 2.0585, -10, -50, 1, 10],
            'Brawl_Ball': [1.3, 1.495, -15, -20, 1, 10],
            'Hot_Zone': [7, 7, -300, -300, 1, 10],
			'Takedown': [1.2, 1.9, -10, -50, 1, 10],
            'Snowtel_Thieves': [4, 4, -150, -150, 1, 10],
            'Token_Run': [4, 4, -150, -150, 1, 10],
            'Basket_Brawl': [1.3, 1.495, -20, -20, 1, 10],
            'Volley_Brawl': [1.3, 1.495, -20, -20, 1, 10],
            'Siege': {
                upper: [2 * 1.2, 2.64 * 1.2, -50, -135, 1, 10],  // Blue Ike (upper part) - slightly smaller
                lower: [2 * 1.2, 2.83 * 1.2, -95, -135, 1, 10]   // Red Ike (lower part) - slightly larger
            },
            'Hold_The_Trophy': [2.5, 2.5, -75, -75, 1, 10],
            'Bot_Zone': [1.9, 1.9, -46.5, -46.5, 0.85, 7],
            'Bot_Drop': [1.9, 1.9, -46.5, -46.5, 0.85, 7],
            'Paint_Brawl': [1.4, 2.2, -20, -85, 1, 10],
            'Hockey': [1.5, 1.695, -25, -26, 1, 10],
            'Dodgebrawl': [1.3, 1.495, -15, -20, 1, 10],
        };

        // Initialize environment data
        this.environmentObjectiveData = {
            City: {
                'Gem_Grab': [2.4, 2.64, -56, -85, 1, 10],
            },
            Mortuary: {
				'Volley_Brawl': [1.7, 1.7, -36, -30, 1, 10],
            },
            Retropolis: {
                'Gem_Grab': [2.4, 2.64, -56, -85, 1, 10],
            },
            Pirate_Ship: {
                'Gem_Grab': [2.13, 2.50, -56, -65, 1, 10],
            },
            Arcade: {
                'Gem_Grab': [2.4, 2.64, -56, -85, 1, 10],
            },
            Bazaar: {
                'Gem_Grab': [2.4, 2.64, -56, -85, 1, 10],
            },
            Super_City: {
                'Gem_Grab': [2.3, 2.4, -69, -60, 1, 10],
                'Heist': [1.8 * 1.2, 3.2 * 0.9, -57, -180, 1, 10],
            },
            Gift_Shop: {
                'Gem_Grab': [2.7, 2.376, -85, -70, 1, 10],
				'Hold_The_Trophy': [1.9, 3.2, -45, -125, 1, 10],
            },
            Bandstand: {
                'Gem_Grab': [2.4, 2.64, -56, -85, 1, 10],
            },
            Snowtel: {
                'Gem_Grab': [2.4, 2.64, -56, -85, 1, 10],
            },
            Starr_Force: {
                'Gem_Grab': [2, 2.24, -50, -60, 1, 10],
            },
            Water_Park: {
                'Gem_Grab': [2.4, 2.64, -56, -85, 1, 10],
            },
            Castle_Courtyard: {
                'Gem_Grab': [2.4, 2.64, -56, -85, 1, 10],
            },
            Brawlywood: {
                'Gem_Grab': [2.4, 2.64, -56, -85, 1, 10],
            },
            Fighting_Game: {
                'Gem_Grab': [2.42, 2.54, -54, -76, 1, 10],
                'Heist': [2*0.9, 3.56*0.9, -37.5, -175, 1, 10],
            },
            Biodome: {
                'Gem_Grab': [2.4, 2.5, -65, -78, 1, 10],
            },
            Stunt_Show: {
                'Gem_Grab': [2.18, 2.42, -59, -60, 1, 10],
            },
            Deep_Sea: {
                'Gem_Grab': [2.18, 2.42, -59, -60, 1, 10],
                'Heist': [2 * 1.2, 3.56 * 0.9, -75, -190, 1, 10],
				'Paint_Brawl': [1.7, 2.5, -30, -75, 1, 10],
            },
            Ghost_Station: {
                'Gem_Grab': [2.7, 2.376, -85, -70, 1, 10],
            },
            Candyland: {
                'Gem_Grab': [2.4, 2.64, -56, -85, 1, 10],
            },
            The_Hub: {
                'Gem_Grab': [2.4, 2.4, -64, -70, 1, 10],
            },
            Rumble_Jungle: {
                'Gem_Grab': [2.7, 2.376, -85, -70, 1, 10],
            },
            Enchanted_Woods: {
                'Gem_Grab': [2.3, 2.3, -64, -60, 1, 10],
            },
            Circus: {
                'Gem_Grab': [2, 2.4, -48, -50, 1, 10],
            },
            Coin_Factory: {
                'Gem_Grab': [2.18, 2.42, -59, -60, 1, 10],
            },
            Starr_Toon: {
                'Gem_Grab': [2.18, 2.42, -59, -60, 1, 10],
            },
            Swamp_of_Love: {
                'Gem_Grab': [2.5, 2.64, -58, -95, 1, 10],
            },
            Medieval_Manor: {
                'Gem_Grab': [2.7, 2.376, -85, -70, 1, 10],
            },
            Super_City_2: {
                'Gem_Grab': [2.7, 2.000, -85, -38, 1, 10],
            },
            Spongebob: {
                'Gem_Grab': [2.6, 2.5, -60, -75, 1, 10],
            },
            Hockey: {
                'Gem_Grab': [2, 2.24, -50, -60, 1, 10],
            },
            Escape_Room: {
                'Gem_Grab': [2.7, 2.376, -85, -70, 1, 10],
            },
            Oddities_Shop: {
                'Gem_Grab': [2.7, 2.376, -85, -70, 1, 10]
            },
            Skating_Bowl: {
                'Gem_Grab': [2.18, 2.42, -59, -60, 1, 10],
            },
            Katana_Kingdom: {
                'Gem_Grab': [2.4, 2.54, -40, -70, 1, 10],
                'Heist': [1.8 * 1.2, 3.2 * 0.9, -57, -185, 1, 10],
            },
            Subway_Surfers: {
                'Gem_Grab': [2.6, 2.5, -60, -75, 1, 10],
            },
            Stranger_Things: {
                'Gem_Grab': [2.9, 2.376, -95, -70, 1, 10],
            },
            Stranger_Things_Lab: {
                'Gem_Grab': [2.9, 2.376, -95, -70, 1, 10],
            },
            Stranger_Things_Forest: {
                'Gem_Grab': [2.9, 2.376, -95, -70, 1, 10],
            },
            Stranger_Things_Lair: {
                'Gem_Grab': [2.9, 2.376, -95, -70, 1, 10],
            },
        };

        this.environmentTileData = {
            Mine: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1*1.1, 1.65*1.1, -5, -50, 1, 5],
                'Cactus': [1, 1.68, 0, -50, 1, 5],
            },
            Oasis: {
                'Wall2': [1, 1.8, 0, -50, 1, 5],
                'Skull': [1*1.1, 1.59*1.1, -5, -42.5, 1, 5],
            },
            Holiday: {
                'Wall': [1*1.05, 1.73*1.05, -2.5, -55, 1, 5],
                'Wall2': [1*1.1, 1.64*1.1, -5, -50, 1, 5],
                'Barrel': [1, 1.83, 0, -52, 1, 5],
                'Skull': [1*1.1, 1.22*1.1, -5, -5, 1, 5]
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
                'Fence': [1, 1.7, 0, -45, 1, 5],
                '0001': [1/1.39, 1.39/1.39, 15, -28, 1, 5],
                '0010': [1, 1.7, 0, -45, 1, 5],
                '0011': [1.03, 1.7, 0, -45, 1, 5],
                '0100': [1, 1.7, 0, -45, 1, 5],
                '0101': [1.01, 1.7, 0, -45, 1, 5],
                '0110': [1, 1.75, 0, -50, 1, 5],
                '1000': [1/1.39, 2/1.39, 15, -30, 1, 5],
                '1001': [1/1.39, 1.44/1.39, 15, -30, 1, 5],
                '1010': [1.03, 1.85, 0, -60, 1, 5],
                '1100': [1.01, 1.85, 0, -60, 1, 5], 
            },
            Mortuary: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Cactus': [1*1.1, 1.42*1.1, -5, -27.5, 1, 5],
                'Skull': [1, 1.49, 0, -20, 1, 5],
                'Horizontal': [1, 1.67, 0, -37.5, 1, 5],
                'Fence': [1, 1.85, 0, -55, 1, 5]
            },
            Pirate_Ship: {
                'Cactus': [1, 1.69, 0, -42.5, 1, 5],
                'Skull': [1, 1.4, 0, -10, 1, 5],
                '0001': [0.7, 1, 14, -51, 1, 5],
                '0010': [1, 1.85, 0, -53, 1, 5],
                '0011': [0.9 , 1.58, 11, -53, 1, 5],
                '0100': [1, 1.85, 0, -53, 1, 5],
                '0101': [0.84 , 1.58, 0, -53, 1, 5],
                '1000': [0.7, 2, 14, -65, 1, 5],
                '1001': [0.725, 1, 13, -51, 1, 5],
                '1010': [0.9 , 2, 11, -70, 1, 5],
                '1100': [0.84 , 2, 0, -69, 1, 5],
                'Fence': [1, 1.85, 0, -53, 1, 5],
            },
            Arcade: {
                'Wall': [1, 1.8, 0, -55, 1, 5],
                'Barrel': [1, 1.91, 0, -61, 1, 5],
                'Cactus': [1, 1.71, 0, -48, 1, 5],
                'Skull': [1, 1.51, 0, -45, 1, 5],
                'Fence': [1.27, 1.85, -15, -60, 1, 5],
                'Horizontal': [1.08, 1.54, -5, -30, 1, 5],
                'Vertical': [1, 1.71, -3, -42, 1, 5],
            },
            Stadium: {
                'Cactus': [1, 2.2, 0, -82.5, 1, 5],
                'Fence': [1.27, 1.85, -15, -60, 1, 5],
                'Horizontal': [1.08, 1.54, -5, -30, 1, 5],
                'Vertical': [1, 1.71, -3, -42, 1, 5],
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.79, 0, -51, 1, 5],
                'Barrel': [1, 1.81, 0, -51, 1, 5],
				'Skull': [1, 1.51, 0, -45, 1, 5],
            },
            Bazaar: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Fence': [1, 1.85, 0, -55, 1, 5],
                'Crate': [1*1.1, 1.63*1.1, -5, -50, 1, 5],
                'Cactus': [1.15, 1.8, -9, -48, 1, 5.5],
                'Skull': [1*1.1, 1.59*1.1, -5, -42.5, 1, 5],
                'B0001': [1 / 1.39, 1.39 / 1.39, 15, -28, 1, 5],
                'B0010': [1, 1.85, 0, -55, 1, 5],
                'B0011': [1 / 1.2, 1.85, 17, -55, 1, 5],
                'B0100': [1, 1.85, 0, -55, 1, 5],
                'B0101': [1 / 1.14, 1.85, 0, -55, 1, 5],
                'B0110': [1, 1.75, 0, -50, 1, 5],
                'B1000': [1 / 1.39, 1.83 / 1.39, 15, -30, 1, 5],
                'B1001': [1 / 1.39, 1.44 / 1.39, 15, -30, 1, 5],
                'B1010': [1 / 1.18, 2.1, 16, -80, 1, 5],
                'B1100': [1 / 1.15, 2.1, 0, -80, 1, 5],
                'BFence': [1, 1.9, 0, -56.01, 1, 5],
            },
            Super_City: {
                'Barrel': [1, 1.81, 0, -51, 1, 5],
                'Bush': [1.1, 1.81, -6, -53, 1, 5],
                'Skull': [1, 1.3, 0, -3, 1, 5],
                '0001': [1 / 1.39, 1.39 / 1.39, 15, -28, 1, 5],
                '0010': [1, 1.85, 0, -55, 1, 5],
                '0011': [1 / 1.22, 1.774, 17, -47, 1, 5],
                '0100': [1, 1.85, 0, -55, 1, 5],
                '0101': [1 / 1.15, 1.785, 0, -47, 1, 5],
                '1000': [1 / 1.39, 1.7, 15, -30, 1, 5],
                '1001': [1 / 1.39, 1.4, 15, -50, 1, 5],
                '1010': [1 / 1.19, 2, 16, -70, 1, 5],
                '1100': [1 / 1.15, 2, 0, -70, 1, 5],
                'Fence': [1, 1.85, 0, -55, 1, 5],
            },
            Gift_Shop: {
                'Wall': [1, 1.75, 0, -47, 1, 5],
                'Wall2': [1, 1.65, 0, -35, 1, 5],
                'Cactus': [1, 1.69, 0, -42.5, 1, 5],
                'Skull': [1, 2.1, 0, -80, 1, 5],
                '0001': [0.7, 1, 14, -51, 1, 5],
                '0010': [1, 1.85, 0, -53, 1, 5],
                '0011': [0.9 , 1.58, 11, -53, 1, 5],
                '0100': [1, 1.85, 0, -53, 1, 5],
                '0101': [0.84 , 1.58, 0, -53, 1, 5],
                '1000': [0.7, 1.8, 14, -65, 1, 5],
                '1001': [0.725, 1, 13, -51, 1, 5],
                '1010': [0.9 , 2, 11, -70, 1, 5],
                '1100': [0.84 , 2, 0, -69, 1, 5],
                'Fence': [1, 1.85, 0, -53, 1, 5],
            },
            Bandstand:{
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Fence': [1, 1.85, 0, -55, 1, 5],
                'Skull': [1*1.1, 1.59*1.1, -5, -42.5, 1, 5],
            },
            Snowtel: {
                'Horizontal': [1.05, 1.323, -2.5, -15, 1, 5],
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Skull': [1*1.1, 1.22*1.1, -5, -30, 1, 5]
            },
            Scrapyard: {
                'Cactus': [1, 1.79, 0, -51, 1, 5],
                'Barrel': [1, 1.81, 0, -51, 1, 5],
                'Skull': [1, 1.51, 0, -45, 1, 5],
                '0001': [1.2, 1.3, -10, -50, 1, 5],
                '0101': [1, 1.1, 0, -30, 1, 7],
                '0011': [1, 1.1, 0, -30, 1, 7],
                '0010': [1.1, 1.53, -10, -43, 1, 5],
                '0100': [1.1, 1.53, 0, -43, 1, 5],
                '1000': [1.2, 1.6, -10, -25, 1, 5],
                '1001': [1, 1, 0, -20, 1, 5],
                '1010': [1, 1.4, 0, -30, 1, 5],
                '1100': [1, 1.4, 0, -30, 1, 5],
                'Fence': [1, 1.4, 0, -30, 1, 5],
                'Post': [1, 1.7, 0, -50, 1, 5],
                'Post_TR': [1.66, 2.4, 0, -120, 1, 5],
                'Post_R': [1.6, 1.7, 0, -50, 1, 5],
                'Post_T': [1, 2.4, 0, -120, 1, 5],
            },
            Starr_Force: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.88, 0, -61, 1, 5],
                'Crate': [1, 1.5, 0, -26, 1, 5],
                'Cactus': [1, 1.7, 0, -42, 1, 5],
                'Barrel': [1, 1.81, 0, -51, 1, 5],
                'Skull': [1.1, 1.7, -5, -51, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -50, 1, 5],
                '0011': [1, 1.8, 0, -50, 1, 5],
                '0100': [1, 1.8, 0, -50, 1, 5],
                '0101': [1, 1.8, 0, -50, 1, 5],
                '1000': [1, 2.1, 0, -75, 1, 5],
                '1001': [1, 1.83, 0, -73, 1, 5],
                '1010': [1, 2.1, 0, -79, 1, 5],
                '1100': [1, 2.1, 0, -79, 1, 5],
                'Fence': [1, 1.8, 0, -50, 1, 5],
                'Post': [1, 1.7, 0, -50, 1, 5],
                'Post_TR': [1.66, 2.4, 0, -120, 1, 5],
                'Post_R': [1.6, 1.7, 0, -50, 1, 5],
                'Post_T': [1, 2.4, 0, -120, 1, 5],
            },
            Wild_West: {
                'Wall': [1*1.1, 1.63*1.1, -5, -50, 1, 5],
                'Wall2': [1*1.1, 1.63*1.1, -5, -50, 1, 5],
                'Skull': [1*1.1, 1.22*1.1, -5, -5, 1, 5]
            },
            Water_Park: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Crate': [1, 1.8, 0, -51, 1, 5],
                'Barrel': [1, 1.81, 0, -51, 1, 5],
                'Cactus': [1, 1.8, 0, -51, 1, 5],
                'Skull': [1, 1.7, 0, -41, 1, 5],
                '0001': [0.8, 1.6, 10, -45, 1, 5],
                '0010': [0.9, 1.6, 10, -45, 1, 5],
                '0011': [0.9, 1.6, 10, -45, 1, 5],
                '0100': [0.9, 1.6, 0, -45, 1, 5],
                '0101': [0.9, 1.6, 0, -45, 1, 5],
                '1000': [0.8, 1.8, 10, -80, 1, 5],
                '1001': [0.8, 1.8, 10, -80, 1, 5],
                '1010': [0.9, 2.04, 10, -89, 1, 5],
                '1100': [0.9, 2.04, 0, -89, 1, 5],
                'Fence': [1, 1.6, 0, -45, 1, 5],
                'Post': [1, 1.7, 0, -40, 1, 5],
                'Post_R': [1.5, 1.7, 0, -40, 1, 5],
                'Post_T': [1, 2.47, 0, -116.75, 1, 5],
                'Post_TR': [1.45, 2.5, 0, -115.75, 1, 5],
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
            Brawlywood: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Crate': [1, 1.8, 0, -51, 1, 5],
                'Barrel': [1, 1.8, 0, -51, 1, 5],
                'Cactus': [1, 2.1, 0, -70, 1, 5],
                'Skull': [1, 1.51, 0, -45, 1, 5],
                '0001': [0.6, 1.7, 22, -51, 1, 5],
                '0010': [1, 1.8, 0, -51, 1, 5],
                '0011': [1, 1.8, 0, -51, 1, 5],
                '0100': [1, 1.8, 0, -51, 1, 5],
                '0101': [1, 1.8, 0, -51, 1, 5],
                '1000': [0.6, 1.7, 22, -51, 1, 5],
                '1001': [0.6, 1.7, 22, -51, 1, 5],
                '1010': [1, 1.9, 0, -62, 1, 5],
                '1100': [1, 1.9, 0, -62, 1, 5],
                'Fence': [1, 1.8, 0, -51, 1, 5],
            },
            Fighting_Game: {
                'Cactus': [1.18, 1.85, -9, -60, 1, 5.5],
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
            },
            Biodome: {
                'Barrel': [1, 1.81, 0, -51, 1, 5],
                'Cactus': [1, 1.8, 0, -51, 1, 5],
                'Skull': [1, 1.5, 0, -25, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -56, 1, 5],
                '0100': [1, 1.8, 0, -56, 1, 5],
                '0011': [1, 1.5, 0, -55, 1, 5],
                '0101': [1, 1.5, 0, -55, 1, 5],
                '1000': [0.9, 1.8, 6, -55, 1, 5],
                '1001': [1, 1.3, 0, -55, 1, 5],
                '1010': [1, 1.79, 2.4, -55, 1, 5],
                '1100': [0.96, 1.8, 0, -55, 1, 5],
                'Fence': [1, 1.8, 0, -56, 1, 5],
                'Post': [0.77, 1.8, 13, -65, 1, 5],
                'Post_R': [1.5, 1.8, 13, -65, 1, 5],
                'Post_T': [0.77, 2.3, 13, -115.6, 1, 5],
                'Post_TR': [1.5, 2.3, 13, -115.6, 1, 5],
            },
            Stunt_Show: {
                'Wall': [1, 1.8, 0, -50, 1, 5],
                'Wall2': [1, 1.8, 0, -50, 1, 5],
                'Crate': [1, 1.6, 0, -35, 1, 5],
                'Barrel': [1, 1.7, 0, -38, 1, 5],
                'Cactus': [1, 1.8, 0, -50, 1, 5],
                'Skull': [1, 1.5, 0, -30, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -55, 1, 5],
                '0011': [1, 1.5, 0, -55, 1, 5],
                '0100': [1, 1.8, 0, -55, 1, 5],
                '0101': [1, 1.5, 0, -55, 1, 5],
                '1000': [1, 1.8, 0, -55, 1, 5],
                '1001': [1, 1.05, 0, -55, 1, 5],
                '1010': [1, 2, 0, -75, 1, 5],
                '1100': [1, 2, 0, -75, 1, 5],
                'Fence': [1, 1.8, 0, -55, 1, 5],
                'Post': [1, 1.8, 0, -50, 1, 5],
                'Post_R': [1.5, 1.8, 0, -50, 1, 5],
                'Post_T': [1, 2.1, 0, -75.6, 1, 5],
                'Post_TR': [1.5, 2.1, 0, -75.6, 1, 5],
            },
            Deep_Sea: {
                'Cactus': [1, 1.95, 0, -66, 1, 5],
                'Barrel': [1, 1.81, 0, -51, 1, 5],
                '0001': [1.2, 1.3, -10, -50, 1, 5],
                '0101': [1, 1.2, 0, -30, 1, 7],
                '0011': [1, 1.2, 0, -30, 1, 7],
                '0010': [1.1, 1.53, -10, -43, 1, 5],
                '0100': [1.1, 1.53, 0, -43, 1, 5],
                '1000': [1.2, 1.6, -10, -25, 1, 5],
                '1001': [1, 1, 0, -20, 1, 5],
                '1010': [1, 1.4, 0, -30, 1, 5],
                '1100': [1, 1.4, 0, -30, 1, 5],
                'Fence': [1, 1.4, 0, -30, 1, 5],
                'Post': [0.9, 1.8, 2, -58, 1, 5],
                'Post_TR': [1.6, 2.45, 3, -127.75, 1, 5],
                'Post_R': [1.5, 1.8, 4, -58, 1, 5],
                'Post_T': [0.9, 2.5, 5, -127.75, 1, 5],
            },
            Robot_Factory: {
                'Wall': [1, 1.8, 0, -53, 1, 5],
                'Wall2': [1, 1.8, 0, -53, 1, 5],
                'Crate': [1, 1.8, 0, -53, 1, 5],
                'Barrel': [1, 1.81, 0, -51, 1, 5],
                'Cactus': [1, 1.81, 0, -51, 1, 5],
                'Skull': [1, 1.4, 0, -23, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -55, 1, 5],
                '0011': [1, 1.5, 0, -55, 1, 5],
                '0100': [1, 1.8, 0, -55, 1, 5],
                '0101': [1, 1.5, 0, -55, 1, 5],
                '1000': [1, 1.8, 0, -55, 1, 5],
                '1001': [1, 1, 0, -53, 1, 5],
                '1010': [1, 2, 0, -75, 1, 5],
                '1100': [1, 2, 0, -75, 1, 5],
                'Fence': [1, 1.8, 0, -55, 1, 5],
                'Post': [1, 1.7, 0, -50, 1, 5],
                'Post_TR': [1.66, 2.4, 0, -120, 1, 5],
                'Post_R': [1.6, 1.7, 0, -50, 1, 5],
                'Post_T': [1, 2.4, 0, -120, 1, 5],
            },
            Ghost_Station: {
                'Cactus': [1, 1.7, 0, -42, 1, 5],
                'Bush': [1, 1.75, 0, -51, 1, 5],
                'Skull': [1, 1.5, 0, -41, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.7, 0, -55, 1, 5],
                '0011': [1, 1.7, 0, -55, 1, 5],
                '0100': [1, 1.7, 0, -55, 1, 5],
                '0101': [1, 1.7, 0, -55, 1, 5],
                '1000': [1, 1.8, 0, -55, 1, 5],
                '1001': [1, 1.05, 0, -55, 1, 5],
                '1010': [1, 1.7, 0, -55, 1, 5],
                '1100': [1, 1.7, 0, -55, 1, 5],
                'Fence': [1, 1.7, 0, -55, 1, 5],
                'Post': [0.9, 1.8, 5, -70, 1, 5],
                'Post_TR': [1.5, 2.3, 8, -120, 1, 5],
                'Post_R': [1.5, 1.8, 6, -70, 1, 5],
                'Post_T': [0.9, 2.3, 5, -120, 1, 5],
            },
            Candyland: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Crate': [1, 1.8, 0, -51, 1, 5],
                'Barrel': [1, 1.8, 0, -51, 1, 5],
                'Cactus': [1.1, 2.1, -4, -70, 1, 5.5],
                'Bush': [1, 1.75, 0, -51, 1, 5],
                'Skull': [1, 1.51, 0, -15, 1, 5],
                '0001': [1, 1, 0, 0, 1, 5],
                '0011': [1, 1, 0, 0, 1, 5],
                '0101': [1, 1, 0, 0, 1, 5],
                '1001': [1, 1, 0, 0, 1, 5],
                '1000': [1, 1.3, 0, 0, 1, 5],
                '1010': [1, 1.3, 0, 0, 1, 5],
                '1100': [1, 1.3, 0, 0, 1, 5],
                '0010': [1, 1.3, 0, 0, 1, 5],
                '0100': [1, 1.3, 0, 0, 1, 5],
                'Fence': [1, 1.3, 0, 0, 1, 5],
                'Post': [1.1, 1.8, -5, -50, 1, 5],
                'Post_TR': [1.5, 2.47, -5, -116.75, 1, 5],
                'Post_R': [1.5, 1.8, -6, -50, 1, 5],
                'Post_T': [1.1, 2.47, -5, -116.75, 1, 5],
            },
            The_Hub: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.88, 0, -58.5, 1, 5],
                'Crate': [1, 1.8, 0, -51, 1, 5],
                'Barrel': [1, 1.82, 0, -51, 1, 5],
                'Cactus': [1, 1.82, 0, -51, 1, 5],
                'Skull': [1, 1.3, 0, -15, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -55, 1, 5],
                '0011': [1, 1.5, 0, -55, 1, 5],
                '0100': [1, 1.8, 0, -55, 1, 5],
                '0101': [1, 1.5, 0, -55, 1, 5],
                '1000': [1, 1.8, 0, -55, 1, 5],
                '1001': [1, 1.05, 0, -55, 1, 5],
                '1010': [1, 2.3, 0, -105, 1, 5],
                '1100': [1, 2.3, 0, -105, 1, 5],
                'Fence': [1, 1.8, 0, -55, 1, 5],
                'Post': [0.9, 1.8, 5, -70, 1, 5],
                'Post_TR': [1.5, 2.3, 8, -120, 1, 5],
                'Post_R': [1.5, 1.8, 6, -70, 1, 5],
                'Post_T': [0.9, 2.3, 5, -120, 1, 5],
            },
            Rooftop: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Crate': [1, 1.8, 0, -51, 1, 5],
                'Barrel': [1, 1.8, 0, -51, 1, 5],
                'Cactus': [1, 1.8, 0, -51, 1, 5],
                'Skull': [1, 1.8, 0, -58, 1, 5],
                'Horizontal': [1, 1.54, 0, -40, 1, 5],
            },
            Rumble_Jungle: {
                'Cactus': [1 * 1.1, 1.67 * 1.1, -5, -45, 1, 5.5],
                'Bush': [1, 1.75, 0, -51, 1, 5],
                'Skull': [1 * 1.1, 1.59 * 1.1, -5, -42.5, 1, 5],
                '0001': [1.2, 1.3, -10, -48, 1, 5],
                '0010': [1, 1.86, 0, -50, 1, 5],
                '0011': [1, 1.055, 0, -24, 1, 5],
                '0100': [1, 1.86, 0, -50, 1, 5],
                '0101': [1, 1.055, 0, -24, 1, 5],
                '1000': [1, 1.6, 0, -23, 1, 5],
                '1001': [1.2, 1.1, -11, -33, 1, 5],
                '1010': [1, 1.6, 0, -24, 1, 5],
                '1100': [1, 1.6, 0, -24, 1, 5],
                'Fence': [1, 1.8, 0, -44, 1, 5],
                'Post': [1, 2, 0, -75, 1, 5],
                'Post_TR': [2 / 1.465, 2.18, 0, -92.5, 1, 5],
                'Post_R': [2 / 1.465, 2, 0, -75, 1, 5],
                'Post_T': [1, 2.18, 0, -92.5, 1, 5],
            },
            Enchanted_Woods: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 2, 0, -69, 1, 5],
                'Cactus': [1, 1.68, 0, -51, 1, 5],
                'Skull': [1, 1.4, 0, -10, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -56, 1, 5],
                '0011': [1, 1.5, 0, -50, 1, 5],
                '0100': [1, 1.8, 0, -56, 1, 5],
                '0101': [1, 1.5, 0, -50, 1, 5],
                '1000': [0.9, 1.8, 6, -55, 1, 5],
                '1001': [1, 1.3, 0, -55, 1, 5],
                '1010': [1, 1.9, 0, -70, 1, 5],
                '1100': [1, 1.9, 0, -70, 1, 5],
                'Fence': [1, 1.8, 0, -56, 1, 5],
                'Post': [1, 1.8, 0, -50, 1, 5],
                'Post_TR': [1.5, 2.4, 4, -109, 1, 5],
                'Post_R': [1.5, 1.8, 0, -50, 1, 5],
                'Post_T': [1, 2.4, 0, -108, 1, 5],
            },
            Ranger_Ranch: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Skull': [1, 1.81, 0, -51, 1, 5],
                'Post': [1, 1.8, 0, -50, 1, 5],
                'Post_TR': [1.5, 2.47, 0, -118, 1, 5],
                'Post_R': [1.5, 1.8, 0, -50, 1, 5],
                'Post_T': [1, 2.47, 0, -118, 1, 5],
            },
            Circus: {
                'Cactus': [1, 2, 0, -57, 1, 5],
                'Skull': [1.1, 2.1, 0, -80, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -55, 1, 5],
                '0011': [1, 1.45, 0, -50, 1, 5],
                '0100': [1, 1.8, 0, -55, 1, 5],
                '0101': [1, 1.45, 0, -50, 1, 5],
                '1000': [1, 1.8, 0, -41, 1, 5],
                '1001': [1, 1.4, 0, -41, 1, 5],
                '1010': [1, 1.8, 0, -55, 1, 5],
                '1100': [1, 1.8, 0, -55, 1, 5],
                'Fence': [1, 1.8, 0, -55, 1, 5],
                'Post': [1, 1.75, 0, -50, 1, 5],
                'Post_TR': [1.5, 2.61, 0, -116.5, 1, 5],
                'Post_R': [1.5, 1.7475, 0, -50, 1, 5],
                'Post_T': [1, 2.61, 0, -116, 1, 5],
            },
            Coin_Factory: {
                'Wall': [1, 1.8, 0, -53, 1, 5],
                'Wall2': [1, 1.8, 0, -53, 1, 5],
                'Crate': [1, 1.8, 0, -53, 1, 5],
                'Cactus': [1, 1.81, 0, -51, 1, 5],
                'Skull': [1, 1.6, 0, -31, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -55, 1, 5],
                '0011': [1, 1.5, 0, -55, 1, 5],
                '0100': [1, 1.8, 0, -55, 1, 5],
                '0101': [1, 1.5, 0, -55, 1, 5],
                '1000': [1, 1.8, 0, -55, 1, 5],
                '1001': [1, 1, 0, -53, 1, 5],
                '1010': [1, 2, 0, -75, 1, 5],
                '1100': [1, 2, 0, -75, 1, 5],
                'Fence': [1, 1.8, 0, -55, 1, 5],
                'Post': [1, 1.75, 0, -50, 1, 5],
                'Post_R': [1.5, 1.7475, 0, -50, 1, 5],
                'Post_T': [1, 1.95, 0, -68.5, 1, 5],
                'Post_TR': [1.5, 1.95, 0, -68.5, 1, 5],
            },
            Starr_Toon: {
                'Wall': [1, 1.8, 0, -48, 1, 5],
                'Wall2': [1, 1.8, 0, -48, 1, 5],
                'Crate': [1, 1.8, 0, -48, 1, 5],
                'Barrel': [1, 1.8, 0, -48, 1, 5],
                'Cactus': [1, 1.4, 0, -19, 1, 5],
                'Bush': [1, 1.75, 0, -51, 1, 5],
                'Skull': [1, 1.9, 0, -56, 1, 5],
                '0001': [1, 1.85, 0, -55, 1, 5],
                '0010': [1, 1.85, 0, -55, 1, 5],
                '0011': [1, 1.85, 0, -55, 1, 5],
                '0100': [1, 1.85, 0, -55, 1, 5],
                '0101': [1, 1.85, 0, -55, 1, 5],
                '0110': [1, 1.75, 0, -50, 1, 5],
                '1000': [1, 1.85, 0, -55, 1, 5],
                '1001': [1, 1.85, 0, -55, 1, 5],
                '1010': [1, 1.85, 0, -55, 1, 5],
                '1100': [1, 1.85, 0, -55, 1, 5],
                'Fence': [1, 1.35, 0, -6, 1, 5],
            },
            Ice_Island: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Skull': [1 * 1.1, 1.22 * 1.1, -5, -30, 1, 5],
                'Post': [1, 1.8, 0, -50, 1, 5],
                'Horizontal': [1.05, 1.323, -2.5, -22, 1, 5],
                'Post_TR': [1.5, 2.47, 0, -118, 1, 5],
                'Post_R': [1.5, 1.8, 0, -50, 1, 5],
                'Post_T': [1, 2.47, 0, -118, 1, 5],
            },
            Swamp_of_Love: {
                'Horizontal': [1.05, 1.323, -2.5, -25, 1, 5],
                'Cactus': [1*1.2, 1.36*1.2, -10, -40, 1, 5]
            },
            Medieval_Manor: {
                'Cactus': [1.1, 1.6, -5, -36, 1, 5],
                '0001': [1.250, 1.7, -12, -52, 1, 5],
                '0010': [1, 1.5, 0, -30, 1, 5],
                '0011': [1, 1.5, 0, -30, 1, 5],
                '0100': [1, 1.5, 0, -30, 1, 5],
                '0101': [1, 1.5, 0, -30, 1, 5],
                '1000': [1.250, 1.7, -12, -52, 1, 5],
                '1001': [1.250, 1.7, -12, -52, 1, 5],
                '1010': [1, 1.5, 0, -30, 1, 5],
                '1100': [1, 1.5, 0, -30, 1, 5],
                'Fence': [1, 1.5, 0, -30, 1, 5],
                'BFence': [1, 1.6, 0, -28, 1, 5],
                'Post': [1, 1.8, 0, -50, 1, 5],
                'Post_TR': [1.5, 2.47, 0, -118.75, 1, 5],
                'Post_R': [1.5, 1.8, 0, -50, 1, 5],
                'Post_T': [1, 2.47, 0, -118.75, 1, 5],
            },
            Super_City_2: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Crate': [1, 1.8, 0, -51, 1, 5],
                'Barrel': [1, 1.82, 0, -51, 1, 5],
                'Skull': [1, 1.81, 0, -51, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -55, 1, 5],
                '0011': [1, 1.5, 0, -55, 1, 5],
                '0100': [1, 1.8, 0, -55, 1, 5],
                '0101': [1, 1.5, 0, -55, 1, 5],
                '1000': [1, 1.8, 0, -55, 1, 5],
                '1001': [1, 1.05, 0, -55, 1, 5],
                '1010': [1, 2, 0, -75, 1, 5],
                '1100': [1, 2, 0, -75, 1, 5],
                'Fence': [1, 1.80, 0, -55, 1, 5],
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
                'Post': [1, 1.8, 0, -50, 1, 5],
                'Post_TR': [1.5, 2.4, 0, -112, 1, 5],
                'Post_R': [1.5, 1.8, 0, -50, 1, 5],
                'Post_T': [1, 2.4, 0, -112, 1, 5],
            },
            Spongebob: {
                'Wall2': [1, 1.8, 0, -49, 1, 5],
                'Crate': [1, 1.8, 0, -51, 1, 5],
                'Barrel': [1, 1.7, 0, -49, 1, 5],
                'Cactus': [1.2, 1.89, -10, -59, 1, 5.5],
                'Bush': [1.05, 1.9, -2, -58, 1, 5],
                'Skull': [1, 1.5, 0, -22, 1, 5],
                'Fence': [1.03, 1.71, -2, -50, 1, 5],
                'Horizontal': [1, 1.2, 0, -15, 1, 5],
                'Vertical': [1, 1.84, 0, -50, 1, 5],
                'Post': [0.9, 1.8, 5, -66, 1, 5],
                'Post_TR': [1.4, 2.65, 5, -150.50, 1, 5],
                'Post_R': [1.4, 1.8, 5, -66, 1, 5],
                'Post_T': [0.9, 2.65, 5, -150.50, 1, 5],
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
            Skating_Bowl: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Crate': [1, 1.8, 0, -51, 1, 5],
                'Barrel': [1.2, 1.8, -10, -51, 1, 5.5],
                'Cactus': [1, 1.8, 0, -51, 1, 5],
                'Skull': [1, 1.4, 0, -20, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -55, 1, 5],
                '0011': [1, 1.5, 0, -55, 1, 5],
                '0100': [1, 1.8, 0, -55, 1, 5],
                '0101': [1, 1.5, 0, -55, 1, 5],
                '1000': [1, 1.8, 0, -55, 1, 5],
                '1001': [1, 1.05, 0, -55, 1, 5],
                '1010': [1, 1.8, 0, -55, 1, 5],
                '1100': [1, 1.8, 0, -55, 1, 5],
                'Fence': [1, 1.8, 0, -55, 1, 5],
                'Post': [1, 1.8, 0, -58, 1, 5],
                'Post_TR': [1.4, 2.1, 0, -85, 1, 5],
                'Post_R': [1.4, 1.7, -2, -52, 1, 5],
                'Post_T': [1, 2.1, 0, -88, 1, 5],
            },
            Hockey: {
                'Wall2': [1, 1.8, 0, -49, 1, 5],
                'Crate': [1, 1.8, 0, -50, 1, 5],
                'Barrel': [1, 1.8, 0, -51, 1, 5],
                'Cactus': [1, 1.75, 0, -55, 1, 5],
                'Skull': [1, 1.65, 0, -47, 1, 5],
                '0001': [0.6, 1.7, 22, -51, 1, 5],
                '0010': [1, 1.7, 0, -47, 1, 5],
                '0100': [1, 1.7, 0, -47, 1, 5],
                '1000': [0.6, 1.7, 22, -51, 1, 5],
                '1001': [0.6, 1.7, 22, -51, 1, 5],
                '0011': [0.9, 1.8, 10, -42, 1, 5],
                '0101': [0.9, 1.8, 0, -42, 1, 5],
                '1010': [0.9, 1.85, 10, -62, 1, 5],
                '1100': [0.9, 1.85, 0, -62, 1, 5],
                'Fence': [1, 1.7, 0, -47, 1, 5],
                'B0001': [1, 1.3, 0, -55, 1, 5],
                'B0010': [1, 1.8, 0, -55, 1, 5],
                'B0011': [1, 1.5, 0, -55, 1, 5],
                'B0100': [1, 1.8, 0, -55, 1, 5],
                'B0101': [1, 1.5, 0, -55, 1, 5],
                'B1000': [1, 1.8, 0, -55, 1, 5],
                'B1001': [1, 1.05, 0, -55, 1, 5],
                'B1010': [1, 1.8, 0, -55, 1, 5],
                'B1100': [1, 1.8, 0, -55, 1, 5],
                'BFence': [1, 1.8, 0, -55, 1, 5],
            },
            Escape_Room: {
                'Crate': [1, 1.8, 0, -61, 1, 5],
                'Barrel': [1, 1.7, 0, -51, 1, 5],
                'Cactus': [1, 1.75, 0, -53, 1, 5],
                'Skull': [1.1, 1.7, -5, -48.5, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -55, 1, 5],
                '0011': [1, 1.5, 0, -55, 1, 5],
                '0100': [1, 1.8, 0, -55, 1, 5],
                '0101': [1, 1.5, 0, -55, 1, 5],
                '1000': [1, 1.8, 0, -55, 1, 5],
                '1001': [1, 1.05, 0, -55, 1, 5],
                '1010': [1, 2, 0, -75, 1, 5],
                '1100': [1, 2, 0, -75, 1, 5],
                'Fence': [1, 1.80, 0, -55, 1, 5],
            },
            Katana_Kingdom: {
                'Wall': [1, 1.8, 0, -50, 1, 5],
                'Wall2': [1, 1.8, 0, -50, 1, 5],
                'Crate': [1, 1.65, 0, -34, 1, 5],
                'Barrel': [1, 1.75, 0, -50, 1, 5],
                'Cactus': [1, 1.8, 0, -51, 1, 5],
                'Skull': [1, 1.4, 0, -15, 1, 5],
                '0001': [1, 1.75, 0, -48, 1, 5],
                '0010': [1.1, 1.5, -5, -40, 1, 5],
                '0011': [1.1, 1.5, -5, -40, 1, 5],
                '0100': [1.1, 1.5, -5, -40, 1, 5],
                '0101': [1.1, 1.5, -5, -40, 1, 5],
                '1000': [1, 1.75, 0, -48, 1, 5],
                '1001': [1, 1.75, 0, -48, 1, 5],
                '1010': [1.1, 1.5, -5, -40, 1, 5],
                '1100': [1.1, 1.5, -5, -40, 1, 5],
                'Fence': [1.1, 1.5, -5, -40, 1, 5],
                'Post': [1, 1.8, 0, -50, 1, 5],
                'Post_TR': [1.5, 2.47, 0, -118.75, 1, 5],
                'Post_R': [1.5, 1.8, 0, -50, 1, 5],
                'Post_T': [1, 2.47, 0, -118.75, 1, 5],
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
            Subway_Surfers: {
                'Barrel': [1, 1.8, 0, -46, 1, 5],
                'Cactus': [0.93, 1.5, 4, -43, 1, 5],
                'Bush': [1, 1.75, 0, -51, 1, 5],
                'Skull': [1.1, 1.75, -3, -43, 1, 5],
                '0001': [0.76, 1.2, 10, -30, 1, 5],
                '0010': [1, 1.70, 0, -55, 1, 5],
                '0011': [0.82, 1.70, 17, -55, 1, 5],
                '0100': [1, 1.70, 0, -55, 1, 5],
                '0101': [0.82, 1.70, -1, -55, 1, 5],
                '0110': [1, 1.75, 0, -50, 1, 5],
                '1000': [0.76, 1.50, 10, -30, 1, 5],
                '1001': [0.65, 1.1, 16, -30, 1, 5],
                '1010': [0.84, 1.70, 17, -55, 1, 5],
                '1100': [0.82, 1.70, -1, -55, 1, 5],
                'Fence': [1, 1.70, 0, -55, 1, 5],
            },
            Stranger_Things: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.9, 0, -63, 1, 5],
                'Crate': [1, 1.7, 0, -31, 1, 5],
                'Barrel': [1.05, 1.85, 0, -51, 1, 5],
                'Cactus': [1, 1.95, 0, -71, 1, 5],
                'Skull': [1, 1.8, 0, -51, 1, 5],
                '0001': [1, 1.5, 0, -44, 1, 5],
                '0010': [1, 1.7, 0, -44, 1, 5],
                '0011': [1, 1.4, 0, -44, 1, 5],
                '0100': [1, 1.7, 0, -44, 1, 5],
                '0101': [1, 1.4, 0, -44, 1, 5],
                '1000': [1, 1.7, 0, -44, 1, 5],
                '1001': [1, 1.05, 0, -44, 1, 5],
                '1010': [1, 1.7, 0, -44, 1, 5],
                '1100': [1, 1.7, 0, -44, 1, 5],
                'Fence': [1, 1.7, 0, -44, 1, 5],
                'Post': [1, 1.7, 0, -50, 1, 5],
                'Post_TR': [1.6, 2.47, 0, -128, 1, 5],
                'Post_R': [1.6, 1.7, 0, -50, 1, 5],
                'Post_T': [1, 2.47, 0, -128, 1, 5],
            },
            Stranger_Things_Lair: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Crate': [1, 1.8, 0, -51, 1, 5],
                'Barrel': [1, 1.85, 0, -51, 1, 5],
                'Cactus': [1, 1.95, 0, -71, 1, 5],
                'Skull': [1, 1.5, 0, -22, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -55, 1, 5],
                '0011': [1, 1.5, 0, -55, 1, 5],
                '0100': [1, 1.8, 0, -55, 1, 5],
                '0101': [1, 1.5, 0, -55, 1, 5],
                '1000': [1, 1.8, 0, -55, 1, 5],
                '1001': [1, 1.05, 0, -55, 1, 5],
                '1010': [1, 1.8, 0, -55, 1, 5],
                '1100': [1, 1.8, 0, -55, 1, 5],
                'Fence': [1, 1.8, 0, -55, 1, 5],
                'B0001': [1, 1.6, 0, -38, 1, 5],
                'B0010': [1, 1.8, 0, -55, 1, 5],
                'B0011': [1, 1.5, 0, -55, 1, 5],
                'B0100': [1, 1.8, 0, -55, 1, 5],
                'B0101': [1, 1.5, 0, -55, 1, 5],
                'B1000': [1, 1.8, 0, -55, 1, 5],
                'B1001': [1, 1, 0, -25, 1, 5],
                'B1010': [1, 1.8, 0, -55, 1, 5],
                'B1100': [1, 1.8, 0, -55, 1, 5],
                'BFence': [1, 1.80, 0, -55, 1, 5],
            },
            Stranger_Things_Forest: {
                'Wall': [1, 1.8, 0, -50, 1, 5],
                'Wall2': [1, 1.8, 0, -50, 1, 5],
                'Barrel': [1, 1.8, 0, -50, 1, 5],
                'Cactus': [1, 1.85, 0, -48, 1, 5],
                'Skull': [1, 1.7, 0, -35, 1, 5],
                '0001': [1.2, 1.3, -10, -48, 1, 5],
                '0010': [1, 1.86, 0, -50, 1, 5],
                '0011': [1, 1.055, 0, -24, 1, 5],
                '0100': [1, 1.86, 0, -50, 1, 5],
                '0101': [1, 1.055, 0, -24, 1, 5],
                '1000': [1, 1.6, 0, -23, 1, 5],
                '1001': [1.2, 1.1, -11, -33, 1, 5],
                '1010': [1, 1.6, 0, -24, 1, 5],
                '1100': [1, 1.6, 0, -24, 1, 5],
                'Fence': [1, 1.8, 0, -44, 1, 5],
                'B0001': [1, 1.6, 0, -55, 1, 5],
                'B0010': [1, 1.8, 0, -55, 1, 5],
                'B0011': [1, 1.5, 0, -55, 1, 5],
                'B0100': [1, 1.8, 0, -55, 1, 5],
                'B0101': [1, 1.5, 0, -55, 1, 5],
                'B1000': [1, 1.8, 0, -55, 1, 5],
                'B1001': [1, 1, 0, -45, 1, 5],
                'B1010': [1, 2, 0, -75, 1, 5],
                'B1100': [1, 2, 0, -75, 1, 5],
                'BFence': [1, 1.80, 0, -55, 1, 5],
            },
            Stranger_Things_Lab: {
                'Wall': [1, 1.8, 0, -51, 1, 5],
                'Wall2': [1, 1.8, 0, -51, 1, 5],
                'Crate': [1, 1.8, 0, -51, 1, 5],
                'Barrel': [1, 1.8, 0, -51, 1, 5],
                'Cactus': [1, 1.8, 0, -51, 1, 5],
                'Skull': [1, 1.7, 0, -41, 1, 5],
                '0001': [1, 1.6, 0, -55, 1, 5],
                '0010': [1, 1.8, 0, -55, 1, 5],
                '0011': [1, 1.5, 0, -55, 1, 5],
                '0100': [1, 1.8, 0, -55, 1, 5],
                '0101': [1, 1.5, 0, -55, 1, 5],
                '1000': [1, 1.8, 0, -55, 1, 5],
                '1001': [1, 1.05, 0, -55, 1, 5],
                '1010': [1, 2, 0, -75, 1, 5],
                '1100': [1, 2, 0, -75, 1, 5],
                'Fence': [1, 1.80, 0, -55, 1, 5],
                'Post': [1, 1.7, 0, -50, 1, 5],
                'Post_TR': [1.6, 2.47, 0, -128, 1, 5],
                'Post_R': [1.6, 1.7, 0, -50, 1, 5],
                'Post_T': [1, 2.47, 0, -128, 1, 5],
            },
            Aquarium: {
                'Post': [1, 1.7, 0, -50, 1, 5],
                'Post_TR': [1.66, 2.4, 0, -120, 1, 5],
                'Post_R': [1.6, 1.7, 0, -50, 1, 5],
                'Post_T': [1, 2.4, 0, -120, 1, 5],
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
             12: { name: 'Blue Spawn', size: 1, layer:this.layerCount -1,  getImg: (gamemode) => {
                return { img: gamemode === 'Showdown' || gamemode === 'Trophy_Escape' || gamemode === 'Hunters' || gamemode ==='Subway_Run' || gamemode === 'Drumroll' ? 'Global/Spawns/3.png' : 'Global/Spawns/1.png' }; // Won't use the default spawns for the listed modes
            }},
            13: { name: 'Red Spawn', size: 1, layer:this.layerCount -1, getImg: (gamemode) => { // Will Block Red spawns to appear on Trophy_Escape or any blacklisted mode
                if (gamemode === 'Trophy_Escape' || gamemode === 'Hunters' || gamemode ==='Halloween_Boss' ||  gamemode ==='Hawkins_Hunt' || gamemode ==='Subway_Run' || gamemode === 'Drumroll') return null;
                return { img: gamemode === 'Showdown' ? 'Global/Spawns/4.png' : 'Global/Spawns/2.png' };
            }},
            14: { name: 'Objective', placeableOnThis: [-100], size: 1, layer: this.layerCount -2, getImg: (gamemode, y, mapHeight, environment) => {
                const objectives = {
                    'Gem_Grab': { img: '${env}/Gamemode_Specifics/Gem_Grab.png' },
                    'Heist': { img: '${env}/Gamemode_Specifics/Heist.png' },
                    'Bounty': { img: 'Global/Objectives/Bounty.png' },
                    'Brawl_Ball': { img: '${env}/Gamemode_Specifics/Brawl_Ball.png' },
                    'Dodgebrawl': { img: 'Global/Objectives/Dodgebrawl.png' },
					'Takedown': { img: 'Global/Objectives/Powercube.png' },
                    'Hot_Zone': { img: 'Global/Objectives/Hot_Zone.png', size: 7 },
                    'Snowtel_Thieves': { 
                        img: `Global/Objectives/${y > mapHeight/2 ? 'SnowtelThievesBlue' : 'SnowtelThievesRed'}.png`,
                        displayImg: 'Global/Objectives/SnowtelThievesBlue.png'
                    },
                    'Basket_Brawl': { img: 'Global/Objectives/Basket_Brawl.png' },
                    'Volley_Brawl': { 
                        img: environment === 'Mortuary' ? 'Mortuary/Gamemode_Specifics/Volley_Brawl.png' : 'Global/Objectives/Volley_Brawl.png' 
                    },
                    'Bot_Drop': { img: 'Global/Objectives/Bot_Zone.png' },
                    'Hockey': { img: 'Global/Objectives/Hockey.png' },
                    'Paint_Brawl': { 
                        img: environment === 'Deep_Sea' ? 'Deep_Sea/Gamemode_Specifics/Paint_Brawl.png' : 'Global/Objectives/Paint_Brawl.png' 
                    },
                    'Siege': { 
                        img: `Global/Objectives/${y > mapHeight/2 ? 'IkeBlue' : 'IkeRed'}.png`,
                        displayImg: 'Global/Objectives/IkeRed.png'
                    },
                    'Token_Run': { 
                        img: `Global/Objectives/${y > mapHeight/2 ? 'TokenRunRed' : 'TokenRunBlue'}.png`,
                        displayImg: 'Global/Objectives/TokenRunBlue.png'
                    },
                    'Hold_The_Trophy': { 
                        img: environment === 'Gift_Shop' ? 'Gift_Shop/Gamemode_Specifics/Hold_The_Trophy.png' : 'Global/Objectives/Hold_The_Trophy.png' 
                    }
                };
                return objectives[gamemode];
               },
            },
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
            34: { name: 'TokenBlue', img: 'Global/Objectives/TokenBlue.png', size: 1, showInGamemode: 'Token_Run' },
            35: { name: 'TokenRed', img: 'Global/Objectives/TokenRed.png', size: 1, showInGamemode: 'Token_Run' },
            36: { name: 'Trio Spawn', size: 1, showInGamemode: ['Showdown', 'Gem_Grab', 'Wipeout'], layer:this.layerCount -1,  getImg: (gamemode) => {
                return { img: gamemode === 'Showdown' || gamemode === 'showdown' ? 'Global/Spawns/7.png' : 'Global/Spawns/8.png' }; // Won't use the default spawns for the listed modes
            }},
            37: { name: 'Box', img: 'Global/Objectives/Box.png', showInGamemode: ['Showdown', 'Trophy_Escape'], size: 1},
            38: { name: 'Boss Zone', layer: this.layerCount -2, img: 'Global/Arena/Boss_Zone.png', showInGamemode: 'Brawl_Arena', size: 1},
            39: { name: 'Monster Zone', layer: this.layerCount -2, img: 'Global/Arena/Monster_Zone.png', showInGamemode: 'Brawl_Arena', size: 1},
            40: { name: 'Track', layer: this.layerCount -2, img: 'Global/Arena/Track/Blue/Fence.png', showInGamemode: 'Brawl_Arena', size: 1},
            41: { name: 'Blue Respawn', layer: this.layerCount -1, img: 'Global/Spawns/5.png', showInGamemode: ['Brawl_Ball', 'Hockey', 'Volley_Brawl', 'Paint_Brawl'], size: 1},
            42: { name: 'Red Respawn', layer: this.layerCount -1, img: 'Global/Spawns/6.png', showInGamemode: ['Brawl_Ball', 'Hockey', 'Volley_Brawl', 'Paint_Brawl'], size: 1},
            43: { name: 'Base Ike Blue', layer: this.layerCount -2, img: 'Global/Arena/Base_Ike_Blue.png', showInGamemode: 'Brawl_Arena', size: 1 },
            44: { name: 'Small Ike Blue', layer: this.layerCount -2, img: 'Global/Arena/Small_Ike_Blue.png', showInGamemode: 'Brawl_Arena', size: 1 },
            45: { name: 'BFence', img: '${env}/Fence_5v5/BFence.png', showInEnvironment: ['Tropical_Island', 'Super_City_2', 'Bazaar', 'Medieval_Manor', 'Ice_Island', 'Katana_Kingdom', 'Hockey', 'Spongebob', 'Subway_Surfers', 'Stranger_Things_Lair', 'Stranger_Things_Lab', 'Stranger_Things_Forest',], size: 1 },
            46: { name: 'Base Ike Red', layer: this.layerCount -2, img: 'Global/Arena/Base_Ike_Red.png', showInGamemode: 'Brawl_Arena', size: 1 },
            47: { name: 'Small Ike Red', layer: this.layerCount -2, img: 'Global/Arena/Small_Ike_Red.png', showInGamemode: 'Brawl_Arena', size: 1 },
            48: { name: 'Bumper', size: 1, showInGamemode: ['Brawl_Ball', 'Hockey', 'Paint_Brawl'], getImg: (gamemode) => {
                return { img: gamemode === 'Hockey' ? 'Global/Bumpers/HockeyBumper.png' : this.environment === 'Deep_Sea' ? 'Global/Bumpers/DeepSeaBumper.png' : 'Global/Bumpers/Bumper.png' };
            }},
            49: { name: 'TNT', img: 'Global/TNT.png', size: 1 },
            // 50: { name: 'UnbreakableBrick', img: 'Global/UnbreakableBrick.png', showInEnvironment: ['Grassy_Field','Stadium',], size: 1 },
            51: { name: 'GodzillaCity1', img: 'Global/Godzilla Tiles/GodzillaCity1.png', showInGamemode: 'Godzilla_City_Smash', size: 1},
            52: { name: 'GodzillaCity2', img: 'Global/Godzilla Tiles/GodzillaCity2.png', showInGamemode: 'Godzilla_City_Smash', size: 1},
            53: { name: 'GodzillaCity3', img: 'Global/Godzilla Tiles/GodzillaCity3.png', showInGamemode: 'Godzilla_City_Smash', size: 1},
            54: { name: 'GodzillaCity4', img: 'Global/Godzilla Tiles/GodzillaCity4.png', showInGamemode: 'Godzilla_City_Smash', size: 1},
            55: { name: 'GodzillaExplosive', img: 'Global/Godzilla Tiles/GodzillaExplosive.png', showInGamemode: 'Godzilla_City_Smash', size: 1},
            56: { name: 'GodzillaSpawn', img: 'Global/Godzilla Tiles/GodzillaSpawn.png', showInGamemode: 'Godzilla_City_Smash', size: 1},
            57: { name: 'Bot_Zone', layer: this.layerCount -2, img: 'Global/Objectives/Bot_Zone.png', showInGamemode: ['Trophy_Escape', 'Samurai_Smash'], size: 1},
            58: { name: 'Escape', layer: this.layerCount -2, img: 'Global/Objectives/Escape.png', showInGamemode: 'Trophy_Escape', size: 1},
            60: { name: 'HalloweenBoss1', img: 'Global/Boss Spawns/HalloweenBoss1.png', showInGamemode: 'Halloween_Boss', size: 1},
            61: { name: 'HalloweenBoss2', img: 'Global/Boss Spawns/HalloweenBoss2.png', showInGamemode: 'Halloween_Boss', size: 1},
            62: { name: 'HalloweenBoss3', img: 'Global/Boss Spawns/HalloweenBoss3.png', showInGamemode: 'Halloween_Boss', size: 1},
            63: { name: 'HalloweenBoss4', img: 'Global/Boss Spawns/HalloweenBoss4.png', showInGamemode: 'Halloween_Boss', size: 1},
            64: { name: 'HalloweenBoss5', img: 'Global/Boss Spawns/HalloweenBoss5.png', showInGamemode: 'Halloween_Boss', size: 1},
            65: { name: 'OniHunt', img: 'Global/Boss Spawns/OniHunt.png', showInGamemode: ['Halloween_Boss', 'Oni_Hunt',], size: 1},
            66: { name: 'SubwayRun1', img: 'Global/Objectives/SubwayRun1.png', showInGamemode: 'Subway_Run', size: 2 },
            67: { name: 'SubwayRun2', img: 'Global/Objectives/SubwayRun2.png', showInGamemode: 'Subway_Run', size: 2 },
            68: { name: 'Rails', layer: 1, img: 'Global/Special_Tiles/Rails/Fence.png', placeableOnThis: [73, 74, 75], size: 1},
            69: { name: 'IceTile', img: 'Global/Special_Tiles/IceTile/00000000.png', size: 1 },
            70: { name: 'SnowTile', img: 'Global/Special_Tiles/SnowTile/00000000.png', size: 1 },
            71: { name: 'TreasurePad1', img: 'Global/Objectives/TreasurePad1.png', showInGamemode: 'Treasure_Hunt', size: 1},
            72: { name: 'TreasurePad2', img: 'Global/Objectives/TreasurePad2.png', showInGamemode: 'Treasure_Hunt', size: 1},
            73: { name: 'RedTrain', img: 'Global/Special_Tiles/RedTrain/Train_Fence.png', placeableOn: [68], size: 1},
            74: { name: 'YellowTrain', img: 'Global/Special_Tiles/YellowTrain/Train_Fence.png', placeableOn: [68], size: 1},
            75: { name: 'GreenTrain', img: 'Global/Special_Tiles/GreenTrain/Train_Fence.png', placeableOn: [68], size: 1},
		    76: { name: 'Yellow Spawn', img: 'Global/Spawns/9.png', showInGamemode: ['Gem_Grab', 'Wipeout'], size: 1 },
            77: { name: 'HawkinsBoss1', img: 'Global/Boss Spawns/HawkinsBoss1.png', showInGamemode: 'Hawkins_Hunt', size: 1},
            78: { name: 'HawkinsBoss2', img: 'Global/Boss Spawns/HawkinsBoss2.png', showInGamemode: 'Hawkins_Hunt', size: 1},
            79: { name: 'HawkinsBoss3', img: 'Global/Boss Spawns/HawkinsBoss3.png', showInGamemode: 'Hawkins_Hunt', size: 1},
            80: { name: 'KaijuBoss', img: 'Global/Boss Spawns/KaijuBoss.png', showInGamemode: 'Super_City_Rampage', size: 1},
            81: { name: 'BossSpawn', img: 'Global/Boss Spawns/BossSpawn.png', showInGamemode: ['Boss_Fight', 'Takedown'], size: 1 },
        };

        Object.values(this.tileDefinitions).forEach(def => {
            if (!def) return;
            if (typeof def.layer !== 'number') {
                def.layer = this.defaultTileLayer;
            }
        });

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
        this.applyDeviceZoomSettings();
        this.updateCanvasSize();

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

        // === Ice and Snow support ===
        this.preloadIceAndSnowTiles();
    }

    preloadIceAndSnowTiles() {
        if (!this.tileImages) this.tileImages = {};
        if (!this.tileImagePaths) this.tileImagePaths = {};

        const tileTypes = [
            { key: "ice",  path: "Resources/Global/Special_Tiles/IceTile"  },
            { key: "snow", path: "Resources/Global/Special_Tiles/SnowTile" },
        ];

        tileTypes.forEach(type => {
            this.waterTileFilenames.forEach(filename => {
                const imagePath = `${type.path}/${filename}`;
                const cacheKey  = `${type.key}_${filename}`;

                if (this.tileImagePaths[cacheKey] === imagePath && this.tileImages[cacheKey]?.complete) {
                    return;
                }

                const img = new Image();
                img.src = imagePath;

                img.onerror = () => {
                    console.error(`❌ Failed to load ${type.key} tile: ${imagePath}`);
                    const fallbackPath = `${type.path}/00000000.png`;
                    img.src = fallbackPath;
                    this.tileImagePaths[cacheKey] = fallbackPath;
                };

                this.tileImages[cacheKey]  = img;
                this.tileImagePaths[cacheKey] = imagePath;
            });
        });
    }

    // Tiles Connection Logic
    getTileConnectionCode(x, y, type) {
        const neighbors = [
            [0, -1],  // N
            [1, -1],  // NE
            [1, 0],   // E
            [1, 1],   // SE
            [0, 1],   // S
            [-1, 1],  // SW
            [-1, 0],  // W
            [-1, -1], // NW
        ];

        let code = "";

        for (const [dx, dy] of neighbors) {
            const neighbor = this.getTile(x + dx, y + dy);
            code += neighbor === type ? "1" : "0";
        }

        return `${code}.png`;
    }

    renderTile(x, y, type) {
        const filename = this.getTileConnectionCode(x, y, type);
        const key = `${type}_${filename}`;
        const img = this.tileImages[key];

        if (img && img.complete) {
            this.ctx.drawImage(img, x * this.tileSize, y * this.tileSize);
        } else {
            console.warn(`⚠️ Missing ${type} tile for ${filename}`);
        }
    }

    async preloadGoalImage(name, environment) {
        if (!this.goalImageCache) this.goalImageCache = {};
        if (!this.tileImagePaths) this.tileImagePaths = {};

        const key = `${name}${environment}`;
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

    async initialize() {
        try {
            await this.loadEnvironmentBackgrounds();
            await this.loadTileImages();
            if (this.headless || this.existingMap) return;
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
                    const imgData = def.getImg(this.gamemode, 0, this.mapHeight, this.environment);
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

        // Use the configured maxZoom as an upper cap, but clamp between min/max
        const target = Math.min(scaleX, scaleY, this.maxZoom);
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, target));
        
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

    centerCanvas() {
        const container = this.canvas.parentElement.parentElement; // .map-editor
        const containerRect = container.getBoundingClientRect();

        const newWidth = this.canvas.offsetWidth;
        const newHeight = this.canvas.offsetHeight;

        container.scrollLeft = (newWidth - containerRect.width) / 2;
        container.scrollTop = (newHeight - containerRect.height) / 2;
    }

    updateCanvasZoom() {
        const container = this.canvas.parentElement.parentElement;
        const containerRect = container.getBoundingClientRect();

        const centerX = container.scrollLeft + containerRect.width / 2;
        const centerY = container.scrollTop + containerRect.height / 2;

        const relX = (centerX - this.canvas.offsetLeft) / (this.canvas.offsetWidth || 1);
        const relY = (centerY - this.canvas.offsetTop) / (this.canvas.offsetHeight || 1);

        const newWidth = this.canvas.width * this.zoomLevel;
        const newHeight = this.canvas.height * this.zoomLevel;

        // resize canvas
        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;

        // adjust scroll so zoom is from center
        container.scrollLeft = this.canvas.offsetLeft + newWidth * relX - containerRect.width / 2;
        container.scrollTop = this.canvas.offsetTop + newHeight * relY - containerRect.height / 2;
    }



    zoom(delta) {
        const oldZoom = this.zoomLevel;
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta * this.delta));

        if (oldZoom !== this.zoomLevel) {
            this.updateCanvasZoom();
        }
    }



    initializeEventListeners() {
        // Tool buttons
        if (this.headless) return;
        const eraseBtn = document.getElementById('eraseBtn');
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const zoomInBtnBottom = document.getElementById('zoomInBtnBottom');
        const zoomOutBtnBottom = document.getElementById('zoomOutBtnBottom');
        const clearBtn = document.getElementById('clearBtn');
        const saveBtn = document.getElementById('saveBtn');
        const exportBtn = document.getElementById('exportBtn');
        const errorsBtn = document.getElementById('errorsBtn');
        const guidesBtn = document.getElementById('guidesBtn');

        // Mirror checkboxes
        const mirrorVertical = document.getElementById('mirrorVertical');
        const mirrorHorizontal = document.getElementById('mirrorHorizontal');
        const mirrorDiagonal = document.getElementById('mirrorDiagonal');
        const correctMirroring = document.getElementById('correctMirroringBtn');
        const hideZoom = document.getElementById('hideZoomBtn');

        // Map settings
        const mapSizeSelect = document.getElementById('mapSize');
        const gamemodeSelect = document.getElementById('gamemode');
        const environmentSelect = document.getElementById('environment');

        const selectBtn = document.getElementById('selectBtn');

        // Selection mode radio buttons
        document.querySelectorAll('input[name="selectionMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectionMode = e.target.value;
                document.getElementById('selectedAreaToolsDiv').style.display = selectBtn.checked ? 'flex' : 'none';
                document.getElementById('lastDivider').style.display = selectBtn.checked ? 'block' : 'none';
            });
        });

        eraseBtn.addEventListener('change', (e) => {
            this.isErasing = e.target.checked;
            eraseBtn.parentElement.classList.toggle('active', this.isErasing);
        });

        zoomInBtn.addEventListener('click', () => this.zoom(this.zoomStep));
        zoomInBtnBottom.addEventListener('click', () => this.zoom(this.zoomStep));
        zoomOutBtn.addEventListener('click', () => this.zoom(-this.zoomStep));
        zoomOutBtnBottom.addEventListener('click', () => this.zoom(-this.zoomStep));
        clearBtn.addEventListener('click', () => this.clearMap());
        saveBtn.addEventListener('click', () => this.saveMap());
        exportBtn.addEventListener('click', async () => await this.exportMap());
        errorsBtn.addEventListener('click', () => this.toggleShowErrors());
        guidesBtn.addEventListener('click', () => this.toggleGuides());

        // Mirror listeners
        mirrorVertical.addEventListener('change', (e) => this.mirrorVertical = e.target.checked);
        mirrorHorizontal.addEventListener('change', (e) => this.mirrorHorizontal = e.target.checked);
        mirrorDiagonal.addEventListener('change', (e) => this.mirrorDiagonal = e.target.checked);
        correctMirroring.addEventListener('change', () =>  this.toggleCorrectMirroring());
        hideZoom.addEventListener('change', () => this.toggleHideZoom());

        // Map setting listeners
        mapSizeSelect.addEventListener('change', (e) => this.setSize(e.target.value));


        gamemodeSelect.addEventListener('change', async (e) => await this.setGamemode(e.target.value));
        environmentSelect.addEventListener('change', async (e) => await this.setEnvironment(e.target.value));

        // Undo/Redo buttons
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        
        // Replace button
        document.getElementById('replaceBtn').addEventListener('click', () => this.toggleReplaceMode());
        
        // Rotate button
        document.getElementById('rotateBtn').addEventListener('click', () => this.rotateSelectedTiles());

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
                    document.getElementById('singleBtn').click();
                    break;

                case 'Digit2':
                case 'Numpad2':
                    if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.mirrorVertical = !this.mirrorVertical;
                        document.getElementById('mirrorVertical').checked = this.mirrorVertical;
                        return;
                    }
                    document.getElementById('lineBtn').click();
                    break;

                case 'Digit3':
                case 'Numpad3':
                    if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.mirrorHorizontal = !this.mirrorHorizontal;
                        document.getElementById('mirrorHorizontal').checked = this.mirrorHorizontal;
                        return;
                    }
                    document.getElementById('rectangleBtn').click();
                    break;
                    
                case 'Digit4':
                case 'Numpad4':
                    document.getElementById('fillBtn').click();
                    break;

                case 'Digit5':
                case 'Numpad5':
                    document.getElementById('selectBtn').click();
                    break;
                    
                case 'KeyE':
                    this.toggleEraseMode();
                    break;

                case 'KeyM':
                    this.toggleMirroring();
                    break;

                case 'KeyN':
                    this.toggleCorrectMirroring();
                    break;

                case 'KeyQ':
                    this.toggleShowErrors();
                    break;

                case 'KeyW':
                    this.toggleGuides();
                    break;

                case 'KeyR':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.rotateSelectedTiles();
                    } else {
                        this.toggleReplaceMode();
                    }
                    break;

                case 'KeyZ':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        return;
                    }
                    hideZoom.click();
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
            mapData: this.cloneLayeredMap(),
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
            mapData: this.cloneLayeredMap(),
            timestamp: Date.now()
        };
        this.redoStack.push(currentState);

        // Restore previous state
        const previousState = this.undoStack.pop();
        this.mapData = this.cloneLayeredMap(previousState.mapData);
        this.draw();
    }

    redo() {
        if (this.redoStack.length === 0) return;

        // Save current state to undo stack
        const currentState = {
            mapData: this.cloneLayeredMap(),
            timestamp: Date.now()
        };
        this.undoStack.push(currentState);

        // Restore next state
        const nextState = this.redoStack.pop();
        this.mapData = this.cloneLayeredMap(nextState.mapData);
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

        if (this.mapData[this.defaultTileLayer][coords.y][coords.x] < 1) return;

        this.selectedTile = { id: this.mapData[this.defaultTileLayer][coords.y][coords.x], ...this.tileDefinitions[this.mapData[this.defaultTileLayer][coords.y][coords.x]] };
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
            // Save state and remove tiles from map using eraseTile (handles 2x2 and mirroring)
            this.saveState();
            for (const t of this.selectDragTiles) {
                this.eraseTile(t.x, t.y, false);
            }
            this.draw();
            // Draw ghost tiles at original positions
            this.drawSelectDragGhost(0, 0);
            return;
        }

        if (this.selectionMode !== 'select' || !this.selectedTiles.some(t => t.x === coords.x && t.y === coords.y)) {
            this.selectedTiles = [];
        }

        if ((this.gamemode === 'Brawl_Ball' || this.gamemode === 'Hockey') && this.mapSize === this.mapSizes.regular) {
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

        // Check if we can place the selected tile on the existing tile
        if (!this.isErasing && this.selectionMode !== 'fill' && this.selectionMode !== 'select') {
            const topmostTile = this.getTopmostTileAt(coords.x, coords.y);
            
            if (topmostTile) {
                // Check if we can place the selected tile on this existing tile
                if (this.canPlaceTileOn(this.selectedTile.id, topmostTile.tileId)) {
                    // Place the tile instead of dragging
                    this.placeTile(coords.x, coords.y, this.selectedTile.id, true);
                    return;
                }
            }
        }

        // Check if we're starting to drag an existing tile
        if (!this.isErasing && this.selectionMode !== 'fill' && this.selectionMode !== 'select') {
            const topmostTile = this.findTopmostTileAt(coords.x, coords.y);
            
            if (topmostTile) {
                this.isDragging = true;
                this.draggedTileId = topmostTile.tileId;
                this.draggedTileLayer = topmostTile.layerIndex;
                this.dragStartX = coords.x;
                this.dragStartY = coords.y;
                this.saveState();
                
                // Get the tile definition to check if it's a 2x2 tile
                const def = topmostTile.def;
                const is2x2 = def && def.size === 2;
                
                // Store the negative IDs for size 2 tiles so they move together
                this.draggedNegativeIds = null;
                if (is2x2) {
                    this.draggedNegativeIds = {
                        right: this.mapData[topmostTile.layerIndex][coords.y][coords.x + 1],
                        bottom: this.mapData[topmostTile.layerIndex][coords.y + 1][coords.x],
                        bottomRight: this.mapData[topmostTile.layerIndex][coords.y + 1][coords.x + 1]
                    };
                }
                
                // Remove tile from original position immediately
                this.mapData[topmostTile.layerIndex][coords.y][coords.x] = 0;
            
            // If it's a 2x2 tile, also remove the other three tiles
            if (is2x2) {
                this.mapData[topmostTile.layerIndex][coords.y][coords.x + 1] = 0;
                this.mapData[topmostTile.layerIndex][coords.y + 1][coords.x] = 0;
                this.mapData[topmostTile.layerIndex][coords.y + 1][coords.x + 1] = 0;
            }
            
            // Apply mirroring for removal
            if (this.mirrorVertical) {
                const mirrorY = this.mapHeight - 1 - coords.y;
                const mirrorTopmost = this.findTopmostTileAt(coords.x, mirrorY);
                const mirrorLayer = mirrorTopmost ? mirrorTopmost.layerIndex : topmostTile.layerIndex;
                this.mapData[mirrorLayer][mirrorY][coords.x] = 0;
                
                // If it's a 2x2 tile, also remove the other three tiles
                if (is2x2) {
                    this.mapData[mirrorLayer][mirrorY][coords.x + 1] = 0;
                    this.mapData[mirrorLayer][mirrorY - 1][coords.x] = 0;
                    this.mapData[mirrorLayer][mirrorY - 1][coords.x + 1] = 0;
                }
            }
            if (this.mirrorHorizontal) {
                const mirrorX = this.mapWidth - 1 - coords.x;
                const mirrorTopmost = this.findTopmostTileAt(mirrorX, coords.y);
                const mirrorLayer = mirrorTopmost ? mirrorTopmost.layerIndex : topmostTile.layerIndex;
                this.mapData[mirrorLayer][coords.y][mirrorX] = 0;
                
                // If it's a 2x2 tile, also remove the other three tiles
                if (is2x2) {
                    this.mapData[mirrorLayer][coords.y][mirrorX - 1] = 0;
                    this.mapData[mirrorLayer][coords.y + 1][mirrorX] = 0;
                    this.mapData[mirrorLayer][coords.y + 1][mirrorX - 1] = 0;
                }
            }
            if (this.mirrorDiagonal) {
                const mirrorX = this.mapWidth - 1 - coords.x;
                const mirrorY = this.mapHeight - 1 - coords.y;
                const mirrorTopmost = this.findTopmostTileAt(mirrorX, mirrorY);
                const mirrorLayer = mirrorTopmost ? mirrorTopmost.layerIndex : topmostTile.layerIndex;
                this.mapData[mirrorLayer][mirrorY][mirrorX] = 0;
                
                // If it's a 2x2 tile, also remove the other three tiles
                if (is2x2) {
                    this.mapData[mirrorLayer][mirrorY][mirrorX - 1] = 0;
                    this.mapData[mirrorLayer][mirrorY - 1][mirrorX] = 0;
                    this.mapData[mirrorLayer][mirrorY - 1][mirrorX - 1] = 0;
                }
            }
            
            this.canvas.style.cursor = 'crosshair';
            this.draw();
            return;
            }
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
            // Place tiles using placeTile (handles 2x2 and mirroring). We already saved state at drag-start.
            for (const t of this.selectDragTiles) {
                const newX = t.x + offsetX;
                const newY = t.y + offsetY;
                if (
                    newX >= 0 && newX < this.mapWidth &&
                    newY >= 0 && newY < this.mapHeight
                ) {
                    // Temporarily set draggedTileLayer to preserve original layer
                    const originalLayer = t.layer !== undefined ? t.layer : this.defaultTileLayer;
                    const wasDragging = this.isDragging;
                    const oldDraggedLayer = this.draggedTileLayer;
                    
                    this.isDragging = true;
                    this.draggedTileLayer = originalLayer;
                    
                    // placeTile will call eraseTile internally and handle mirroring
                    this.placeTile(newX, newY, t.id, false);
                    
                    // Restore state
                    this.isDragging = wasDragging;
                    this.draggedTileLayer = oldDraggedLayer;
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
				// Delegate to existing placement logic (handles validation, 2x2, mirroring, state)
				this.placeTile(coords.x, coords.y, this.draggedTileId);
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


    initializeTileSelector() {
        if (this.headless) return;
        const container = document.getElementById('tileSelector');
        container.innerHTML = '';

        // Define the order of tiles
        const tileOrder = [
            'Wall', 'Wall2', 'Crate', 'Barrel', 'Cactus', 'Bush', 'Fence', 'Skull', 'Rope Fence', 'BFence', 'Water', 'Unbreakable', // Environment tiles
			'Blue Spawn', 'Blue Respawn', 'Red Spawn', 'Red Respawn', 'Trio Spawn', 'Yellow Spawn', // Normal Spawns
			'BossSpawn', 'KaijuBoss','HalloweenBoss1', 'HalloweenBoss2', 'HalloweenBoss3', 'HalloweenBoss4', 'HalloweenBoss5', 'OniHunt', 'HawkinsBoss1', 'HawkinsBoss2', 'HawkinsBoss3', // Boss spawns
            'Objective', 'Box', 'Powercube', 'Bumper', 'Bolt', 'TokenBlue', 'GodzillaCity1', 'GodzillaCity2', 'GodzillaCity3', 'GodzillaCity4', 'GodzillaExplosive', 'GodzillaSpawn', 'Escape', 'TokenRed', 'Boss Zone', 'Monster Zone', 'Bot_Zone', 'SubwayRun1', 'SubwayRun2', 'TreasurePad1','TreasurePad2', //Objectives
            'Track', 'Base Ike Blue', 'Base Ike Red', 'Small Ike Blue', 'Small Ike Red', // Brawl Arena
            'TNT', /*'UnbreakableBrick',*/ 'Speed Tile','Slow Tile', 'Spikes', 'Heal Pad', 'Smoke', 'IceTile', 'SnowTile', 'Rails', 'RedTrain', 'GreenTrain', 'YellowTrain', // Special Tiles
            'Jump R', 'Jump L', 'Jump T', 'Jump B', 'Jump BR', 'Jump TL', 'Jump BL', 'Jump TR', //Jump pads
            'Teleporter Blue', 'Teleporter Green', 'Teleporter Red', 'Teleporter Yellow' // Teleporters
        ];

        // Create buttons in the specified order
        tileOrder.forEach(tileName => {
            const tileEntry = Object.entries(this.tileDefinitions)
                .find(([_, def]) => def.name === tileName);
            
            if (!tileEntry) return;
            const [id, def] = tileEntry;

            if (id === '0' || id === '-1') return; // Skip empty and occupied tiles
            if (def.showInGamemode && !def.showInGamemode.includes(this.gamemode)) return;
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
                    const imgData = def.getImg(this.gamemode, 0, this.mapHeight, this.environment);
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
        // === Water, Ice and Snow tiles ===
        if (tileId === 8 || tileId === 69 || tileId === 70) {
            // Determinar tipo e caminhos de arquivo
            let tileType, basePath, cachePrefix;

            if (tileId === 8) {
                tileType = "Water";
                basePath = `Resources/${this.environment}/Water`;
                cachePrefix = `${this.environment}/water_`;
            } 
            else if (tileId === 69) {
                tileType = "IceTile";
                basePath = `Resources/Global/Special_Tiles/IceTile`;
                cachePrefix = `global/icetile_`;
            } 
            else if (tileId === 70) {
                tileType = "SnowTile";
                basePath = `Resources/Global/Special_Tiles/SnowTile`;
                cachePrefix = `global/snowtile_`;
            }

            // Initialize the 8-bit code array
            const code = new Array(8).fill('0');
            
            // Check for edge conditions
            const isTopEdge = y === 0;
            const isBottomEdge = y === this.mapHeight - 1;
            const isLeftEdge = x === 0;
            const isRightEdge = x === this.mapWidth - 1;

            // Same type tile function 
            const isSameType = (id) => {
                if (tileId === 8) return id === 8; // Water
                if (tileId === 69) return id === 69; // Ice
                if (tileId === 70) return id === 70; // Snow
                return false;
            };

            // Check direct connections
            const hasTop = !isTopEdge && isSameType(this.mapData[this.defaultTileLayer][y - 1][x]);
            const hasBottom = !isBottomEdge && isSameType(this.mapData[this.defaultTileLayer][y + 1][x]);
            const hasLeft = !isLeftEdge && isSameType(this.mapData[this.defaultTileLayer][y][x - 1]);
            const hasRight = !isRightEdge && isSameType(this.mapData[this.defaultTileLayer][y][x + 1]);

            // Set direct connections
            if (hasTop) code[1] = '1';    // Top
            if (hasBottom) code[6] = '1'; // Bottom
            if (hasLeft) code[3] = '1';   // Left
            if (hasRight) code[4] = '1';  // Right

            // Check corners (only if adjacent sides exist)
            if (!isTopEdge && !isLeftEdge && 
                isSameType(this.mapData[this.defaultTileLayer][y - 1][x - 1]) && hasTop && hasLeft) {
                code[0] = '1'; // Top-left
            }

            if (!isTopEdge && !isRightEdge && 
                isSameType(this.mapData[this.defaultTileLayer][y - 1][x + 1]) && hasTop && hasRight) {
                code[2] = '1'; // Top-right
            }

            if (!isBottomEdge && !isLeftEdge && 
                isSameType(this.mapData[this.defaultTileLayer][y + 1][x - 1]) && hasBottom && hasLeft) {
                code[5] = '1'; // Bottom-left
            }

            if (!isBottomEdge && !isRightEdge && 
                isSameType(this.mapData[this.defaultTileLayer][y + 1][x + 1]) && hasBottom && hasRight) {
                code[7] = '1'; // Bottom-right
            }

            // Convert code to file name
            const imageName = code.join('') + '.png';
            const cacheKey = `${cachePrefix}${imageName}`;
            
            // Search on cache
            let img = this.tileImages[cacheKey];
            
            // If don't exist, do
            if (!img) {
                const imagePath = `${basePath}/${imageName}`;
                img = new Image();
                img.src = imagePath;
                
                // Error treatment + fallback image
                img.onerror = () => {
                    console.error(`Failed to load ${tileType} image: ${imagePath}`);
                    img.src = `${basePath}/00000000.png`;
                };
                
                // Keep on cache
                this.tileImages[cacheKey] = img;
            }
            
            // If the image dont load, generate later
            if (!img.complete || img.naturalWidth === 0) {
                img.onload = () => {
                    this.drawTile(this.ctx, tileId, x, y);
                };
                return;
            }

            // Get dimensions by type
            const dimensions =
                this.environmentTileData[this.environment]?.[tileType] ||
                this.tileData[tileType] ||
                [1, 1, 0, 0, 1, 5]; // default

            const [scaleX, scaleY, offsetX, offsetY, opacity] = dimensions;
            const tileSize = this.tileSize;

            // Calculate position
            const width = tileSize * scaleX;
            const height = tileSize * scaleY;
            const drawX = x * tileSize + (tileSize * offsetX / 100) + this.canvasPadding;
            const drawY = y * tileSize + (tileSize * offsetY / 100) + this.canvasPadding;

            // Apply opacity and draw
            ctx.globalAlpha = opacity;
            ctx.drawImage(img, drawX, drawY, width, height);
            ctx.globalAlpha = 1.0;

            return;

        } else if (tileId === 7 || tileId === 9) { // Fence or Rope Fence
            const isFence = tileId === 7;
            const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData[this.defaultTileLayer], this.environment, isFence);
            
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
            const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData[this.defaultTileLayer], 'Brawl_Arena');

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

            const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData[this.defaultTileLayer], this.environment, false, true);
            
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
        } else if (tileId === 68) {
            const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData[1], 'Rails');
            
            const imagePath = `Resources/Global/Special_Tiles/Rails/${imageName}.png`;
            
            img = this.tileImages[imagePath];
            
            if (!img) {
                img = new Image();
                img.onload = () => this.draw();
                img.src = imagePath;
                img.onerror = () => {
                    console.error(`Failed to load border fence image: ${imagePath}`);
                    // Load fallback image
                    img.src = `Resources/Global/Special_Tiles/Rails/Fence.png`;
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
        } else if ([73, 74, 75].some(a => a === tileId)) {
            const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData[1], 'Train');

            const imagePath = `Resources/Global/Special_Tiles/${tileId === 73 ? 'RedTrain' : tileId === 74 ? 'YellowTrain' : 'GreenTrain'}/Train_${imageName}.png`;

            img = this.tileImages[imagePath];
            
            if (!img) {
                img = new Image();
                img.onload = () => this.draw();
                img.src = imagePath;
                img.onerror = () => {
                    console.error(`Failed to load border fence image: ${imagePath}`);
                    // Load fallback image
                    img.src = `Resources/Global/Special_Tiles/${tileId === 73 ? 'RedTrain' : tileId === 74 ? 'YellowTrain' : 'GreenTrain'}/Train_Fence.png`;
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
            // Handle position-dependent tiles like objectives
            const def = this.tileDefinitions[tileId];
            if (def && def.getImg) {
                const imgData = def.getImg(this.gamemode, y, this.mapHeight, this.environment);
                if (imgData && imgData.img) {
                    const imgPath = `Resources/${imgData.img.replace('${env}', this.environment)}`;
                    // Use a unique cache key that includes position for position-dependent tiles
                    const cacheKey = `${tileId}_${imgPath}`;
                    img = this.tileImages[cacheKey];
                    
                    if (!img) {
                        img = new Image();
                        img.onload = () => this.draw();
                        img.src = imgPath;
                        img.onerror = () => {
                            console.error(`Failed to load objective image: ${imgPath}`);
                        };
                        this.tileImages[cacheKey] = img;
                    }
                }
            } else {
                img = this.tileImages[tileId];
            }
        }

        if (!img || !img.complete) return;


        // Get tile dimensions data
        let dimensions;
        if (def.name === 'Objective') {
            const baseData = this.environmentObjectiveData[this.environment]?.[this.gamemode] || this.objectiveData[this.gamemode];
            
            // Handle position-dependent objectives (upper vs lower)
            if (baseData && typeof baseData === 'object' && !Array.isArray(baseData)) {
                // Position-dependent format: { upper: [...], lower: [...] }
                const isUpper = y < this.mapHeight / 2;
                dimensions = baseData[isUpper ? 'upper' : 'lower'] || baseData.upper || baseData;
            } else {
                // Legacy format: direct array
                dimensions = baseData;
            }
        } else {
            // For fence and rope fence variations, use the specific variation's dimensions
            const isFence = tileId === 7;
            const isRope = tileId === 9;
            const isBorder = tileId === 45;
            const isTrain = [73, 74, 75].includes(tileId);
            if (isFence || isRope || isBorder) {
                const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData[this.defaultTileLayer], this.environment, isFence, isBorder);
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
            } else if (isTrain) {
                const imageName = this.fenceLogicHandler.getFenceImageName(x, y, this.mapData[1], 'Train');
                dimensions = this.tileData['Train_' + imageName];
            } else {
                dimensions = this.environmentTileData[this.environment]?.[def.name] || 
                            this.tileData[def.name];
            }
        }
        if (!dimensions) return;

        const [scaleX, scaleY, offsetX, offsetY, opacity] = dimensions;
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

    // Draws the Jump Landing indicator for jump tiles
    showJumpLanding(ctx, tileId, x, y) {
        // Map tileId to jump type
        const jumpTypes = {
            20: 'R', 21: 'L', 22: 'T', 23: 'B',
            24: 'BR', 25: 'TL', 26: 'BL', 27: 'TR'
        };
        const type = jumpTypes[tileId];
        if (!type) return;

        // Get mapMaker context for map size and tile size
        const mapMaker = window.mapMaker;
        const mapWidth = mapMaker?.mapWidth || 40;
        const mapHeight = mapMaker?.mapHeight || 40;
        const tileSize = mapMaker?.tileSize || 64;
        const padding = mapMaker?.canvasPadding || 0;

        // Calculate landing position offset
        let dx = 0, dy = 0, dist = 12;
        if (type === 'R') dx = dist;
        if (type === 'L') dx = -dist;
        if (type === 'T') dy = -dist;
        if (type === 'B') dy = dist;
        if (type === 'BR') { dx = 8; dy = 8; }
        if (type === 'TL') { dx = -8; dy = -8; }
        if (type === 'BL') { dx = -8; dy = 8; }
        if (type === 'TR') { dx = 8; dy = -8; }

        // Calculate landing tile position
        let lx = x + dx;
        let ly = y + dy;

        // Clamp to 2 tiles before the edge if out of bounds
        if (lx < 0) lx = 0;
        if (lx > mapWidth - 2) lx = mapWidth - 2;
        if (ly < 0) ly = 0;
        if (ly > mapHeight - 2) ly = mapHeight - 2;

        // Draw the landing image at (lx, ly), size 2x2 tiles
        const imgPath = 'Resources/Global/JumpLanding.png';
        let img = mapMaker?.tileImages?.[imgPath];
        if (!img) {
            img = new window.Image();
            img.src = imgPath;
            if (mapMaker && mapMaker.tileImages) mapMaker.tileImages[imgPath] = img;
            img.onload = () => mapMaker?.draw && mapMaker.draw();
            img.onerror = () => { console.error('Failed to load JumpLanding image:', imgPath); };
        }
        if (!img.complete || img.naturalWidth === 0) return;

        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.drawImage(
            img,
            lx * tileSize + padding,
            ly * tileSize + padding,
            tileSize * 2,
            tileSize * 2
        );
        ctx.globalAlpha = 1.0;
        ctx.restore();
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
                if ((this.gamemode === 'Brawl_Ball' || this.gamemode === 'Hockey') && this.mapSize === this.mapSizes.regular) {
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

        if (this.gamemode === 'Basket_Brawl' && this.mapSize === this.mapSizes.basket) { 
            // Cache basket images if not already loaded
            if (!this.basketMarkingsImage) {
                this.basketMarkingsImage = new Image();
                this.basketMarkingsImage.src = 'Resources/Global/BasketMarkings.png';
            }
            if (!this.basketsImage) {
                this.basketsImage = new Image();
                this.basketsImage.src = 'Resources/Global/Baskets.png';
            }

            // Draw basket markings if loaded
            if (this.basketMarkingsImage.complete) {
                this.ctx.drawImage( 
                    this.basketMarkingsImage, 
                    this.canvasPadding, 
                    this.canvasPadding, 
                    this.mapWidth * this.tileSize, 
                    this.mapHeight * this.tileSize 
                ); 
            }
        }

        if (this.gamemode === 'Siege' && this.mapSize === this.mapSizes.siege) { 
            // Cache basket images if not already loaded
            if (!this.siegeMarkingsImage) {
                this.siegeMarkingsImage = new Image();
                this.siegeMarkingsImage.src = 'Resources/Global/SiegeMarkings.png';
            }

            if (this.siegeMarkingsImage.complete) {
                this.ctx.drawImage( 
                    this.siegeMarkingsImage, 
                    this.canvasPadding, 
                    this.canvasPadding, 
                    this.mapWidth * this.tileSize, 
                    this.mapHeight * this.tileSize 
                ); 
            }
        }


        // Group tiles by layer
        const tilesByLayer = new Map();
        for (let layerIndex = 0; layerIndex < this.layerCount; layerIndex++) {
            const layerGrid = this.mapData[layerIndex];
            if (!layerGrid) continue;

            for (let y = 0; y < this.mapHeight; y++) {
                for (let x = 0; x < this.mapWidth; x++) {
                    const tileId = layerGrid[y][x];
                    if (tileId === 0 || tileId === -1) continue;

                    const def = this.tileDefinitions[tileId];
                    if (!def) continue;

                    const layerKey = typeof def.layer === 'number' ? def.layer : this.defaultTileLayer;

                    if (!tilesByLayer.has(layerKey)) {
                        tilesByLayer.set(layerKey, []);
                    }
                    tilesByLayer.get(layerKey).push({ x, y, tileId, red: false, layerKey });
                }
            }
        }

        function getTileAt(layerKey, x, y) {
            const tiles = tilesByLayer.get(layerKey);
            if (!tiles) return null;

            return tiles.find(tile => tile.x === x && tile.y === y) || null;
        }

        if (this.gamemode === 'Brawl_Arena'){
            const trackLayerIndex = this.tileDefinitions[40]?.layer ?? this.defaultTileLayer;
            const smallIkeLayerIndex = this.tileDefinitions[47]?.layer ?? this.defaultTileLayer;
            const resolveLayerGrid = (index) => this.mapData[index] || this.mapData[this.defaultTileLayer];
            const trackLayerGrid = resolveLayerGrid(trackLayerIndex);
            const smallIkeLayerGrid = resolveLayerGrid(smallIkeLayerIndex);

            const getTrackConnections = (x, y) => {
                const height = trackLayerGrid.length;
                const width = trackLayerGrid[0].length;
                
                // Helper function to check if a tile is a fence/rope
                const isSameType = (x, y) => {
                    if (x < 0 || x >= width || y < 0 || y >= height) return false;
                    const id = trackLayerGrid[y][x];
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
                    if (smallIkeLayerGrid[y][x] === 47){
                        const addRedToConnections = (x, y, firstRun = false) => {
                            if (!firstRun) {
                                const tile = getTileAt(trackLayerIndex, x, y);
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

        // Draw tiles in layer order
        Array.from(tilesByLayer.keys())
            .sort((a, b) => a - b)
            .forEach(layerKey => {
                const tiles = tilesByLayer.get(layerKey);

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

                        rowTiles.sort((a, b) => a.x - b.x);

                        rowTiles.forEach(({ x, y, tileId }) => {
                            const tile = getTileAt(layerKey, x, y);
                            const red = tile?.red ?? false;

                            this.drawTile(this.ctx, tileId, x, y, red);
                        });
                    });
            });


            Array.from(tilesByLayer.keys())
            .sort((a, b) => a - b)
            .forEach(layerKey => {
                const tiles = tilesByLayer.get(layerKey);

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

                        rowTiles.sort((a, b) => a.x - b.x);

                        rowTiles.forEach(({ x, y, tileId }) => {
                            const tile = getTileAt(layerKey, x, y);
                            const red = tile?.red ?? false;

                            if (this.showGuides && tileId >= 20 && tileId <= 27) {
                                this.showJumpLanding(this.ctx, tileId, x, y);
                            }
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

        if (this.gamemode === 'Basket_Brawl' && this.mapSize === this.mapSizes.basket) { 
            if (this.basketsImage.complete) {
                this.ctx.drawImage( 
                    this.basketsImage, 
                    this.canvasPadding, 
                    this.canvasPadding, 
                    this.mapWidth * this.tileSize,
                    this.mapHeight * this.tileSize 
                ); 
            }
        }

        if (this.goalImages?.length) {
            for (const goal of this.goalImages) {
                const img = this.goalImageCache[`${goal.name}${this.environment}`] ||
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

    createEmptyLayerGrid(width = this.mapWidth, height = this.mapHeight) {
        return Array.from({ length: height }, () => Array(width).fill(0));
    }

    createEmptyLayeredMap(width = this.mapWidth, height = this.mapHeight) {
        return Array.from({ length: this.layerCount }, () => this.createEmptyLayerGrid(width, height));
    }

    resetAllLayers(width = this.mapWidth, height = this.mapHeight) {
        this.mapData = this.createEmptyLayeredMap(width, height);
    }

    cloneLayeredMap(data = this.mapData) {
        return data.map(layer => layer.map(row => [...row]));
    }

    // Check if a tile can be placed on another tile
    canPlaceTileOn(placingTileId, targetTileId) {
        const placingDef = this.tileDefinitions[placingTileId];
        
        if (!placingDef) return false;
        
        // If target is empty (0), check if placing tile can be placed on empty tiles
        if (targetTileId === 0) {
            // If placing tile has placeableOn property (and it's not -100), it cannot be placed on empty tiles
            if (placingDef.placeableOn && !placingDef.placeableOn.includes(-100)) {
                return false;
            }
            // Otherwise, can be placed on empty tiles
            return true;
        }
        
        const targetDef = this.tileDefinitions[targetTileId];
        if (!targetDef) return false;
        
        // If placing tile has placeableOn property
        if (placingDef.placeableOn) {
            // -100 means placeable on all tiles (including empty, but we already handled empty above)
            if (placingDef.placeableOn.includes(-100)) return true;
            // Check if target tile ID is in the list
            return placingDef.placeableOn.includes(targetTileId);
        }
        
        // If target tile has placeableOnThis property
        if (targetDef.placeableOnThis) {
            // -100 means all tiles can be placed on it
            if (targetDef.placeableOnThis.includes(-100)) return true;
            // Check if placing tile ID is in the list
            return targetDef.placeableOnThis.includes(placingTileId);
        }
        
        // Default: cannot place on existing tiles
        return false;
    }

    // Find the topmost placeable tile at a position (for erasing)
    findTopmostTileAt(x, y) {
        // Search from highest layer to lowest
        for (let layerIndex = this.layerCount - 1; layerIndex >= 0; layerIndex--) {
            const layerGrid = this.mapData[layerIndex];
            if (!layerGrid) continue;
            
            const tileId = layerGrid[y][x];
            if (tileId === 0 || tileId === -1 || tileId === -2 || tileId === -3) continue;
            
            const def = this.tileDefinitions[tileId];
            if (!def) continue;
            
            // If tile has placeableOn, it's a top tile (can be placed on others)
            // If tile doesn't have placeableOnThis, it's a base tile (others can't be placed on it)
            // Both cases mean this is the topmost tile that should be erased
            if (def.placeableOn || !def.placeableOnThis) {
                return { layerIndex, tileId, def };
            }
        }
        
        // Fallback: return the first non-empty tile found (from top to bottom)
        for (let layerIndex = this.layerCount - 1; layerIndex >= 0; layerIndex--) {
            const layerGrid = this.mapData[layerIndex];
            if (!layerGrid) continue;
            
            const tileId = layerGrid[y][x];
            if (tileId !== 0 && tileId !== -1 && tileId !== -2 && tileId !== -3) {
                const def = this.tileDefinitions[tileId];
                if (def) {
                    return { layerIndex, tileId, def };
                }
            }
        }
        
        return null;
    }

    // Find the topmost tile at a position (for checking placeability)
    getTopmostTileAt(x, y) {
        // Search from highest layer to lowest
        for (let layerIndex = this.layerCount - 1; layerIndex >= 0; layerIndex--) {
            const layerGrid = this.mapData[layerIndex];
            if (!layerGrid) continue;
            
            const tileId = layerGrid[y][x];
            if (tileId === 0 || tileId === -1 || tileId === -2 || tileId === -3) continue;
            
            const def = this.tileDefinitions[tileId];
            if (def) {
                return { layerIndex, tileId, def };
            }
        }
        
        return null;
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
            // Get the topmost tile at the fill start position
            const startTile = this.getTopmostTileAt(this.selectionEnd.x, this.selectionEnd.y);
            if (!startTile) return;
            
            const tileId = startTile.tileId;
            const fillLayer = startTile.layerIndex;

            const getConnectionsOfSameTile = (x, y, tileId, layerIndex) => {
                const height = this.mapData[layerIndex].length;
                const width = this.mapData[layerIndex][0].length;

                const isSameType = (x, y) => {
                    if (x < 0 || x >= width || y < 0 || y >= height) return false;
                    // Check the same layer for same tile type
                    const topmost = this.getTopmostTileAt(x, y);
                    return topmost && topmost.tileId === tileId && topmost.layerIndex === layerIndex;
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

                // Check if current position has the same tile on the same layer
                const currentTile = this.getTopmostTileAt(x, y);
                if (!currentTile || currentTile.tileId !== tileId || currentTile.layerIndex !== fillLayer) {
                    return;
                }

                if (this.isErasing) {
                    this.eraseTile(x, y, false);
                } else {
                    this.placeTile(x, y, null, false);
                }

                const { top, right, bottom, left } = getConnectionsOfSameTile(x, y, tileId, fillLayer);

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
            
            // Check all layers for tiles in the selection area
            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    // Find topmost tile at this position across all layers
                    const topmostTile = this.getTopmostTileAt(x, y);
                    if (topmostTile && topmostTile.tileId !== 0 && topmostTile.tileId !== -1 && topmostTile.tileId !== -2 && topmostTile.tileId !== -3 && topmostTile.tileId !== 33) {
                        this.selectedTiles.push({
                            x: x, 
                            y: y,
                            id: topmostTile.tileId,
                            layer: topmostTile.layerIndex
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
        if ((this.gamemode === 'Brawl_Ball' || this.gamemode === 'Hockey') 
            && this.mapSize === this.mapSizes.regular
            && (atTop || atBottom) && (atLeft || atRight)) {
                this.isDrawing = false;
                return;
        }

        // Check if we're placing on an existing tile or empty tile
        const topmostTile = this.getTopmostTileAt(x, y);
        const targetTileId = topmostTile ? topmostTile.tileId : 0;
        const canPlace = this.canPlaceTileOn(id, targetTileId);
        
        if (!canPlace) {
            // Cannot place this tile here
            return;
        }
        
        const isPlacingOnExisting = topmostTile !== null;
        
        // Determine which layer to place on
        // If dragging, use the dragged tile's original layer
        // Otherwise, use the tile's defined layer or default
        const targetLayer = this.isDragging && this.draggedTileLayer !== undefined 
            ? this.draggedTileLayer 
            : (typeof def.layer === 'number' ? def.layer : this.defaultTileLayer);
        
        // If placing on an existing tile, don't erase it - place on top
        // Otherwise, erase the existing tile first
        if (!isPlacingOnExisting) {
            this.eraseTile(x, y, false);

            // Check if we can place this tile (for 2x2 tiles)
            if (def.size === 2) {
                if (x >= this.mapWidth - 1 || y >= this.mapHeight - 1) return;
                for (let dy = 0; dy < 2; dy++) {
                    for (let dx = 0; dx < 2; dx++) {
                        this.eraseTile(x + dx, y + dy, false);
                    }
                }
            }
        } else {
            // When placing on existing tile, check 2x2 bounds
            if (def.size === 2) {
                if (x >= this.mapWidth - 1 || y >= this.mapHeight - 1) return;
            }
        }

        // Handle special cases for objectives
        if (def.getImg) {
            const imgData = def.getImg(this.gamemode, y, this.mapHeight);
            if (!imgData) return; // Invalid for current gamemode
        }

        // Only show Bolt in Siege mode
        if (def.showInGamemode && !def.showInGamemode.includes(this.gamemode)) return;

        // Save state before making changes if requested
        if (saveState) {
            this.saveState();
        }

        // Place the tile on the correct layer
        this.mapData[targetLayer][y][x] = id;

        // For 2x2 tiles, mark the other tiles as occupied
        if (def.size === 2) {
            this.mapData[targetLayer][y][x + 1] = -1;
            this.mapData[targetLayer][y + 1][x] = -2;
            this.mapData[targetLayer][y + 1][x + 1] = -3;
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
                            if (this.mapData[targetLayer][ty + dy][tx + dx] !== 0) return;
                        }
                    }
                    // Place the tile and mark occupied spaces
                    this.mapData[targetLayer][ty][tx] = mid;
                    this.mapData[targetLayer][ty][tx + 1] = -1;
                    this.mapData[targetLayer][ty + 1][tx] = -1;
                    this.mapData[targetLayer][ty + 1][tx + 1] = -1;
                } else {
                    this.mapData[targetLayer][ty][tx] = mid;
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
        if (!def && !this.correctMirroring) return tileId;

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

        if (this.correctMirroring) {
            switch (tileId){
                case 12: return 13;
                case 13: return 12;
                case 34: return 35;
                case 35: return 34;
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

        // Find the topmost placeable tile to erase
        const topmostTile = this.findTopmostTileAt(x, y);
        
        if (!topmostTile) {
            // No tile found, nothing to erase
            return;
        }

        const { layerIndex, tileId, def } = topmostTile;
        
        // Erase the tile and its occupied spaces on the correct layer
        if (def && def.size === 2) {
            this.mapData[layerIndex][y][x + 1] = 0;
            this.mapData[layerIndex][y + 1][x] = 0;
            this.mapData[layerIndex][y + 1][x + 1] = 0;
        }
        if (tileId === -1) {
            this.mapData[layerIndex][y][x - 1] = 0;
            this.mapData[layerIndex][y + 1][x] = 0;
            this.mapData[layerIndex][y + 1][x - 1] = 0;
        }
        if (tileId === -2) {
            this.mapData[layerIndex][y][x + 1] = 0;
            this.mapData[layerIndex][y - 1][x] = 0;
            this.mapData[layerIndex][y - 1][x + 1] = 0;
        }
        if (tileId === -3) {
            this.mapData[layerIndex][y][x - 1] = 0;
            this.mapData[layerIndex][y - 1][x] = 0;
            this.mapData[layerIndex][y - 1][x - 1] = 0;
        }
        this.mapData[layerIndex][y][x] = 0;

        // Handle mirroring for regular tiles
         if (this.mirrorVertical || this.mirrorHorizontal || this.mirrorDiagonal) {
            const mirrorY = this.mapHeight - 1 - y;
            const mirrorX = this.mapWidth - 1 - x;
            
            // Find topmost tile at mirror position
            const mirrorTopmost = this.findTopmostTileAt(mirrorX, mirrorY);
            const mirrorLayer = mirrorTopmost ? mirrorTopmost.layerIndex : layerIndex;
            
            if (this.mirrorVertical) {
                if (def && def.size === 2) {
                    this.mapData[mirrorLayer][mirrorY - 1][x] = 0;
                    this.mapData[mirrorLayer][mirrorY - 1][x + 1] = 0;
                    this.mapData[mirrorLayer][mirrorY][x + 1] = 0;
                }
                this.mapData[mirrorLayer][mirrorY][x] = 0;
            }
            
            if (this.mirrorHorizontal) {
                if (def && def.size === 2) {
                    this.mapData[mirrorLayer][y + 1][mirrorX] = 0;
                    this.mapData[mirrorLayer][y][mirrorX - 1] = 0;
                    this.mapData[mirrorLayer][y + 1][mirrorX - 1] = 0;
                }
                this.mapData[mirrorLayer][y][mirrorX] = 0;
            }
            
            if (this.mirrorDiagonal) {
                if (def && def.size === 2) {
                    this.mapData[mirrorLayer][mirrorY - 1][mirrorX - 1] = 0;
                    this.mapData[mirrorLayer][mirrorY - 1][mirrorX] = 0;
                    this.mapData[mirrorLayer][mirrorY][mirrorX - 1] = 0;
                }
                this.mapData[mirrorLayer][mirrorY][mirrorX] = 0;
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

            this.resetAllLayers();
            this.draw();
        }
    }

    async generateMapId(user = localStorage.getItem('user')) {
        const maps = await Firebase.readDataOnce(`users/${user}/maps`);

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
                    (this.gamemode === 'Brawl_Ball' || this.gamemode === 'Hockey') &&
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

        if (this.gamemode === 'Basket_Brawl' && this.mapSize === this.mapSizes.basket) { 
            // Cache basket images if not already loaded
            if (!this.basketMarkingsImage) {
                this.basketMarkingsImage = new Image();
                this.basketMarkingsImage.src = 'Resources/Global/BasketMarkings.png';
            }
            if (!this.basketsImage) {
                this.basketsImage = new Image();
                this.basketsImage.src = 'Resources/Global/Baskets.png';
            }

            // Draw basket markings if loaded
            if (this.basketMarkingsImage.complete) {
                ctx.drawImage( 
                    this.basketMarkingsImage, 
                    this.canvasPadding, 
                    this.canvasPadding, 
                    this.mapWidth * this.tileSize, 
                    this.mapHeight * this.tileSize 
                ); 
            }
        }

        if (this.gamemode === 'Siege' && this.mapSize === this.mapSizes.siege) { 
            // Cache siege markings image if not already loaded
            if (!this.siegeMarkingsImage) {
                this.siegeMarkingsImage = new Image();
                this.siegeMarkingsImage.src = 'Resources/Global/SiegeMarkings.png';
            }

            // Draw siege markings if loaded
            if (this.siegeMarkingsImage.complete) {
                ctx.drawImage( 
                    this.siegeMarkingsImage, 
                    this.canvasPadding, 
                    this.canvasPadding, 
                    this.mapWidth * this.tileSize, 
                    this.mapHeight * this.tileSize 
                ); 
            }
        }

        // Group tiles by layer
        const tilesByLayer = new Map();
        for (let layerIndex = 0; layerIndex < this.layerCount; layerIndex++) {
            const layerGrid = this.mapData[layerIndex];
            if (!layerGrid) continue;

            for (let y = 0; y < this.mapHeight; y++) {
                for (let x = 0; x < this.mapWidth; x++) {
                    const tileId = layerGrid[y][x];
                    if (tileId === 0 || tileId === -1) continue;

                    const def = this.tileDefinitions[tileId];
                    if (!def) continue;

                    const layerKey = typeof def.layer === 'number' ? def.layer : this.defaultTileLayer;

                    if (!tilesByLayer.has(layerKey)) {
                        tilesByLayer.set(layerKey, []);
                    }
                    tilesByLayer.get(layerKey).push({ x, y, tileId, red: false, layerKey });

                }
            }
        }

        function getTileAt(layerKey, x, y) {
            const tiles = tilesByLayer.get(layerKey);
            if (!tiles) return null;

            return tiles.find(tile => tile.x === x && tile.y === y) || null;
        }

        if (this.gamemode === 'Brawl_Arena'){
            const trackLayerIndex = this.tileDefinitions[40]?.layer ?? this.defaultTileLayer;
            const smallIkeLayerIndex = this.tileDefinitions[47]?.layer ?? this.defaultTileLayer;
            const resolveLayerGrid = (index) => this.mapData[index] || this.mapData[this.defaultTileLayer];
            const trackLayerGrid = resolveLayerGrid(trackLayerIndex);
            const smallIkeLayerGrid = resolveLayerGrid(smallIkeLayerIndex);
            const getTrackConnections = (x, y) => {
                const height = trackLayerGrid.length;
                const width = trackLayerGrid[0].length;
                
                // Helper function to check if a tile is a fence/rope
                const isSameType = (x, y) => {
                    if (x < 0 || x >= width || y < 0 || y >= height) return false;
                    const id = trackLayerGrid[y][x];
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
                    if (smallIkeLayerGrid[y][x] === 47){
                        let firstRun = true;
                        const addRedToConnections = (x, y) => {
                            if (!firstRun) {
                                const tile = getTileAt(trackLayerIndex, x, y);
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

        // Draw tiles in layer order
        Array.from(tilesByLayer.keys())
            .sort((a, b) => a - b)
            .forEach(layerKey => {
                const tiles = tilesByLayer.get(layerKey);

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

                        rowTiles.sort((a, b) => a.x - b.x);

                        rowTiles.forEach(({ x, y, tileId }) => {
                            const tile = getTileAt(layerKey, x, y);
                            const red = tile?.red ?? false;

                            this.drawTile(ctx, tileId, x, y, red);

                        });
                    });
            });

        if (this.gamemode === 'Basket_Brawl' && this.mapSize === this.mapSizes.basket) { 
            if (this.basketsImage.complete) {
                ctx.drawImage( 
                    this.basketsImage, 
                    this.canvasPadding, 
                    this.canvasPadding, 
                    this.mapWidth * this.tileSize,
                    this.mapHeight * this.tileSize 
                ); 
            }
        }

        // Draw goal images if any
        if (this.goalImages?.length) {
            for (const goal of this.goalImages) {
                const img =
                    this.goalImageCache[`${goal.name}${this.environment}`] ||
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

    async exportMap(code = this.mapData[this.defaultTileLayer], gamemode, env) {
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

        this.toggleMirroring();


        // Remove objectives
        if (this.mapData[this.defaultTileLayer].every(row => row.every(tile => tile === 0))) {
            for (let y = 0; y < this.mapHeight; y++) {
                for (let x = 0; x < this.mapWidth; x++) {
                    if (this.mapData[this.defaultTileLayer][y][x] === 14) this.mapData[this.defaultTileLayer][y][x] = 0;
                }
            }
        }

        Object.entries(this.tileDefinitions).forEach(([key, value]) => {
            if (value.showInGamemode && !value.showInGamemode.includes(this.gamemode)) {
                for (let y = 0; y < this.mapHeight; y++) {
                    for (let x = 0; x < this.mapWidth; x++) {
                        if (this.mapData[this.defaultTileLayer][y][x] === parseInt(key)) this.mapData[this.defaultTileLayer][y][x] = 0;
                    }
                }
            }
        });


        const middleX = Math.floor(this.mapWidth / 2);
        const middleY = Math.floor(this.mapHeight / 2);

        const isBrawl = gamemode === 'Brawl_Ball' || gamemode === 'Hockey';
        const wasBrawl = previousGamemode === 'Brawl_Ball' || previousGamemode === 'Hockey';

        // REGULAR MAP - Brawl Ball
        if (this.mapSize === this.mapSizes.regular) {
            const corners = [[0, 0], [0, 14], [29, 0], [29, 14]];
            if (isBrawl) {
                for (const [startX, startY] of corners) {
                    for (let y = 0; y < 4; y++) {
                        for (let x = 0; x < 7; x++) {
                            this.mapData[this.defaultTileLayer][startX + y][startY + x] = 33; // Empty2 tile
                        }
                    }
                }
                let red = { name: 'goalRed', x: middleX - 3, y: 0, w: 7, h: 3.5, offsetX: 0, offsetY: -20 };
                let blue = { name: 'goalBlue', x: middleX - 3, y: this.mapHeight - 5, w: 7, h: 3.5, offsetX: 0, offsetY: -10 };

                if (this.environment === 'Stadium' || this.environment === 'Hockey' || this.environment === 'Coin_Factory'){
                    red.h = 4.5;
                    red.offsetY = -40;
                    blue.h = 4.5;
                    blue.offsetY = 20;
                } else if (this.environment === 'Stunt_Show'){
                    red.w = 6;
                    red.h = 2;
                    blue.w = 6;
                    blue.h = 2;
                    red.offsetY = 15;
                    red.offsetX = 15;
                    blue.offsetY = 80;
                    blue.offsetX = 15;
                }

                this.goalImages.push(
                    red, blue
                );
                await Promise.all(
                    this.goalImages.map(goal => this.preloadGoalImage(goal.name, this.environment))
                );

                if (!this.existingMap && apply) {
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
                            if (this.mapData[this.defaultTileLayer][startX + y][startY + x] === 33) {
                                this.mapData[this.defaultTileLayer][startX + y][startY + x] = 0;
                            }
                        }
                    }
                }
            }
        }

        // SHOWDOWN MAP - Brawl Ball
        if (this.mapSize === this.mapSizes.showdown && isBrawl) {
            this.goalImages.push(
            { name: 'goal5v5Blue', x: 11, y: middleY - 8.18, w: 3, h: 15.69, offsetX: -10, offsetY: -8 },
            { name: 'goal5v5Red',  x: this.mapWidth - 14, y: middleY - 8.18, w: 3, h: 15.69, offsetX:  10, offsetY: -8 }
            );

            // ← add this:
            await Promise.all(
            this.goalImages.map(g => this.preloadGoalImage(g.name, this.environment))
            );
        }

        if (apply && (this.mapData[this.defaultTileLayer].every(row => row.every(tile => tile === 0 || tile === 14 || tile === 13 || tile === 12 || tile === 33)))) 
            this.applyDefaultLayoutIfEmpty();


        this.initializeTileSelector();
        this.loadTileImages();
        this.draw();
        this.toggleMirroring();
    }

    applyDefaultLayoutIfEmpty() {
        console.trace('applyDefaultLayoutIfEmpty triggered');
        const { mapWidth, mapHeight } = this;
        const midX = Math.floor(mapWidth / 2);
        const topY = 0;
        const bottomY = mapHeight - 1;

        this.resetAllLayers(mapWidth, mapHeight);

        // Place spawns for regular maps
        if (this.mapSize === this.mapSizes.regular) {
            if (this.gamemode === 'Duels') {
                this.mapData[this.defaultTileLayer][topY][midX] = 13;      // Red
                this.mapData[this.defaultTileLayer][bottomY][midX] = 12;   // Blue
                if (this.mapData[this.defaultTileLayer][topY][midX - 2] === 13) {
                    this.mapData[this.defaultTileLayer][topY][midX - 2] = 0;
                }
                if (this.mapData[this.defaultTileLayer][topY][midX + 2] === 13) {
                    this.mapData[this.defaultTileLayer][topY][midX + 2] = 0;
                }
                if (this.mapData[this.defaultTileLayer][bottomY][midX - 2] === 12) {
                    this.mapData[this.defaultTileLayer][bottomY][midX - 2] = 0;
                }
                if (this.mapData[this.defaultTileLayer][bottomY][midX + 2] === 12) {
                    this.mapData[this.defaultTileLayer][bottomY][midX + 2] = 0;
                }
            } else if ((this.gamemode === 'Brawl_Ball' || this.gamemode === 'Hockey' || this.gamemode ==='Paint_Brawl')) {
                this.mapData[this.defaultTileLayer][8][midX] = 13;      // Red
                this.mapData[this.defaultTileLayer][bottomY - 8][midX] = 12;   // Blue
                this.mapData[this.defaultTileLayer][8][midX - 2] = 13;  // Red
                this.mapData[this.defaultTileLayer][bottomY - 8][midX - 2] = 12; // Blue
                this.mapData[this.defaultTileLayer][8][midX + 2] = 13;  // Red
                this.mapData[this.defaultTileLayer][bottomY - 8][midX + 2] = 12; // Blue
                for (let x = 0; x < mapWidth; x++) {
                    if (this.mapData[this.defaultTileLayer][0][x] === 13) {
                        this.mapData[this.defaultTileLayer][0][x] = 0;
                    }
                }
                for (let x = 0; x < mapWidth; x++) {
                    if (this.mapData[this.defaultTileLayer][bottomY][x] === 12) {
                        this.mapData[this.defaultTileLayer][bottomY][x] = 0;
                    }
                }
            } else {
                [midX - 2, midX, midX + 2].forEach(x => {
                    this.mapData[this.defaultTileLayer][topY][x] = 13;
                    this.mapData[this.defaultTileLayer][bottomY][x] = 12;
                });
            }

            // Center objectives
            const centerY = Math.floor(mapHeight / 2);
            const centerX = midX;
            const objectiveModes = [
                'Gem_Grab', 'Brawl_Ball', 'Bounty', 'Hot_Zone',
                'Hold_The_Trophy', 'Basket_Brawl', 'Volley_Brawl', 'Dodgebrawl', 'Hockey', 'Bot_Drop', 'Paint_Brawl',
            ];
            if (objectiveModes.includes(this.gamemode)) {
                this.placeTile(centerX, centerY, 14, false); // Place objective tile
            } else if (this.gamemode === 'Heist' || this.gamemode === 'Snowtel_Thieves') {
                this.placeTile(centerX, 4, 14, false);
                this.placeTile(centerX, mapHeight - 5, 14, false);
            }
            if (objectiveModes.includes(this.gamemode)) {
                this.placeTile(centerX, centerY, 14, false); // Place objective tile
            } else if (this.gamemode === 'Token_Run') {
                this.placeTile(centerX, 5, 14, false);
                this.placeTile(centerX, mapHeight - 6, 14, false);
            }
        }


        if (this.mapSize === this.mapSizes.basket) {
            // Place spawns for basket maps
            this.mapData[this.defaultTileLayer][6][this.mapWidth - 2] = 13;      // Red
            this.mapData[this.defaultTileLayer][6][1] = 12;                      // Blue
            this.mapData[this.defaultTileLayer][8][this.mapWidth - 2] = 13;      // Red
            this.mapData[this.defaultTileLayer][8][1] = 12;                      // Blue
            this.mapData[this.defaultTileLayer][10][this.mapWidth - 2] = 13;     // Red
            this.mapData[this.defaultTileLayer][10][1] = 12;                     // Blue

            // Center objective
            if (this.gamemode === 'Basket_Brawl') {
            const centerY = Math.floor(mapHeight / 2);
            const centerX = Math.floor(mapWidth / 2);
            this.placeTile(centerX, centerY, 14, false); // Place objective tile
            }
        }


        // Showdown-specific Brawl Ball setup
        if (this.mapSize === this.mapSizes.showdown && (this.gamemode === 'Brawl_Ball' || this.gamemode === 'Hockey')) {
            const centerX = Math.floor(mapWidth / 2);
            const centerY = Math.floor(mapHeight / 2);
            const topLeft = centerX - 1;
            const topTop = centerY - 1;
            this.mapData[this.defaultTileLayer][topTop][topLeft] = 14;

            // Unbreakables on col 10 and mirrored
            for (let y = centerY - 8; y <= centerY + 7; y++) {
                this.mapData[this.defaultTileLayer][y][9] = 11;
                this.mapData[this.defaultTileLayer][y][mapWidth - 10] = 11;
            }
            // Extend Unbreakables
            for (let x = 9; x <= 13; x++) {
                this.mapData[this.defaultTileLayer][centerY + 7][x] = 11;
                this.mapData[this.defaultTileLayer][centerY + 7][mapWidth - x - 1] = 11;
                this.mapData[this.defaultTileLayer][centerY - 8][x] = 11;
                this.mapData[this.defaultTileLayer][centerY - 8][mapWidth - x - 1] = 11;
            }

            // Fill water from edges to col 1–9 and col width-10–width
            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x <= 8; x++) this.mapData[this.defaultTileLayer][y][x] = 8;
                for (let x = mapWidth - 9; x < mapWidth; x++) this.mapData[this.defaultTileLayer][y][x] = 8;
            }

        } else if (this.mapSize === this.mapSizes.showdown && (this.gamemode === 'Gem_Grab' || this.gamemode === 'Bounty' || this.gamemode === 'Hot_Zone')) {
            // Gem Grab-specific setup
            const centerX = Math.floor(mapWidth / 2);
            const centerY = Math.floor(mapHeight / 2);
            const topLeft = centerX - 1;
            const topTop = centerY - 1;
            this.mapData[this.defaultTileLayer][topTop][topLeft] = 14;
        }
        this.draw();
    }
    
    async setSize(size, changing = true) {
        const newSize = this.mapSizes[size];
            if (!newSize) return;

            if (!changing || this.undoStack.length === 0 && document.getElementById('mapLink').innerText === 'https://she-fairy.github.io/atlas-horizon/map.html' || confirm('Changing map size will clear the current map. Continue?')) {
                this.mapSize   = newSize;
                this.mapWidth  = newSize.width;
                this.mapHeight = newSize.height;
                this.resetAllLayers();

                // ——— Showdown ↔ other: adjust Objective tile + data sizes ———
                const isShowdown = size => size === this.mapSizes.showdown;
                const isShowdownNow = isShowdown(newSize);

                if (!isShowdownNow) {
                    this.minZoom = 0.4;
                    this.delta = 1.75;
                    this.zoomLevel = 0.575;
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
                    this.objectiveData.Hockey[0] = 1.5;
                    this.objectiveData.Hockey[1] = 1.695;
                    this.objectiveData.Hockey[2] = -10;
                    this.objectiveData.Hockey[3] = -15; 
                } else {
                    this.minZoom = 0.15;
                    this.delta = 0.5;
                    this.zoomLevel = 0.3;
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
                    this.objectiveData.Hockey[0] = 0.85;
                    this.objectiveData.Hockey[1] = 0.9475;
                    this.objectiveData.Hockey[2] = 15;
                    this.objectiveData.Hockey[3] = 19;
                }

                // ————————————————————————————————————————————————

                this.updateCanvasSize();
                this.fitMapToScreen();
                await this.setGamemode(this.gamemode);
            } else {
                // reset dropdown if cancelled
                e.target.value = Object.entries(this.mapSizes)
                    .find(([k, v]) => v.width === this.mapWidth && v.height === this.mapHeight)[0];
            }
    }

    async setEnvironment(environment) {
        this.environment = environment;
        this.loadEnvironmentBackgrounds();
        this.loadTileImages();
        this.preloadWaterTiles();
        this.preloadGoalImage();
        await this.setGamemode(this.gamemode, false);
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
        const sourceId = this.mapData[this.defaultTileLayer][y][x];
        if (sourceId === undefined) return;
        
        // Get the target tile ID (the currently selected tile)
        const targetId = this.selectedTile.id;
        
        // Save state before making changes
        this.saveState();
        
        // Replace all instances of the source tile with the target tile
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.mapData[this.defaultTileLayer][y][x] === sourceId) {
                    this.mapData[this.defaultTileLayer][y][x] = targetId;
                }
            }
        }
        
        // Draw the updated map
        this.draw();
        
        // Turn off replace mode
        this.toggleReplaceMode();
    }

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

    toggleCorrectMirroring() {
        this.correctMirroring = !this.correctMirroring;
        const correctMirroringBtn = document.getElementById('correctMirroringBtn');
        correctMirroringBtn.checked = this.correctMirroring;
        correctMirroringBtn.parentElement.classList.toggle('active', this.correctMirroring);
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

    rotateSelectedTiles() {
        if (this.selectedTiles.length === 0 || this.isSelectDragging) return;

        // Save state before making changes
        this.saveState();

        // Find the bounding rectangle of selected tiles
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        for (const tile of this.selectedTiles) {
            minX = Math.min(minX, tile.x);
            minY = Math.min(minY, tile.y);
            maxX = Math.max(maxX, tile.x);
            maxY = Math.max(maxY, tile.y);
        }

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        
        // Create a 2D array to store the original tile data
        const originalTiles = Array(height).fill().map(() => Array(width).fill(null));
        
        // Store original tile data with layer information
        for (const tile of this.selectedTiles) {
            const relativeX = tile.x - minX;
            const relativeY = tile.y - minY;
            originalTiles[relativeY][relativeX] = {
                id: tile.id,
                x: tile.x,
                y: tile.y,
                layer: tile.layer !== undefined ? tile.layer : this.defaultTileLayer
            };
        }

        // Clear the original tiles from the map (using their layer)
        for (const tile of this.selectedTiles) {
            const layer = tile.layer !== undefined ? tile.layer : this.defaultTileLayer;
            this.mapData[layer][tile.y][tile.x] = 0;
            
            // Also clear negative IDs for size 2 tiles
            const def = this.tileDefinitions[tile.id];
            if (def && def.size === 2) {
                this.mapData[layer][tile.y][tile.x + 1] = 0;
                this.mapData[layer][tile.y + 1][tile.x] = 0;
                this.mapData[layer][tile.y + 1][tile.x + 1] = 0;
            }
        }

        // Clear selected tiles array
        this.selectedTiles = [];

        // Rotate the tiles 90 degrees clockwise around the top-left corner (minX, minY)
        // For a 90-degree clockwise rotation: (x, y) -> (y, width - 1 - x)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const originalTile = originalTiles[y][x];
                if (originalTile) {
                    // Calculate new position after 90-degree clockwise rotation
                    const newRelativeX = y;
                    const newRelativeY = width - 1 - x;
                    
                    const newX = minX + newRelativeX;
                    const newY = minY + newRelativeY;
                    
                    // Check if the new position is within map bounds
                    if (newX >= 0 && newX < this.mapWidth && newY >= 0 && newY < this.mapHeight) {
                        // Place the tile at the new position on the correct layer
                        this.mapData[originalTile.layer][newY][newX] = originalTile.id;
                        
                        // Handle negative IDs for size 2 tiles
                        const def = this.tileDefinitions[originalTile.id];
                        if (def && def.size === 2) {
                            this.mapData[originalTile.layer][newY][newX + 1] = -1;
                            this.mapData[originalTile.layer][newY + 1][newX] = -2;
                            this.mapData[originalTile.layer][newY + 1][newX + 1] = -3;
                        }
                        
                        // Add to selected tiles array
                        this.selectedTiles.push({
                            x: newX,
                            y: newY,
                            id: originalTile.id,
                            layer: originalTile.layer
                        });
                    }
                }
            }
        }

        // Redraw the map
        this.draw();
        this.checkForErrors();
    }

    toggleHideZoom() {
        let hideZoomBtn = document.getElementById('hideZoomBtn');
        let hide = hideZoomBtn.checked;
        document.getElementById('zoomControls').style.visibility = hide ? 'hidden' : 'visible';
    }
    
    isMobileDevice() {
        // Basic mobile detection: user-agent OR coarse pointer OR small width
        try {
            const ua = navigator?.userAgent || '';
            const smallScreen = typeof window !== 'undefined' && window.innerWidth <= 900;
            const coarsePointer = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
            const uaMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(ua);
            return uaMobile || coarsePointer || smallScreen;
        } catch (e) {
            return false;
        }
    }

    applyDeviceZoomSettings() {
        // Keep existing values, but tighten them for mobile if detected.
        if (!this.isMobileDevice()) {
            // Ensure zoomLevel is within bounds for desktop too
            this.zoomLevel = 0.575;
            this.updateCanvasZoom();
            return;
        }

        // Mobile-friendly constraints (only narrow / reduce values so other explicit settings stay valid)
        this.minZoom   = Math.min(this.minZoom, 0.2);  // allow zooming out a bit more on mobile
        this.maxZoom   = Math.min(this.maxZoom, 2);   // limit deep zoom-in on mobile
        this.delta     = Math.min(this.delta, 1);     // smaller per-wheel/pinch delta for smoother changes

        // Clamp current zoom to new bounds
        this.zoomLevel = 0.4;
        this.updateCanvasZoom();
    }

    isBlock(tileId) {
        const blockIds = [1, 3, 4, 5, 6, 7, 8, 9, 11]; // IDs for Wall, Wall2, Crate, Barrel, Cactus, Water, Fence, Rope Fence, Unbreakable
        return blockIds.includes(tileId);
    }
    
    areBlocksConnected(x1, y1, x2, y2) {
        // Check if they're adjacent (including diagonally)
        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);
        return dx <= 1 && dy <= 1;
    }
    
    checkForErrors() {
        if (!this.showErrors) return;
    
        this.errorTiles.clear();
    
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.mapData[this.defaultTileLayer][y][x];
    
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
        return this.isBlock(this.mapData[this.defaultTileLayer][y][x]);
    }
    
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
        const tileId = this.mapData[this.defaultTileLayer][coords.y][coords.x];
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
    const urlParams = new URLSearchParams(window.location.search);
    const mapId = urlParams.get('id') || null;
    const user = urlParams.get('user') || null;

    let existingMap = false;
    if (mapId&& user === localStorage.getItem('user')) existingMap = true;
    window.mapMaker = new MapMaker('mapCanvas', false, existingMap);

    if (mapId && user === localStorage.getItem('user')) {
        window.Firebase.readDataOnce(`users/${user}/maps/${mapId}`)
            .then(async data => {
                if (!data) return alert('Map not found.');

                const sizeKey = data.size;  // e.g. "regular"
                const newSize  = window.mapMaker.mapSizes[sizeKey];
                window.mapMaker.gamemode = data.gamemode;
                window.mapMaker.setSize(sizeKey, false);
                window.mapMaker.mapWidth  = newSize.width;
                window.mapMaker.mapHeight = newSize.height;
                window.mapMaker.mapData   = data.mapData;

                window.mapMaker.updateCanvasSize();
                window.mapMaker.fitMapToScreen();

                await window.mapMaker.setEnvironment(data.environment);

                document.getElementById('mapName').value = data.name;
                document.getElementById('mapSize').value = data.size;
                document.getElementById('gamemode').value = data.gamemode;
                document.getElementById('environment').value = data.environment;
                document.getElementById('mapLink').innerText = `https://she-fairy.github.io/atlas-horizon/map.html?id=${mapId}&user=${user}`;
                await window.mapMaker.setGamemode(data.gamemode, false);
                document.getElementById('mapLink').innerText = `https://she-fairy.github.io/atlas-horizon/map.html?id=${mapId}&user=${user}`;
                window.mapMaker.draw();
            })
            .catch(error => {
                console.error('Error loading map:', error);
                alert('Failed to load map. Please try again.');
            });
    } else if (mapId && user){
        window.Firebase.readDataOnce(`users/${user}/maps/${mapId}`)
            .then(async data => {
                if (data) {
                    data.name += ` (Copy)`;
                    let currentUserData = await window.Firebase.readDataOnce(`users/${localStorage.getItem('user')}`);
                    let newId = await window.mapMaker.generateMapId(localStorage.getItem('user'));
                    await window.Firebase.writeData(`users/${localStorage.getItem('user')}/maps/${newId}`, data);
                    window.location.href = `https://she-fairy.github.io/atlas-horizon/mapmaker.html?id=${newId}&user=${localStorage.getItem('user')}`;
                }
            })
    }
});

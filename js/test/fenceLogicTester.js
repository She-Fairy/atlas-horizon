class FenceLogicTester {
    constructor() {
        this.mapMaker = null;
        this.testResults = [];
    }

    initialize() {
        // Create a test canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'testCanvas';
        document.body.appendChild(canvas);
        this.mapMaker = new MapMaker('testCanvas');
    }

    cleanup() {
        const canvas = document.getElementById('testCanvas');
        if (canvas) {
            document.body.removeChild(canvas);
        }
        this.mapMaker = null;
        this.testResults = [];
    }

    // Test helper to create a test map with fences
    createTestMap(pattern) {
        const height = pattern.length;
        const width = pattern[0].length;
        
        // Reset map to correct size
        this.mapMaker.mapHeight = height;
        this.mapMaker.mapWidth = width;
        this.mapMaker.mapData = Array(height).fill().map(() => Array(width).fill(0));
        
        // Place fences according to pattern
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (pattern[y][x] === 'F') {
                    this.mapMaker.mapData[y][x] = 7; // Fence tile ID
                } else if (pattern[y][x] === 'R') {
                    this.mapMaker.mapData[y][x] = 9; // Rope fence tile ID
                }
            }
        }
    }

    // Test specific fence logic
    testFenceLogic(environment, pattern, expectedResults) {
        this.mapMaker.environment = environment;
        this.createTestMap(pattern);
        
        const results = [];
        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[0].length; x++) {
                if (pattern[y][x] === 'F' || pattern[y][x] === 'R') {
                    const tileId = pattern[y][x] === 'F' ? 7 : 9;
                    const imageName = this.mapMaker.fenceLogicHandler.getFenceImageName(
                        x, y, this.mapMaker.mapData, environment, tileId === 7
                    );
                    results.push({
                        x, y, 
                        type: pattern[y][x], 
                        expected: expectedResults[y][x],
                        actual: imageName,
                        passed: imageName === expectedResults[y][x]
                    });
                }
            }
        }
        this.testResults.push({
            environment,
            results,
            passed: results.every(r => r.passed)
        });
        return results.every(r => r.passed);
    }

    // Run all test cases
    runAllTests() {
        // Test Logic 1 (Simple Block)
        this.testFenceLogic('Desert', [
            ['F', 'F', 'F'],
            ['0', '0', '0'],
            ['F', 'F', 'F']
        ], [
            ['block', 'horizontal', 'block'],
            ['0', '0', '0'],
            ['block', 'horizontal', 'block']
        ]);

        // Test Logic 2 (Binary Code)
        this.testFenceLogic('Retropolis', [
            ['0', 'F', '0'],
            ['F', 'F', 'F'],
            ['0', 'F', '0']
        ], [
            ['0', '1001', '0'],
            ['0110', '0110', '0110'],
            ['0', '1001', '0']
        ]);

        // Test Logic 3 (Six Piece)
        this.testFenceLogic('Water_Park', [
            ['F', 'F', 'F'],
            ['F', 'F', '0'],
            ['F', '0', '0']
        ], [
            ['TL', 'Hor', 'TR'],
            ['Ver', 'BR', '0'],
            ['BL', '0', '0']
        ]);

        // Test Logic 4 (Four Piece)
        this.testFenceLogic('Brawlywood', [
            ['0', 'F', '0'],
            ['F', 'F', '0'],
            ['0', '0', '0']
        ], [
            ['0', 'T', '0'],
            ['R', 'TR', '0'],
            ['0', '0', '0']
        ]);

        return this.testResults;
    }

    // Print test results
    printResults() {
        console.log('=== Fence Logic Test Results ===');
        this.testResults.forEach(test => {
            console.log(`\nEnvironment: ${test.environment}`);
            console.log(`Overall: ${test.passed ? 'PASSED' : 'FAILED'}`);
            
            const failures = test.results.filter(r => !r.passed);
            if (failures.length > 0) {
                console.log('\nFailures:');
                failures.forEach(f => {
                    console.log(`  Position (${f.x},${f.y}): Expected ${f.expected}, got ${f.actual}`);
                });
            }
        });
    }
}

// Export for use in browser console
window.FenceLogicTester = FenceLogicTester; 
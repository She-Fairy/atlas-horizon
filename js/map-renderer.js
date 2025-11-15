import { MapMaker } from './mapmaker.js';

const MAP_SIZES = {
  regular: { width: 21, height: 33 },
  showdown: { width: 60, height: 60 },
  arena: { width: 59, height: 59 },
  siege: { width: 27, height: 39 },
  volley: { width: 21, height: 25 },
  basket: { width: 21, height: 17 },
};

const sharedResources = {
  tiles: {},   // tiles[env][gamemode] = { tileImages }
  backgrounds: {}, // backgrounds[env] = { bgDark, bgLight }
};

export async function generateMapImage(mapData, size = 'regular', gamemode = 'Gem_Grab', environment = 'Desert') {
  // Get actual map dimensions from mapData
  // CRITICAL: mapData structure is mapData[layer][y][x]
  // So mapData[0] is the first layer (array of rows)
  // mapData[0][0] is the first row (array of tileIds)
  let actualWidth, actualHeight;
  if (mapData && Array.isArray(mapData) && mapData.length > 0) {
    const firstLayer = mapData[0];
    if (firstLayer && Array.isArray(firstLayer) && firstLayer.length > 0) {
      // height is number of rows
      actualHeight = firstLayer.length;
      // width is length of first row
      const firstRow = firstLayer[0];
      actualWidth = (firstRow && Array.isArray(firstRow)) ? firstRow.length : MAP_SIZES[size].width;
    } else {
      // Fallback to size-based dimensions
      ({ width: actualWidth, height: actualHeight } = MAP_SIZES[size]);
    }
  } else {
    // Fallback to size-based dimensions
    ({ width: actualWidth, height: actualHeight } = MAP_SIZES[size]);
  }
  
  // For preview images, always use regular map size (21x33) as the canvas size
  // This ensures all previews are the same size
  const previewWidth = MAP_SIZES.regular.width;  // 21
  const previewHeight = MAP_SIZES.regular.height; // 33
  
  // Calculate canvas padding and base tile size
  const padding = 16;
  const baseTileSize = 32;
  
  // Calculate scale to fit the actual map within the preview canvas
  // Scale down if the map is larger than regular size
  const widthScale = Math.min(1, previewWidth / actualWidth);
  const heightScale = Math.min(1, previewHeight / actualHeight);
  const scale = Math.min(widthScale, heightScale);
  
  // Calculate tile size for the preview (scaled to fit regular size canvas)
  const tileSize = Math.floor(baseTileSize * scale);
  
  // Calculate scaled dimensions
  const scaledWidth = actualWidth * scale;
  const scaledHeight = actualHeight * scale;
  
  // Calculate offset in tiles to center the scaled map within the preview canvas
  // For showdown maps (60x60), we'll center vertically
  const offsetX = Math.max(0, (previewWidth - scaledWidth) / 2);
  const offsetY = Math.max(0, (previewHeight - scaledHeight) / 2);
  
  const div1 = document.createElement('div');
  const div2 = document.createElement('div');
  const canvas = document.createElement('canvas');
  div2.append(canvas);
  div1.append(div2);

  // Canvas size is always regular map size (21x33) for consistent previews
  canvas.width = (previewWidth * baseTileSize) + (padding * 2);
  canvas.height = (previewHeight * baseTileSize) + (padding * 2);

  const renderer = new MapMaker(canvas, true);
  
  // CRITICAL: Set gamemode and environment BEFORE loading tiles
  // because loadTileImages() uses this.gamemode to determine which tiles to load
  renderer.environment = environment;
  renderer.gamemode = gamemode;
  
  // CRITICAL: Set mapData and use actual dimensions for rendering
  // mapData structure: mapData[layer][y][x] = tileId
  // Ensure mapData is valid - if it's null/undefined or malformed, create empty map
  if (!mapData || !Array.isArray(mapData) || mapData.length === 0) {
    console.warn('Invalid mapData, creating empty map');
    renderer.mapData = renderer.createEmptyLayeredMap(actualWidth, actualHeight);
    renderer.mapWidth = actualWidth;
    renderer.mapHeight = actualHeight;
  } else {
    renderer.mapData = mapData;
    // Use actual map dimensions for rendering
    renderer.mapWidth = actualWidth;
    renderer.mapHeight = actualHeight;
  }
  
  renderer.mapSize = renderer.mapSizes[size] || { width: actualWidth, height: actualHeight };
  renderer.tileSize = tileSize; // Use scaled tile size
  renderer.canvasPadding = padding; // Set padding to match canvas
  
  // Store offset for centering
  renderer.previewOffsetX = offsetX;
  renderer.previewOffsetY = offsetY;

  // Ensure environment cache exists
  if (!sharedResources.tiles[environment]) {
    sharedResources.tiles[environment] = {};
  }

  // 1. Background images
  if (!sharedResources.backgrounds[environment]) {
    await renderer.loadEnvironmentBackgrounds();
    await Promise.all([
      waitForImage(renderer.bgDark),
      waitForImage(renderer.bgLight)
    ]);

    sharedResources.backgrounds[environment] = {
      bgDark: renderer.bgDark,
      bgLight: renderer.bgLight
    };
  }

  // 2. Tile images (per env + gamemode)
  if (!sharedResources.tiles[environment][gamemode]) {
    await renderer.loadTileImages();
    await renderer.preloadWaterTiles();

    // Filter out tiles that aren't allowed in this environment/gamemode
    // CRITICAL: Don't filter out dynamically loaded images (water, fences, etc.)
    // which use cache keys instead of tileId keys
    const filteredTileImages = {};
    for (const [key, img] of Object.entries(renderer.tileImages)) {
      // Check if this is a tileId key (numeric string) or a cache key (like water_xxx, image paths, etc.)
      const tileId = parseInt(key);
      const isNumericKey = !isNaN(tileId) && String(tileId) === key;
      
      if (isNumericKey) {
        // This is a tileId key - check if it should be filtered
        const def = renderer.tileDefinitions[tileId];
        if (!def) {
          // No definition, keep it (might be needed)
          filteredTileImages[key] = img;
          continue;
        }
        
        // Skip tiles that are restricted to specific environments
        if (def.showInEnvironment && !def.showInEnvironment.includes(environment)) continue;
        
        // Skip tiles that are restricted to specific gamemodes
        // showInGamemode can be a string or an array
        if (def.showInGamemode) {
          if (Array.isArray(def.showInGamemode)) {
            if (!def.showInGamemode.includes(gamemode)) continue;
          } else {
            if (def.showInGamemode !== gamemode) continue;
          }
        }
      }
      // Always keep non-numeric keys (water tiles, fence tiles, image paths, etc.)
      filteredTileImages[key] = img;
    }
    renderer.tileImages = filteredTileImages;

    await Promise.all(
      Object.values(renderer.tileImages).map(waitForImage)
    );

    sharedResources.tiles[environment][gamemode] = renderer.tileImages;
  }

  // Assign cached resources to mapMaker
  renderer.bgDark = sharedResources.backgrounds[environment].bgDark;
  renderer.bgLight = sharedResources.backgrounds[environment].bgLight;
  
  // CRITICAL: Merge cached images with any dynamically loaded images (water, fences, etc.)
  // Don't replace - merge to preserve dynamically loaded images
  const cachedImages = sharedResources.tiles[environment][gamemode];
  renderer.tileImages = { ...cachedImages, ...renderer.tileImages };

  // Skip Brawl Ball corner tiles
  const isBrawlBall = gamemode === 'Brawl_Ball';
  const isRegular = size === 'regular';

  // Load goal images
  renderer.goalImages = [];
  if (isBrawlBall && isRegular) {
    renderer.goalImages = [
      { name: 'goalRed', x: renderer.mapWidth / 2 - 3.5, y: 0, w: 7, h: 3.5, offsetX: 0, offsetY: -20 },
      { name: 'goalBlue', x: renderer.mapWidth / 2 - 3.5, y: renderer.mapHeight - 5, w: 7, h: 3.5, offsetX: 0, offsetY: -10 }
    ];
    await Promise.all(
      renderer.goalImages.map(goal =>
        renderer.preloadGoalImage(goal.name, environment))
    );
  }

  // Ensure all images are loaded before drawing
  // Wait for all tile images to be complete
  const imagePromises = Object.values(renderer.tileImages)
    .filter(img => img && !img.complete)
    .map(img => waitForImage(img));
  
  await Promise.all(imagePromises);

  // Draw the map
  renderer.draw();

  // Wait for any images that might have been loaded during draw
  // (fences, water tiles, etc. are loaded dynamically)
  // Collect all images from tileImages (including dynamically added ones)
  const allImageKeys = Object.keys(renderer.tileImages);
  const allImages = allImageKeys.map(key => renderer.tileImages[key]).filter(img => img);
  const remainingPromises = allImages
    .filter(img => !img.complete)
    .map(img => waitForImage(img));
  
  if (remainingPromises.length > 0) {
    await Promise.all(remainingPromises);
    // Redraw if new images were loaded
    renderer.draw();
  }
  
  // Final check - wait a bit more for any last-minute image loads
  // This is especially important for dynamically loaded images
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // One final draw to ensure everything is rendered
  renderer.draw();

  const ctx = canvas.getContext('2d');
  for (const goal of renderer.goalImages) {
    const img =
      renderer.goalImageCache[`${goal.name}_${environment}`] ||
      renderer.goalImageCache[goal.name];
    if (!img || !img.complete) continue;

    // Apply preview offset for centering
    const previewOffsetX = (renderer.previewOffsetX) ? renderer.previewOffsetX * baseTileSize : 0;
    const previewOffsetY = (renderer.previewOffsetY) ? renderer.previewOffsetY * baseTileSize : 0;

    ctx.drawImage(
      img,
      goal.x * tileSize + padding + (goal.offsetX || 0) + previewOffsetX,
      goal.y * tileSize + padding + (goal.offsetY || 0) + previewOffsetY,
      (goal.w || 1) * tileSize,
      (goal.h || 1) * tileSize
    );
  }

  return canvas.toDataURL('image/png');
}

function waitForImage(img) {
  return new Promise((resolve) => {
    if (img?.complete) resolve();
    else {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    }
  });
}

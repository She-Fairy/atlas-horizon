import { MapMaker } from './mapmaker.js';

const MAP_SIZES = {
  regular: { width: 21, height: 33 },
  showdown: { width: 60, height: 60 },
  siege: { width: 27, height: 39 },
  volley: { width: 21, height: 25 },
  basket: { width: 21, height: 17 },
};

const sharedResources = {
  tiles: {},   // tiles[env][gamemode] = { tileImages }
  backgrounds: {}, // backgrounds[env] = { bgDark, bgLight }
};

export async function generateMapImage(mapData, size = 'regular', gamemode = 'Gem_Grab', environment = 'Desert') {
  const { width, height } = MAP_SIZES[size];
  const tileSize = 32;
  const padding = 16;
  const canvas = document.createElement('canvas');
  canvas.width = (width * tileSize) + (padding * 2);
  canvas.height = (height * tileSize) + (padding * 2);

  const renderer = new MapMaker(canvas, true);
  renderer.mapData = mapData;
  renderer.mapWidth = width;
  renderer.mapHeight = height;
  renderer.mapSize = renderer.mapSizes[size];
  renderer.environment = environment;
  renderer.gamemode = gamemode;

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
    renderer.preloadWaterTiles();

    await Promise.all(
      Object.values(renderer.tileImages).map(waitForImage)
    );

    sharedResources.tiles[environment][gamemode] = renderer.tileImages;
  }

  // Assign cached resources to mapMaker
  renderer.bgDark = sharedResources.backgrounds[environment].bgDark;
  renderer.bgLight = sharedResources.backgrounds[environment].bgLight;
  renderer.tileImages = sharedResources.tiles[environment][gamemode];

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


  renderer.draw();

  const ctx = canvas.getContext('2d');
  for (const goal of renderer.goalImages) {
    const img =
      renderer.goalImageCache[`${goal.name}_${environment}`] ||
      renderer.goalImageCache[goal.name];
    if (!img || !img.complete) continue;

    ctx.drawImage(
      img,
      goal.x * tileSize + padding + (goal.offsetX || 0),
      goal.y * tileSize + padding + (goal.offsetY || 0),
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

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

  const mapMaker = new MapMaker(canvas, true);
  mapMaker.mapData = mapData;
  mapMaker.mapWidth = width;
  mapMaker.mapHeight = height;
  mapMaker.mapSize = MAP_SIZES[size];
  mapMaker.environment = environment;
  mapMaker.gamemode = gamemode;

  // Ensure environment cache exists
  if (!sharedResources.tiles[environment]) {
    sharedResources.tiles[environment] = {};
  }

  // 1. Background images
  if (!sharedResources.backgrounds[environment]) {
    await mapMaker.loadEnvironmentBackgrounds();
    await Promise.all([
      waitForImage(mapMaker.bgDark),
      waitForImage(mapMaker.bgLight)
    ]);

    sharedResources.backgrounds[environment] = {
      bgDark: mapMaker.bgDark,
      bgLight: mapMaker.bgLight
    };
  }

  // 2. Tile images (per env + gamemode)
  if (!sharedResources.tiles[environment][gamemode]) {
    await mapMaker.loadTileImages();
    mapMaker.preloadWaterTiles();

    await Promise.all(
      Object.values(mapMaker.tileImages).map(waitForImage)
    );

    sharedResources.tiles[environment][gamemode] = mapMaker.tileImages;
  }

  // Assign cached resources to mapMaker
  mapMaker.bgDark = sharedResources.backgrounds[environment].bgDark;
  mapMaker.bgLight = sharedResources.backgrounds[environment].bgLight;
  mapMaker.tileImages = sharedResources.tiles[environment][gamemode];

  mapMaker.draw();

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

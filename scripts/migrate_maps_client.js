// Client-side one-off migration script
// How to use: open the mapmaker page while logged in (so `window.mapMaker` exists),
// paste this file's contents into the browser console (or include it in the page),
// then call `runMigration()`.

(function(){
  'use strict';

  const layerCount = 5;
  const defaultTileLayer = 2;

  const mapSizes = {
    regular: { width: 21, height: 33 },
    showdown: { width: 60, height: 60 },
    arena: { width: 59, height: 59 },
    siege: { width: 27, height: 39 },
    volley: { width: 21, height: 25 },
    basket: { width: 21, height: 17 }
  };

  function createEmptyGrid(width, height){
    const g = new Array(height);
    for (let y=0;y<height;y++){
      g[y] = new Array(width).fill(0);
    }
    return g;
  }

  function isOldFormat(mapData, sizeKey){
    // Old format is a 2D grid (height x width). New format is an array of length layerCount.
    if (!Array.isArray(mapData)) return false;
    if (mapData.length === layerCount && Array.isArray(mapData[0]) && Array.isArray(mapData[0][0])) return false; // already layered

    // If mapData[y][x] is a number for y/ x in expected dims, assume old
    const dims = mapSizes[sizeKey] || mapSizes.regular;
    if (mapData.length === dims.height && Array.isArray(mapData[0]) && mapData[0].length === dims.width) return true;

    // fallback: if first element is a number (not an array of layers)
    return Array.isArray(mapData[0]) && typeof mapData[0][0] === 'number';
  }

  function convertOldToNew(oldGrid, sizeKey, tileLayerMap){
    const dims = mapSizes[sizeKey] || mapSizes.regular;
    const width = dims.width;
    const height = dims.height;

    const newMap = new Array(layerCount).fill(null).map(()=> createEmptyGrid(width, height));

    // If oldGrid already has different orientation, try to normalise
    if (!oldGrid || !Array.isArray(oldGrid) || oldGrid.length !== height) {
      // try to transpose or fallback — but keep original in layer 2
      newMap[defaultTileLayer] = JSON.parse(JSON.stringify(oldGrid));
      return newMap;
    }

    // copy old into default layer
    for (let y=0;y<height;y++){
      for (let x=0;x<width;x++){
        newMap[defaultTileLayer][y][x] = oldGrid[y][x] ?? 0;
      }
    }

    // Move tiles that declare their own layer
    if (tileLayerMap && Object.keys(tileLayerMap).length){
      for (let y=0;y<height;y++){
        for (let x=0;x<width;x++){
          const id = newMap[defaultTileLayer][y][x];
          if (!id) continue;
          const targetLayer = tileLayerMap[id];
          if (typeof targetLayer === 'number' && targetLayer !== defaultTileLayer){
            // move
            newMap[targetLayer][y][x] = id;
            newMap[defaultTileLayer][y][x] = 0;
          }
        }
      }
    }

    return newMap;
  }

  async function runMigration({confirmRun=true} = {}){
    if (!window.Firebase || !window.Firebase.readDataOnce) throw new Error('Firebase client helpers not found on window.Firebase. Run on the site where firebase-service.js is loaded.');
    if (!confirmRun || confirm('This will modify all maps in your Firebase DB under `users/*/maps/*`. Make a backup first. Proceed?')){
      console.log('Starting migration...');

      // Build tile->layer map from live mapMaker if available
      let tileLayerMap = {};
      if (window.mapMaker && window.mapMaker.tileDefinitions){
        Object.entries(window.mapMaker.tileDefinitions).forEach(([k, def])=>{
          const id = Number(k);
          if (!isNaN(id) && def && typeof def.layer === 'number'){
            tileLayerMap[id] = def.layer;
          }
        });
        console.log('Derived tile layer map from window.mapMaker, entries:', Object.keys(tileLayerMap).length);
      } else {
        console.warn('window.mapMaker.tileDefinitions not found — conversion will not relocate tiles to their designated layers. Run this on the mapmaker page for full relocation.');
      }

      const users = await window.Firebase.readDataOnce('users');
      if (!users) return console.warn('No users found in DB.');

      const userIds = Object.keys(users);
      let total = 0, converted = 0;

      for (const userId of userIds){
        const maps = users[userId].maps;
        if (!maps) continue;
        for (const mapId of Object.keys(maps)){
          total++;
          const mapObj = maps[mapId];
          if (!mapObj || !mapObj.mapData) continue;
          const sizeKey = mapObj.size || 'regular';
          if (!isOldFormat(mapObj.mapData, sizeKey)) continue; // already new format

          const newMapData = convertOldToNew(mapObj.mapData, sizeKey, tileLayerMap);

          const newMapObj = Object.assign({}, mapObj, { mapData: newMapData });

          try {
            await window.Firebase.writeData(`users/${userId}/maps/${mapId}`, newMapObj);
            converted++;
            console.log(`Converted map ${mapId} for user ${userId}`);
          } catch (e){
            console.error(`Failed to write map ${mapId} for user ${userId}:`, e);
          }
        }
      }

      console.log(`Migration complete. Scanned ${total} maps, converted ${converted}.`);
      return {scanned: total, converted};
    } else {
      console.log('Migration cancelled by user.');
      return {scanned:0, converted:0};
    }
  }

  // expose for console
  window.migrateMapsToLayers = { runMigration, convertOldToNew };

  console.log('Migration helper loaded. Call `await migrateMapsToLayers.runMigration()` to start.');

})();

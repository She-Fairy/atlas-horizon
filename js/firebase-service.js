// Make sure this file does not use any import/export

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDWI8yECOR6xdwO20J0UB8oVcmc5p-ieU0",
  authDomain: "atlas-tiler.firebaseapp.com",
  databaseURL: "https://atlas-tiler-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "atlas-tiler",
  storageBucket: "atlas-tiler.appspot.com",
  messagingSenderId: "285605586717",
  appId: "1:285605586717:web:ffc0f7ed0dd73edea723f4",
  measurementId: "G-LSE3W246E3"
};

// Initialize Firebase only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

// Attach functions to global `Firebase` object
window.Firebase = {
  auth: firebase.auth(),
  writeData: async (path, data) => {
    await db.ref(path).set(data);
  },

  pushData: async (path, data) => {
    const ref = await db.ref(path).push(data);
    return ref.key;
  },

  readDataOnce: async (path) => {
    const snapshot = await db.ref(path).once('value');
    return snapshot.val();
  },

  listenForChanges: (path, callback) => {
    db.ref(path).on('value', snapshot => callback(snapshot.val()));
  },

  stopListening: (path) => {
    db.ref(path).off();
  }
};

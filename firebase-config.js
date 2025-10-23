// Firebase Configuration
// IMPORTANT: Replace this with YOUR Firebase config from the Firebase Console
// See FIREBASE_SETUP_GUIDE.md for instructions

const firebaseConfig = {
    apiKey: "AIzaSyAIUrWEH7TsAjJ9XcnAjFFFTEdT5FaMjJM",
    authDomain: "doodle-jump-game-1cb99.firebaseapp.com",
    databaseURL: "https://doodle-jump-game-1cb99-default-rtdb.firebaseio.com",
    projectId: "doodle-jump-game-1cb99",
    storageBucket: "doodle-jump-game-1cb99.firebasestorage.app",
    messagingSenderId: "837064905793",
    appId: "1:837064905793:web:1977f0f65233811bc822c0"
  };

// Initialize Firebase
// This will be called from game.js after Firebase SDK loads
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return null;
    }
    
    try {
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        console.log('✅ Firebase initialized successfully!');
        return database;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return null;
    }
}


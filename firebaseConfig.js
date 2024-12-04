// Load environment variables
require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using ADC
try {
    const bucketName = 'targetted-money-saver.firebasestorage.app';
    admin.initializeApp({
        storageBucket: bucketName,
    });
    console.log('Firebase Admin initialized successfully using Application Default Credentials (ADC)');
} catch (error) {
    console.error('Failed to initialize Firebase Admin:', error.message);
    throw error;
}

// Initialize Firestore
let db;
try {
    db = admin.firestore();
    console.log('Firestore initialized successfully');
} catch (error) {
    console.error('Failed to initialize Firestore:', error.message);
    throw error;
}

// Test Firebase Storage access
const testStorageAccess = async () => {
    try {
        const bucket = admin.storage().bucket();
        const [files] = await bucket.getFiles();
        console.log('Successfully accessed bucket. Files:', files.map(file => file.name));
    } catch (error) {
        console.error('Failed to access Firebase Storage bucket:', error.message);
        process.exit(1); // Exit process if access fails
    }
};

testStorageAccess();

module.exports = { admin, db };

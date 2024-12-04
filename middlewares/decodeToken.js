const { admin } = require('../firebaseConfig');

// Middleware untuk mendekode token
const decodeToken = async (request, h) => {
    const token = request.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        console.log('Token is missing or invalid');
        return h.response({ error: 'Unauthorized, token is missing' }).code(401);
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Decoded UID:', decodedToken.uid); // Log untuk verifikasi
        request.auth = { uid: decodedToken.uid }; 
        return h.continue; 
    } catch (error) {
        console.error('Error verifying token:', error.message);
        return h.response({ error: 'Unauthorized, invalid token' }).code(401);
    }
};

module.exports = decodeToken;
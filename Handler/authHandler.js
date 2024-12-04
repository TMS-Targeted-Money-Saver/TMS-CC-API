const { admin } = require('../firebaseConfig');

// Handler untuk register user
const registerHandler = async (request, h) => {
    const { email, password } = request.payload;

    if (!email || !password) {
        return h.response({ error: 'Email and password are required' }).code(400);
    }

    try {
        const user = await admin.auth().createUser({ email, password });
        return h.response({ message: 'User registered successfully', uid: user.uid }).code(201);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'Failed to register user', details: error.message }).code(500);
    }
};

// Handler untuk login user
const loginHandler = async (request, h) => {
    const { email, password } = request.payload;

    if (!email || !password) {
        return h.response({ error: 'Email and password are required' }).code(400);
    }

    try {
        const user = await admin.auth().getUserByEmail(email);
        const token = await admin.auth().createCustomToken(user.uid);

        return h.response({ message: 'Login successful', token }).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'Failed to login user', details: error.message }).code(500);
    }
};

module.exports = { loginHandler, registerHandler };

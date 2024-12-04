const { registerHandler, loginHandler } = require('../Handler/authHandler');

const authRoutes = [
    {
        method: 'POST',
        path: '/register',
        handler: registerHandler
    },
    {
        method: 'POST',
        path: '/login',
        handler: loginHandler
    }
];

module.exports = authRoutes;

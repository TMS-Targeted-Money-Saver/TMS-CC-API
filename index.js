const Hapi = require('@hapi/hapi');
const authRoutes = require('./Routes/authRoutes');
const dataRoutes = require('./Routes/dataRoutes');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    // Mendaftarkan routes
    server.route([...authRoutes, ...dataRoutes]);

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

init();

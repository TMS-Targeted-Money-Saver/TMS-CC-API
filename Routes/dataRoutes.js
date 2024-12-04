const { saveDataHandler, getDreamProductHandler, updateSavingsHandler, deleteDreamProductHandler } = require('../Handler/dataHandler');
const decodeToken = require('../middlewares/decodeToken');

const dataRoutes = [
    {
        method: 'POST',
        path: '/addDreamProduct',
        handler: saveDataHandler,
        options: {
            pre: [
                { method: decodeToken, assign: 'auth' } // Verifikasi token sebelum melanjutkan
            ]
        }
    },
    {
        method: 'GET',
        path: '/getDreamProduct',
        handler: getDreamProductHandler,
        options: {
            pre: [
                { method: decodeToken, assign: 'auth' } // Verifikasi token sebelum melanjutkan
            ]
        }
    },
    {
        method: 'PATCH',
        path: '/updateSavings',
        handler: updateSavingsHandler,
        options: {
            pre: [
                { method: decodeToken, assign: 'auth' }
            ]
        }
    },
    {
        method: 'DELETE',
        path: '/deleteDreamProduct',
        handler: deleteDreamProductHandler,
        options: {
            pre: [
                { method: decodeToken, assign: 'auth'}
            ]
        }
    }
];

module.exports = dataRoutes;
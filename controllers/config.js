
// config.js
const environment = 'production'; // Change to 'production' when ready

const config = {
    testing: {
        baseUrl: 'https://restpilot.paylink.sa',
        apiId: 'APP_ID_1123453311',
        secretKey: '0662abb5-13c7-38ab-cd12-236e58f43766',
    },
    production: {
        baseUrl: 'https://restapi.paylink.sa',
        apiId: 'APP_ID_1724877001963',
        secretKey:'d9077b9e-f924-3861-a35f-5bb524f5b19f',
    },
};

const { baseUrl, apiId, secretKey } = config[environment];

module.exports = { baseUrl, apiId, secretKey };

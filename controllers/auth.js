
const axios = require('axios');
const { baseUrl, apiId, secretKey } = require('./config');

async function authenticate() {
    try {
        const response = await axios.post(`${baseUrl}/api/auth`, {
            apiId,
            secretKey,
            persistToken: false, // Set to true if you want the token to last 30 hours
        });

        const token = response.data.id_token;
        console.log('Token:', token);
        return token;
    } catch (error) {
        console.error('Authentication failed:', error.response.data);
        throw error;
    }
}

module.exports = authenticate;

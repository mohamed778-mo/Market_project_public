// getInvoice.js
const axios = require('axios');
const authenticate = require('./auth');
const { baseUrl } = require('./config');

async function getInvoice(transactionNo) {
    try {
        const token = await authenticate();

        const response = await axios.get(`${baseUrl}/api/getInvoice/${transactionNo}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        console.log('Invoice Details:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to get invoice:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = getInvoice;

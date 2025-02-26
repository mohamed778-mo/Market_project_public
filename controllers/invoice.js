const axios = require('axios');
const authenticate = require('./auth');
const { baseUrl } = require('./config');

async function createInvoice(data) {
    try {
        // الحصول على رمز التوثيق
        const token = await authenticate();

        // إعداد بيانات الفاتورة
        const invoiceData = {
            orderNumber: data.orderNumber,
            amount: data.amount,
            callBackUrl: data.callBackUrl,
            cancelUrl: data.cancelUrl,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            clientMobile: data.clientMobile,
            currency: data.currency,
            products: data.products,
            smsMessage: data.smsMessage,
            supportedCardBrands: data.supportedCardBrands,
            displayPending: data.displayPending,
            note: data.note,
        };

        // إرسال الطلب لإنشاء الفاتورة
        const response = await axios.post(`${baseUrl}/api/addInvoice`, invoiceData, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        // التحقق من وجود بيانات الفاتورة في الاستجابة
        if (!response.data || !response.data.url) {
            throw new Error('Invalid response from API: Missing payment URL');
        }

        // تسجيل الرابط وإعادته
        const paymentUrl = response.data.url;
        console.log('Payment URL:', paymentUrl);
        return paymentUrl;
    } catch (error) {
        // تسجيل تفاصيل الخطأ
        console.error('Invoice creation failed:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = createInvoice;

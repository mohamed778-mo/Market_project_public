
function handleInvoiceStatus(invoice) {
    const status = invoice.orderStatus;

    switch (status) {
        case 'PENDING':
            console.log('Invoice is pending.');
            break;
        case 'PAID':
            console.log('Invoice is paid.');
            break;
        case 'CANCELED':
            console.log('Invoice is canceled.');
            break;
        default:
            console.log('Unknown status:', status);
    }
}

module.exports = handleInvoiceStatus;

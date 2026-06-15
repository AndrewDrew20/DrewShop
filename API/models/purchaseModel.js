const mongoose = require('mongoose');

const purchaseModel = new mongoose.Schema({
    id_Product:      { type: String, required: true },
    id_Category:     { type: String, required: true },
    id_User:         { type: String, required: true },
    totalPrice:      { type: Number, required: true },
    status:          { type: String, required: true },
    shippingAddress: { type: String, required: true },
    fullName:        { type: String, default: '' },
    phone:           { type: String, default: '' },
    quantity:        { type: Number, required: true, default: 1 },
    description:     { type: String, required: true },
    date:            { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', purchaseModel);

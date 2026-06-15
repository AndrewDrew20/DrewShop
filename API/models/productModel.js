const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    auth0Id:  { type: String, required: true },
    userName: { type: String, required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String, default: '' },
    date:     { type: Date, default: Date.now }
}, { _id: true });

const productSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    id_category: { type: String, required: true },
    id_User:     { type: String, required: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true },
    stock:       { type: Number, required: true, default: 0 },
    rating:      { type: Number, required: false, default: 0 },
    imageUrl:    { type: String, required: false },
    reviews:     { type: [reviewSchema], default: [] }
});

module.exports = mongoose.model('Product', productSchema);

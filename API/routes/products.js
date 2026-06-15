const express = require('express');
const router = express.Router();

const Product = require('../models/productModel');
const Purchase = require('../models/purchaseModel');
const User = require('../models/userModel');
const { checkJwt, requireAdmin } = require('../middleware/auth');

// middleware to get products by ID
const getProduct = async (req, res, next) => {
    let products;
    try {
        products = await Product.findById(req.params.id);
        if (products == null) {
            return res.status(404).json({ message: 'Cannot find product' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.products = products;
    next();
}

// Catálogo público
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', getProduct, (req, res) => {
    res.send(res.products);
});

// Crear, editar, borrar producto: solo admin
router.post('/', checkJwt, requireAdmin, async (req, res) => {
    const product = new Product({
        name: req.body.name,
        id_category: req.body.id_category,
        id_User: req.body.id_User,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        rating: req.body.rating,
        imageUrl: req.body.imageUrl
    });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id', checkJwt, requireAdmin, getProduct, async (req, res) => {
    try {
        // No permitir tocar reviews por acá (tienen sus propias rutas).
        const { reviews, ...safe } = req.body;
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: safe },
            { new: true, runValidators: false }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', checkJwt, requireAdmin, getProduct, async (req, res) => {
    try {
        await res.products.deleteOne();
        res.json({ message: "Product Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// stock de forma atómica para evitar oversell en compras concurrentes.
// Sólo descuenta si el stock alcanza; si no, devuelve 409.
router.post('/:id/decrement-stock', checkJwt, async (req, res) => {
    const qty = Number(req.body.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ message: 'Cantidad inválida' });
    }
    try {
        const updated = await Product.findOneAndUpdate(
            { _id: req.params.id, stock: { $gte: qty } },
            { $inc: { stock: -qty } },
            { new: true }
        );
        if (!updated) {
            return res.status(409).json({ message: 'Stock insuficiente' });
        }
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Crear reseña — solo usuarios que hayan comprado el producto
router.post('/:id/reviews', checkJwt, async (req, res) => {
    const auth0Id = req.auth.payload.sub;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Verificar que el usuario haya comprado este producto
        const purchase = await Purchase.findOne({
            id_Product: req.params.id,
            id_User: auth0Id
        });
        if (!purchase) {
            return res.status(403).json({ message: 'Debés haber comprado este producto para reseñarlo' });
        }

        // Una reseña por usuario por producto
        if (product.reviews.some(r => r.auth0Id === auth0Id)) {
            return res.status(409).json({ message: 'Ya dejaste una reseña para este producto' });
        }

        const user = await User.findOne({ auth0Id });
        const userName = user?.name || req.auth.payload.name || 'Usuario';

        product.reviews.push({
            auth0Id,
            userName,
            rating: Number(rating),
            comment: comment || ''
        });

        // Recalcular rating promedio
        const sum = product.reviews.reduce((a, r) => a + r.rating, 0);
        product.rating = Number((sum / product.reviews.length).toFixed(2));

        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar reseña (autor o admin)
router.delete('/:id/reviews/:reviewId', checkJwt, async (req, res) => {
    const auth0Id = req.auth.payload.sub;
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const review = product.reviews.id(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        const user = await User.findOne({ auth0Id });
        const isOwner = review.auth0Id === auth0Id;
        const isAdmin = user?.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        product.reviews.pull(req.params.reviewId);

        if (product.reviews.length > 0) {
            const sum = product.reviews.reduce((a, r) => a + r.rating, 0);
            product.rating = Number((sum / product.reviews.length).toFixed(2));
        } else {
            product.rating = 0;
        }

        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

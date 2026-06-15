const express = require('express');
const router = express.Router();
const Purchase = require('../models/purchaseModel');
const User = require('../models/userModel');
const { checkJwt, requireAdmin } = require('../middleware/auth');

const getPurchase = async (req, res, next) => {
    let purchase;
    try {
        purchase = await Purchase.findById(req.params.id);
        if (purchase == null) {
            return res.status(404).json({ message: 'Cannot find purchase' });
        }
    } catch (err) {
        return res.status(500).json({ message: "cannot find purchase" });
    }
    res.purchase = purchase;
    next();
}

// Listar pedidos: requiere login.
// Admin → todos. User → solo los propios. ProductDetail también lo usa
// para chequear si el caller compró un producto antes de poder reseñarlo.
router.get('/', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.auth.payload.sub;
        const caller  = await User.findOne({ auth0Id });
        const filter  = caller?.role === 'admin' ? {} : { id_User: auth0Id };
        const purchases = await Purchase.find(filter);
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Una compra puntual: admin o dueño
router.get('/:id', checkJwt, getPurchase, async (req, res) => {
    try {
        const auth0Id = req.auth.payload.sub;
        const caller  = await User.findOne({ auth0Id });
        const isAdmin = caller?.role === 'admin';
        const isOwner = res.purchase.id_User === auth0Id;
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.send(res.purchase);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Crear pedido: requiere login. id_User se fuerza desde el token para que nadie pueda hacerse compras a nombre de otro.
router.post('/', checkJwt, async (req, res) => {
    const auth0Id = req.auth.payload.sub;
    const purchase = new Purchase({
        id_Product:      req.body.id_Product,
        id_Category:     req.body.id_Category,
        id_User:         auth0Id,
        totalPrice:      req.body.totalPrice,
        status:          req.body.status,
        shippingAddress: req.body.shippingAddress,
        fullName:        req.body.fullName,
        phone:           req.body.phone,
        quantity:        req.body.quantity,
        description:     req.body.description
    });
    try {
        const newPurchase = await purchase.save();
        res.status(201).json(newPurchase);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Cambiar estado / editar pedido: sólo admin
router.patch('/:id', checkJwt, requireAdmin, getPurchase, async (req, res) => {
    if (req.body.id_Product      != null) res.purchase.id_Product      = req.body.id_Product;
    if (req.body.id_Category     != null) res.purchase.id_Category     = req.body.id_Category;
    if (req.body.id_User         != null) res.purchase.id_User         = req.body.id_User;
    if (req.body.totalPrice      != null) res.purchase.totalPrice      = req.body.totalPrice;
    if (req.body.status          != null) res.purchase.status          = req.body.status;
    if (req.body.shippingAddress != null) res.purchase.shippingAddress = req.body.shippingAddress;
    if (req.body.description     != null) res.purchase.description     = req.body.description;
    try {
        const updatedPurchase = await res.purchase.save();
        res.json(updatedPurchase);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Borrar pedido: sólo admin
router.delete('/:id', checkJwt, requireAdmin, getPurchase, async (req, res) => {
    try {
        await res.purchase.deleteOne();
        res.json({ message: "Purchase Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

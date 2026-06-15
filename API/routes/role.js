const express = require('express');
const router = express.Router();
const Rol = require('../models/rolModel');
const { checkJwt, requireAdmin } = require('../middleware/auth');

const getRol = async (req, res, next) => {
    let rol;
    try {
        rol = await Rol.findById(req.params.id);
        if (rol == null) {
            return res.status(404).json({ message: 'Cannot find rol' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.rol = rol;
    next();
}

// Toda la gestión de roles es sólo admin
router.get('/', checkJwt, requireAdmin, async (req, res) => {
    try {
        const rol = await Rol.find();
        res.json(rol);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', checkJwt, requireAdmin, getRol, (req, res) => {
    res.send(res.rol);
});

router.post('/', checkJwt, requireAdmin, async (req, res) => {
    const rol = new Rol({
        name: req.body.name,
        description: req.body.description
    });
    try {
        const newRol = await rol.save();
        res.status(201).json(newRol);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id', checkJwt, requireAdmin, getRol, async (req, res) => {
    if (req.body.name != null) res.rol.name = req.body.name;
    if (req.body.description != null) res.rol.description = req.body.description;
    try {
        const updatedRol = await res.rol.save();
        res.json(updatedRol);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', checkJwt, requireAdmin, getRol, async (req, res) => {
    try {
        await res.rol.deleteOne();
        res.json({ message: "Rol Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

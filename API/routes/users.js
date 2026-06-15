const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { requireAdmin } = require('../middleware/auth');

// Las rutas de /users montadas con checkJwt en server.js,
// req.auth.payload.sub está disponible en todos los handlers.

// middleware para encontrar las cosas por el ID
const getUsuarios = async (req, res, next) => {
    let users;
    try {
        users = await User.findById(req.params.id);
        if (users == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
    } catch (err) {
        return res.status(500).json({ message: "cannot find user" });
    }
    res.users = users;
    next();
}

// Sólo admin puede listar todos los usuarios
router.get('/', requireAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// (usado por AdminRoute / useUserRole para leer el rol propio).
router.get('/:id', getUsuarios, (req, res) => {
    res.send(res.users);
});

// Crear usuario
router.post('/', requireAdmin, async (req, res) => {
    const user = new User({
        auth0Id: req.body.auth0Id,
        name:    req.body.name,
        email:   req.body.email,
        role:    req.body.role
    });
    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Editar usuario
router.patch('/:id', getUsuarios, async (req, res) => {
    try {
        const callerSub = req.auth.payload.sub;
        const caller    = await User.findOne({ auth0Id: callerSub });
        const isAdmin   = caller?.role === 'admin';
        const isSelf    = res.users.auth0Id === callerSub;

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (req.body.role != null && !isAdmin) {
            return res.status(403).json({ message: 'Only admins can change roles' });
        }

        if (req.body.name  != null) res.users.name  = req.body.name;
        if (req.body.email != null) res.users.email = req.body.email;
        if (req.body.role  != null) res.users.role  = req.body.role;

        const updatedUser = await res.users.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Eliminar usuario
router.delete('/:id', requireAdmin, getUsuarios, async (req, res) => {
    try {
        await res.users.deleteOne();
        res.json({ message: "User Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

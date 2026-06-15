const express = require('express');
const router = express.Router();
const Category = require('../models/categoryModel');
const { checkJwt, requireAdmin } = require('../middleware/auth');

const getCategory = async (req, res, next) => {
    let category;
    try {
        category = await Category.findById(req.params.id);
        if (category == null) {
            return res.status(404).json({ message: 'Cannot find category' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.category = category;
    next();
}

// mostrar categorías sin login
router.get('/', async (req, res) => {
    try {
        const category = await Category.find();
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', getCategory, (req, res) => {
    res.send(res.category);
});

// sólo admin
router.post('/', checkJwt, requireAdmin, async (req, res) => {
    const category = new Category({
        name: req.body.name,
        description: req.body.description
    });
    try {
        const existingCategory = await Category.findOne({ name: req.body.name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id', checkJwt, requireAdmin, getCategory, async (req, res) => {
    if (req.body.name != null) res.category.name = req.body.name;
    if (req.body.description != null) res.category.description = req.body.description;
    try {
        const updatedCategory = await res.category.save();
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', checkJwt, requireAdmin, getCategory, async (req, res) => {
    try {
        await res.category.deleteOne();
        res.json({ message: "Category Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

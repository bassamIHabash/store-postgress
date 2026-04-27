"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_1 = require("../models/product");
const auth_1 = require("../middleware/auth");
const store = new product_1.ProductStore();
const router = (0, express_1.Router)();
// GET /products
router.get('/', async (_req, res) => {
    try {
        res.json(await store.index());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /products/top  ← must come before /:id
router.get('/top', async (_req, res) => {
    try {
        res.json(await store.topFive());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await store.show(parseInt(req.params.id));
        if (!product)
            return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /products  [token required]
router.post('/', auth_1.verifyToken, async (req, res) => {
    try {
        const { name, price, category } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ error: 'name and price are required' });
        }
        res.status(201).json(await store.create({ name, price, category }));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;

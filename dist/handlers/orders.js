"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_1 = require("../models/order");
const auth_1 = require("../middleware/auth");
const store = new order_1.OrderStore();
const router = (0, express_1.Router)();
// GET /orders/current/:userId  [token required]
router.get('/current/:userId', auth_1.verifyToken, async (req, res) => {
    try {
        const order = await store.currentByUser(parseInt(req.params.userId));
        if (!order)
            return res.status(404).json({ error: 'No active order found' });
        res.json(order);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /orders/completed/:userId  [token required]
router.get('/completed/:userId', auth_1.verifyToken, async (req, res) => {
    try {
        res.json(await store.completedByUser(parseInt(req.params.userId)));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /orders  [token required]
router.post('/', auth_1.verifyToken, async (req, res) => {
    try {
        const { user_id, status } = req.body;
        if (!user_id || !status) {
            return res.status(400).json({ error: 'user_id and status are required' });
        }
        res.status(201).json(await store.create({ user_id, status }));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /orders/:orderId/products  [token required]
router.post('/:orderId/products', auth_1.verifyToken, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        if (!product_id || !quantity) {
            return res.status(400).json({ error: 'product_id and quantity are required' });
        }
        res.status(201).json(await store.addProduct({
            order_id: parseInt(req.params.orderId),
            product_id,
            quantity,
        }));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;

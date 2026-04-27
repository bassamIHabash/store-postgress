"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
const auth_1 = require("../middleware/auth");
const store = new user_1.UserStore();
const router = (0, express_1.Router)();
// POST /users/signup — create account & return JWT
router.post('/signup', async (req, res) => {
    try {
        const { first_name, last_name, password } = req.body;
        if (!first_name || !last_name || !password) {
            return res.status(400).json({ error: 'first_name, last_name, and password are required' });
        }
        const user = await store.create({ first_name, last_name, password });
        const token = jsonwebtoken_1.default.sign({ user }, process.env.TOKEN_SECRET);
        res.status(201).json({ user, token });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /users/signin — authenticate & return JWT
router.post('/signin', async (req, res) => {
    try {
        const { first_name, password } = req.body;
        if (!first_name || !password) {
            return res.status(400).json({ error: 'first_name and password are required' });
        }
        const user = await store.authenticate(first_name, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ user }, process.env.TOKEN_SECRET);
        res.json({ user, token });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /users  [token required]
router.get('/', auth_1.verifyToken, async (_req, res) => {
    try {
        res.json(await store.index());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /users/:id  [token required]
router.get('/:id', auth_1.verifyToken, async (req, res) => {
    try {
        const user = await store.show(parseInt(req.params.id));
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;

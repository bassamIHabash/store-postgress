"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStore = void 0;
const database_1 = __importDefault(require("../database"));
class OrderStore {
    /** GET /orders/current/:userId — current (active) order for a user */
    async currentByUser(userId) {
        const conn = await database_1.default.connect();
        const orderResult = await conn.query(`SELECT * FROM orders
       WHERE user_id = $1 AND status = 'active'
       ORDER BY id DESC
       LIMIT 1`, [userId]);
        const order = orderResult.rows[0];
        if (!order || !order.id) {
            conn.release();
            return { ...order, products: [] };
        }
        const productsResult = await conn.query('SELECT * FROM order_products WHERE order_id = $1', [order.id]);
        conn.release();
        return { ...order, products: productsResult.rows };
    }
    /** GET /orders/completed/:userId — all completed orders for a user */
    async completedByUser(userId) {
        const conn = await database_1.default.connect();
        const result = await conn.query(`SELECT * FROM orders
       WHERE user_id = $1 AND status = 'complete'`, [userId]);
        conn.release();
        return result.rows;
    }
    /** POST /orders — create a new order */
    async create(o) {
        const conn = await database_1.default.connect();
        const result = await conn.query(`INSERT INTO orders (user_id, status)
       VALUES ($1, $2)
       RETURNING *`, [o.user_id, o.status]);
        conn.release();
        return result.rows[0];
    }
    /** POST /orders/:orderId/products — add a product to an order */
    async addProduct(op) {
        const conn = await database_1.default.connect();
        const result = await conn.query(`INSERT INTO order_products (order_id, product_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`, [op.order_id, op.product_id, op.quantity]);
        conn.release();
        return result.rows[0];
    }
}
exports.OrderStore = OrderStore;

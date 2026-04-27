"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStore = void 0;
const database_1 = __importDefault(require("../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const pepper = process.env.BCRYPT_PASSWORD;
const saltRounds = parseInt(process.env.SALT_ROUNDS);
class UserStore {
    /** Return all users — password excluded */
    async index() {
        const conn = await database_1.default.connect();
        const result = await conn.query('SELECT id, first_name, last_name FROM users');
        conn.release();
        return result.rows;
    }
    /** Return one user by id — password excluded */
    async show(id) {
        const conn = await database_1.default.connect();
        const result = await conn.query('SELECT id, first_name, last_name FROM users WHERE id = $1', [id]);
        conn.release();
        return result.rows[0];
    }
    /**
     * Sign-up: hash the password then insert.
     * Returns the created user (no password).
     */
    async create(u) {
        const hash = bcrypt_1.default.hashSync(u.password + pepper, saltRounds);
        const conn = await database_1.default.connect();
        const result = await conn.query(`INSERT INTO users (first_name, last_name, password)
       VALUES ($1, $2, $3)
       RETURNING id, first_name, last_name`, [u.first_name, u.last_name, hash]);
        conn.release();
        return result.rows[0];
    }
    /**
     * Sign-in: compare provided password against stored hash.
     * Returns the user row on success, null on failure.
     */
    async authenticate(first_name, password) {
        const conn = await database_1.default.connect();
        const result = await conn.query('SELECT * FROM users WHERE first_name = $1', [first_name]);
        conn.release();
        if (!result.rows.length)
            return null;
        const user = result.rows[0];
        const valid = bcrypt_1.default.compareSync(password + pepper, user.password);
        if (!valid)
            return null;
        // Return without the hashed password
        const { password: _p, ...safe } = user;
        return safe;
    }
}
exports.UserStore = UserStore;

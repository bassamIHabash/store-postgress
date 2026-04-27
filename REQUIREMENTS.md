# API Requirements
The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application. 

## API Endpoints

#### Products
- **Index**: `/products` [GET]
- **Show**: `/products/:id` [GET]
- **Create**: `/products` [POST] [Token Required]
- **Top 5 most popular products**: `/products/top` [GET]
- **Products by category**: `/products?category=:category` [GET]

#### Users
- **Index**: `/users` [GET] [Token Required]
- **Show**: `/users/:id` [GET] [Token Required]
- **Create (Signup)**: `/users/signup` [POST]
- **Authenticate (Signin)**: `/users/signin` [POST]

#### Orders
- **Current Order by user**: `/orders/current/:userId` [GET] [Token Required]
- **Completed Orders by user**: `/orders/completed/:userId` [GET] [Token Required]
- **Create Order**: `/orders` [POST] [Token Required]
- **Add Product to Order**: `/orders/:id/products` [POST] [Token Required]

## Data Shapes

#### Product
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `price` (NUMERIC)
- `category` (VARCHAR)

#### User
- `id` (SERIAL PRIMARY KEY)
- `firstName` (VARCHAR)
- `lastName` (VARCHAR)
- `password` (VARCHAR - Hashed with Bcrypt)

#### Orders
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER - Foreign Key to Users table)
- `status` (VARCHAR - 'active' or 'complete')

#### Order Products (Join Table)
- `id` (SERIAL PRIMARY KEY)
- `order_id` (INTEGER - Foreign Key to Orders table)
- `product_id` (INTEGER - Foreign Key to Products table)
- `quantity` (INTEGER)

## Database Schema

### Table: `users`
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | `PRIMARY KEY` |
| `first_name` | `VARCHAR(100)` | `NOT NULL` |
| `last_name` | `VARCHAR(100)` | `NOT NULL` |
| `password` | `VARCHAR(255)` | `NOT NULL` |

### Table: `products`
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | `PRIMARY KEY` |
| `name` | `VARCHAR(200)` | `NOT NULL` |
| `price` | `NUMERIC(10,2)` | `NOT NULL` |
| `category` | `VARCHAR(100)` | |

### Table: `orders`
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | `PRIMARY KEY` |
| `user_id` | `INTEGER` | `REFERENCES users(id)` |
| `status` | `VARCHAR(10)` | `CHECK (status IN ('active', 'complete'))` |

### Table: `order_products`
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | `PRIMARY KEY` |
| `order_id` | `INTEGER` | `REFERENCES orders(id)` |
| `product_id` | `INTEGER` | `REFERENCES products(id)` |
| `quantity` | `INTEGER` | `NOT NULL` |


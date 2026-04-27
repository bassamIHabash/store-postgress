#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-migrations.sh
# Creates the db-migrate configuration and all migration files, then runs them.
# Usage:  bash setup-migrations.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── 1. database.json ─────────────────────────────────────────────────────────
echo "▶ Creating database.json …"
cat > "$ROOT_DIR/database.json" <<'EOF'
{
  "dev": {
    "driver":   "pg",
    "host":     "127.0.0.1",
    "port":     "5432",
    "database": "storefront",
    "user":     "postgres",
    "password": "password"
  },
  "test": {
    "driver":   "pg",
    "host":     "127.0.0.1",
    "port":     "5432",
    "database": "storefront_test",
    "user":     "postgres",
    "password": "password"
  }
}
EOF

# ── 2. Directory structure ────────────────────────────────────────────────────
echo "▶ Creating migrations/ directory structure …"
mkdir -p "$ROOT_DIR/migrations/sqls"

# ── Helper: write a JS migration wrapper ─────────────────────────────────────
write_migration_js() {
  local FILE="$1"   # full path to the .js file
  local SLUG="$2"   # timestamp-slug, e.g. 20260427000001-create-users

  cat > "$FILE" <<JSEOF
'use strict';

var dbm;
var type;
var seed;
var fs      = require('fs');
var path    = require('path');
var Promise;

exports.setup = function (options, seedLink) {
  dbm     = options.dbmigrate;
  type    = dbm.dataType;
  seed    = seedLink;
  Promise = options.Promise;
};

exports.up = function (db) {
  var filePath = path.join(__dirname, 'sqls', '${SLUG}-up.sql');
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  }).then(function (data) {
    return db.runSql(data);
  });
};

exports.down = function (db) {
  var filePath = path.join(__dirname, 'sqls', '${SLUG}-down.sql');
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  }).then(function (data) {
    return db.runSql(data);
  });
};

exports._meta = { version: 1 };
JSEOF
}

# ── 3. Migration 1 – users ────────────────────────────────────────────────────
SLUG1="20260427000001-create-users"
echo "▶ Creating migration: $SLUG1 …"

write_migration_js "$ROOT_DIR/migrations/${SLUG1}.js" "$SLUG1"

cat > "$ROOT_DIR/migrations/sqls/${SLUG1}-up.sql" <<'EOF'
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL       PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  password   VARCHAR(255) NOT NULL
);
EOF

cat > "$ROOT_DIR/migrations/sqls/${SLUG1}-down.sql" <<'EOF'
DROP TABLE IF EXISTS users;
EOF

# ── 4. Migration 2 – products ─────────────────────────────────────────────────
SLUG2="20260427000002-create-products"
echo "▶ Creating migration: $SLUG2 …"

write_migration_js "$ROOT_DIR/migrations/${SLUG2}.js" "$SLUG2"

cat > "$ROOT_DIR/migrations/sqls/${SLUG2}-up.sql" <<'EOF'
CREATE TABLE IF NOT EXISTS products (
  id       SERIAL         PRIMARY KEY,
  name     VARCHAR(200)   NOT NULL,
  price    NUMERIC(10, 2) NOT NULL,
  category VARCHAR(100)
);
EOF

cat > "$ROOT_DIR/migrations/sqls/${SLUG2}-down.sql" <<'EOF'
DROP TABLE IF EXISTS products;
EOF

# ── 5. Migration 3 – orders & order_products ──────────────────────────────────
SLUG3="20260427000003-create-orders"
echo "▶ Creating migration: $SLUG3 …"

write_migration_js "$ROOT_DIR/migrations/${SLUG3}.js" "$SLUG3"

cat > "$ROOT_DIR/migrations/sqls/${SLUG3}-up.sql" <<'EOF'
CREATE TABLE IF NOT EXISTS orders (
  id      SERIAL      PRIMARY KEY,
  user_id INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status  VARCHAR(10) NOT NULL CHECK (status IN ('active', 'complete'))
);

CREATE TABLE IF NOT EXISTS order_products (
  id         SERIAL  PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL CHECK (quantity > 0)
);
EOF

cat > "$ROOT_DIR/migrations/sqls/${SLUG3}-down.sql" <<'EOF'
DROP TABLE IF EXISTS order_products;
DROP TABLE IF EXISTS orders;
EOF

# ── 6. Run migrations ─────────────────────────────────────────────────────────
echo ""
echo "▶ Running db-migrate up …"
cd "$ROOT_DIR"
npx db-migrate up

echo ""
echo "✅  All tables created successfully!"

-- =====================================================================
-- E-Commerce Catalog Schema (MySQL)
-- Designed for: fast search/filtering, category trees, pagination,
-- cart & wishlist per user.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS ecommerce_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ecommerce_db;

-- ---------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- CATEGORIES (self-referencing tree: category -> subcategory -> ...)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(140) NOT NULL UNIQUE,
  parent_id   BIGINT UNSIGNED NULL,
  description VARCHAR(500) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_category_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id)
    ON DELETE SET NULL,
  INDEX idx_categories_parent (parent_id),
  INDEX idx_categories_slug (slug)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- BRANDS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brands (
  id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(120) NOT NULL UNIQUE,
  slug  VARCHAR(140) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku             VARCHAR(64) NOT NULL UNIQUE,
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(220) NOT NULL UNIQUE,
  description     TEXT NULL,
  category_id     BIGINT UNSIGNED NOT NULL,
  brand_id        BIGINT UNSIGNED NULL,
  price           DECIMAL(10,2) NOT NULL,
  discount_price  DECIMAL(10,2) NULL,
  stock_quantity  INT UNSIGNED NOT NULL DEFAULT 0,
  rating_avg      DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  rating_count    INT UNSIGNED NOT NULL DEFAULT 0,
  thumbnail_url   VARCHAR(500) NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_product_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_product_brand
    FOREIGN KEY (brand_id) REFERENCES brands(id)
    ON DELETE SET NULL,

  -- Indexes for search, filtering & sorting performance
  INDEX idx_products_category (category_id),
  INDEX idx_products_brand (brand_id),
  INDEX idx_products_price (price),
  INDEX idx_products_rating (rating_avg),
  INDEX idx_products_active_category (is_active, category_id),
  FULLTEXT INDEX ft_products_name_desc (name, description)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PRODUCT IMAGES (gallery, one-to-many)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  BIGINT UNSIGNED NOT NULL,
  image_url   VARCHAR(500) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_image_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE,
  INDEX idx_images_product (product_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PRODUCT ATTRIBUTES (key-value for flexible filtering, e.g. color, size, RAM)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_attributes (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id   BIGINT UNSIGNED NOT NULL,
  attr_name    VARCHAR(80) NOT NULL,
  attr_value   VARCHAR(200) NOT NULL,
  CONSTRAINT fk_attr_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE,
  INDEX idx_attr_product (product_id),
  INDEX idx_attr_name_value (attr_name, attr_value)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- CART
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  product_id  BIGINT UNSIGNED NOT NULL,
  quantity    INT UNSIGNED NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_product_cart (user_id, product_id),
  INDEX idx_cart_user (user_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- WISHLIST
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist_items (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  product_id  BIGINT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_product_wishlist (user_id, product_id),
  INDEX idx_wishlist_user (user_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ORDERS (basic structure to round out the catalog -> checkout flow)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  status        ENUM('pending','paid','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  total_amount  DECIMAL(10,2) NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_orders_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id    BIGINT UNSIGNED NOT NULL,
  product_id  BIGINT UNSIGNED NOT NULL,
  quantity    INT UNSIGNED NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_orderitems_order (order_id)
) ENGINE=InnoDB;

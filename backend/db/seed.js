/**
 * Seeds the database with sample categories, brands, and products
 * Usage: npm run seed
 */
const { pool } = require('../config/db');

async function seed() {
  const conn = await pool.getConnection();

  try {
    console.log('Seeding categories...');

    await conn.query(`
      INSERT INTO categories (name, slug, parent_id, description) VALUES
      ('Electronics', 'electronics', NULL, 'Phones, laptops, gadgets'),
      ('Fashion', 'fashion', NULL, 'Clothing and accessories'),
      ('Home & Kitchen', 'home-kitchen', NULL, 'Furniture, appliances, decor')
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    const [cats] = await conn.query(`SELECT id, slug FROM categories`);
    const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

    await conn.query(`
      INSERT INTO categories (name, slug, parent_id, description) VALUES
      ('Smartphones', 'smartphones', ${catMap['electronics']}, 'Mobile phones'),
      ('Laptops', 'laptops', ${catMap['electronics']}, 'Laptops and notebooks'),
      ('Men''s Clothing', 'mens-clothing', ${catMap['fashion']}, 'Apparel for men'),
      ('Women''s Clothing', 'womens-clothing', ${catMap['fashion']}, 'Apparel for women')
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    console.log('Seeding brands...');

    await conn.query(`
      INSERT INTO brands (name, slug) VALUES
      ('Apple', 'apple'),
      ('Samsung', 'samsung'),
      ('Sony', 'sony'),
      ('Nike', 'nike'),
      ('Generic', 'generic')
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    const [brands] = await conn.query(`SELECT id, slug FROM brands`);
    const brandMap = Object.fromEntries(brands.map(b => [b.slug, b.id]));

    const [allCats] = await conn.query(`SELECT id, slug FROM categories`);
    const allCatMap = Object.fromEntries(allCats.map(c => [c.slug, c.id]));

    console.log('Seeding products...');

    const products = [
      [
        'IPH15-128',
        'iPhone 15 (128GB)',
        'iphone-15-128gb',
        'Apple iPhone 15 with A16 chip and 128GB storage.',
        allCatMap['smartphones'],
        brandMap['apple'],
        799.00,
        749.00,
        50,
        4.7,
        1200,
        '/images/products/iphone15.jpg'
      ],
      [
        'SGS24-256',
        'Samsung Galaxy S24 (256GB)',
        'samsung-galaxy-s24-256gb',
        'Samsung flagship phone with AMOLED display.',
        allCatMap['smartphones'],
        brandMap['samsung'],
        899.00,
        null,
        35,
        4.5,
        860,
        '/images/products/galaxys24.webp'
      ],
      [
        'MBA-M2',
        'MacBook Air M2',
        'macbook-air-m2',
        'Lightweight laptop with Apple M2 chip.',
        allCatMap['laptops'],
        brandMap['apple'],
        1199.00,
        1099.00,
        20,
        4.8,
        540,
        '/images/products/macbookair.jpg'
      ],
      [
        'SNYWH-1000',
        'Sony WH-1000XM5 Headphones',
        'sony-wh1000xm5',
        'Industry-leading noise cancelling headphones.',
        allCatMap['electronics'],
        brandMap['sony'],
        349.00,
        299.00,
        100,
        4.6,
        2300,
        '/images/products/sonywh1000.jpg'
      ],
      [
        'NIKE-AIRMAX',
        'Nike Air Max 270',
        'nike-air-max-270',
        'Comfortable running shoes for everyday wear.',
        allCatMap['mens-clothing'],
        brandMap['nike'],
        150.00,
        120.00,
        200,
        4.4,
        980,
        '/images/products/shoe3.jpg'
      ],
      [
        'WMN-DRESS-01',
        'Floral Summer Dress',
        'floral-summer-dress',
        'Lightweight floral dress, perfect for summer.',
        allCatMap['womens-clothing'],
        brandMap['generic'],
        45.00,
        null,
        150,
        4.2,
        320,
        '/images/products/clothes2.jpg'
      ],
      [
        'LAP-DELL-XPS',
        'Dell XPS 13',
        'dell-xps-13',
        'Compact ultrabook with InfinityEdge display.',
        allCatMap['laptops'],
        brandMap['generic'],
        999.00,
        949.00,
        25,
        4.5,
        410,
        '/images/products/dellxps13.webp'
      ],
      [
        'MEN-TSHIRT-01',
        'Classic Cotton T-Shirt',
        'classic-cotton-tshirt',
        '100% cotton crew-neck t-shirt.',
        allCatMap['mens-clothing'],
        brandMap['generic'],
        19.99,
        null,
        500,
        4.1,
        150,
        '/images/products/clothes5.jpg'
      ]
    ];

    for (const p of products) {
      await conn.query(
        `INSERT INTO products
        (sku, name, slug, description, category_id, brand_id, price, discount_price, stock_quantity, rating_avg, rating_count, thumbnail_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          thumbnail_url = VALUES(thumbnail_url)`,
        p
      );
    }

    console.log('✅ Seed complete.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
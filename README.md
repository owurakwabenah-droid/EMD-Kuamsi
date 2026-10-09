# EMD Secretary Desk

Inventory and Sales Management System for EMD Training Support.

## Features

- 📊 Real-time dashboard overview
- 📦 Inventory management with stock tracking
- 🛒 Sales and delivery tracking
- 💰 Profit analytics
- 💾 Persistent data storage (SQLite backend)
- 🌐 Single-page React application

## Setup & Installation

### Frontend (Single HTML File)

1. Open `index.html` in your browser, or serve it locally:
   ```bash
   python -m http.server 8080
   # or
   npx http-server
   ```

2. Visit `http://localhost:8080`

### Backend (Node.js + Express + SQLite)

1. Install Node.js (v18+)

2. Install dependencies:
   ```bash
   npm install express cors sqlite3
   ```

3. Create `server.js`:
   ```javascript
   const express = require('express');
   const sqlite3 = require('sqlite3').verbose();
   const cors = require('cors');

   const app = express();
   app.use(cors());
   app.use(express.json());

   const db = new sqlite3.Database('./emd.db');

   // Initialize database
   db.serialize(() => {
     db.run(\`CREATE TABLE IF NOT EXISTS products (
       id INTEGER PRIMARY KEY,
       name TEXT UNIQUE,
       retailPrice REAL,
       distributorPrice REAL,
       createdAt TEXT
     )\`);

     db.run(\`CREATE TABLE IF NOT EXISTS inventory (
       id INTEGER PRIMARY KEY,
       productId INTEGER UNIQUE,
       quantityOnHand INTEGER DEFAULT 0,
       FOREIGN KEY(productId) REFERENCES products(id)
     )\`);

     db.run(\`CREATE TABLE IF NOT EXISTS sales (
       id INTEGER PRIMARY KEY,
       customerName TEXT,
       productId INTEGER,
       amountPaid REAL,
       purchaseDate TEXT,
       deliveryStage TEXT,
       createdAt TEXT,
       FOREIGN KEY(productId) REFERENCES products(id)
     )\`);
   });

   // Products
   app.get('/api/products', (req, res) => {
     db.all('SELECT * FROM products', (err, rows) => {
       res.json(rows || []);
     });
   });

   app.post('/api/products', (req, res) => {
     const { name, retailPrice, distributorPrice } = req.body;
     db.run(
       'INSERT INTO products (name, retailPrice, distributorPrice, createdAt) VALUES (?, ?, ?, ?)',
       [name, retailPrice, distributorPrice, new Date().toISOString()],
       function(err) {
         if (err) return res.status(400).json({ error: err.message });
         db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, row) => {
           db.run('INSERT INTO inventory (productId, quantityOnHand) VALUES (?, 0)', [this.lastID]);
           res.json(row);
         });
       }
     );
   });

   // Inventory
   app.get('/api/inventory', (req, res) => {
     db.all('SELECT * FROM inventory', (err, rows) => {
       res.json(rows || []);
     });
   });

   app.put('/api/inventory/:productId', (req, res) => {
     const { quantityOnHand } = req.body;
     db.run(
       'UPDATE inventory SET quantityOnHand = ? WHERE productId = ?',
       [quantityOnHand, req.params.productId],
       function(err) {
         if (err) return res.status(400).json({ error: err.message });
         db.get('SELECT * FROM inventory WHERE productId = ?', [req.params.productId], (err, row) => {
           res.json(row);
         });
       }
     );
   });

   // Sales
   app.get('/api/sales', (req, res) => {
     db.all('SELECT * FROM sales ORDER BY createdAt DESC', (err, rows) => {
       res.json(rows || []);
     });
   });

   app.post('/api/sales', (req, res) => {
     const { customerName, productId, amountPaid, purchaseDate, deliveryStage } = req.body;
     db.run(
       'INSERT INTO sales (customerName, productId, amountPaid, purchaseDate, deliveryStage, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
       [customerName, productId, amountPaid, purchaseDate, deliveryStage, new Date().toISOString()],
       function(err) {
         if (err) return res.status(400).json({ error: err.message });
         db.get('SELECT * FROM sales WHERE id = ?', [this.lastID], (err, row) => {
           res.json(row);
         });
       }
     );
   });

   app.listen(8000, () => console.log('Server running on http://localhost:8000'));
   ```

4. Run the server:
   ```bash
   node server.js
   ```

## Architecture

- **Frontend**: Single-page React app in `index.html`
- **Backend**: Node.js/Express REST API on `localhost:8000`
- **Database**: SQLite (`emd.db`) - stored locally, fully persistent
- **Communication**: Fetch API with CORS support

## Data Persistence

All data is stored in a local SQLite database (`emd.db`) which:
- Persists across server restarts
- Supports unlimited records
- Is located in the project root directory
- Can be backed up as a single file

## API Endpoints

```
GET    /api/products
POST   /api/products
GET    /api/inventory
PUT    /api/inventory/:productId
GET    /api/sales
POST   /api/sales
```

## Deployment Notes

- **Local Development**: Run both frontend and backend on localhost
- **GitHub Pages**: Frontend can be deployed to GitHub Pages; backend must run on a separate server (Vercel, Heroku, AWS, etc.)
- **Production**: Use a production database hosting solution and deploy backend to a cloud service

## License

MIT

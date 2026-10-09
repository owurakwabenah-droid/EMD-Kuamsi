# EMD Secretary Desk

**Inventory & Sales Management System for EMD Training Support**

A full-stack web application for managing products, inventory, and sales with real-time multi-user access and persistent data storage.

## 🎯 Features

- 📊 Real-time dashboard overview
- 📦 Inventory management with stock tracking
- 🛒 Sales and delivery tracking  
- 💰 Profit analytics
- 👥 Multi-user access from anywhere
- 💾 Persistent Postgres database
- 🌐 Public internet access

## 🚀 Quick Start

### Live Deployment

The app is ready to deploy to Vercel + Postgres. See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup steps.

### Local Development

```bash
# Install dependencies
npm install

# Set environment variable
export POSTGRES_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Run Vercel dev server
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
EMD-Kuamsi/
├── index.html              # Frontend React SPA
├── api/
│   ├── health.js           # Health check endpoint
│   ├── products.js         # Product CRUD endpoints
│   ├── inventory.js        # Inventory endpoints
│   └── sales.js            # Sales endpoints
├── package.json            # Node dependencies
├── vercel.json             # Vercel configuration
├── .env.example            # Environment template
└── DEPLOYMENT.md           # Deployment guide
```

## 🏗️ Architecture

**Frontend**: Single-page React app  
**Backend**: Vercel serverless API routes  
**Database**: Postgres (Neon, Supabase, Railway)  
**Hosting**: Vercel  
**Code**: GitHub  

All users access the same live backend and database.

## 📦 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| GET | `/api/inventory` | List inventory |
| PUT | `/api/inventory` | Update stock |
| GET | `/api/sales` | List sales |
| POST | `/api/sales` | Record sale |
| GET | `/api/health` | Health check |

## 🔧 Environment Variables

Required in Vercel:

```
POSTGRES_URL=postgresql://user:password@host/dbname?sslmode=require
```

## 📖 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Neon Postgres setup
- Vercel deployment
- Environment configuration
- Testing steps
- Troubleshooting

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS
- **Backend**: Vercel serverless functions
- **Database**: Postgres (via Neon)
- **Hosting**: Vercel
- **Version control**: GitHub

## 📝 License

MIT

## 👥 Support

For deployment issues, check:
1. `POSTGRES_URL` is set in Vercel environment
2. Neon database is active
3. Vercel logs show no errors
4. Database schema exists (auto-created on first API call)

---

**Ready to deploy? Follow [DEPLOYMENT.md](./DEPLOYMENT.md)** 🚀

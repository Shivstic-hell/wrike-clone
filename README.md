# Wrike Clone - Project Management Platform

A full-stack project management application inspired by Wrike, built with NestJS, React, and Supabase.

## 🚀 Features

- **Multi-tenant Architecture** with Row-Level Security (RLS)
- **Workspaces & Projects** with hierarchical folder structure
- **Task Management** with dependencies, assignees, and custom fields
- **Real-time Collaboration** with comments and notifications
- **Kanban & Table Views** for task visualization
- **Approval Workflows** with multi-step chains
- **Automation Rules** with event-driven actions
- **Time Tracking** with billable hours
- **Webhooks** for external integrations
- **RBAC** (Role-Based Access Control)

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **PostgreSQL** (Supabase) - Database with RLS
- **Knex.js** - SQL query builder
- **JWT** - Authentication
- **Zod** - Schema validation
- **BullMQ** - Job queue (optional)

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Data fetching
- **React Router** - Navigation
- **Zustand** - State management

### Shared
- **Monorepo** with workspace packages
- **Shared types & validation schemas**
- **TypeScript** throughout

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Supabase account** (for database)
- **Git**

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/wrike-clone.git
cd wrike-clone
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and update with your Supabase credentials:

```bash
cp .env.example .env
```

Update the following in `.env`:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
DB_SSL=true
DB_MAX_CONNECTIONS=10

# Auth
JWT_SECRET=your-secret-key-change-in-production
ENCRYPTION_KEY=your-64-char-hex-encryption-key

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Set up the database

Run the schema in Supabase SQL Editor:

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `packages/backend/src/database/schema.sql`
4. Click **Run**

Alternatively, if you have `psql` installed:

```bash
cd packages/backend
npx knex migrate:latest --knexfile src/database/knexfile.ts
```

### 5. Build the shared package

```bash
cd packages/shared
npm run build
cd ../..
```

### 6. Start the backend

```bash
cd packages/backend
npm run dev
```

Backend will run on http://localhost:4000

### 7. Start the frontend (in a new terminal)

```bash
cd packages/frontend
npm run dev
```

Frontend will run on http://localhost:5173

## 🌐 Deployment

### Deploy to Vercel (Frontend + Backend)

1. **Push to GitHub** (already done!)

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the monorepo structure

3. **Configure Environment Variables:**
   Add all variables from `.env` to Vercel project settings

4. **Deploy!**

The `vercel.json` file is already configured for both frontend and backend deployment.

### Backend API Endpoints

Once deployed, your API will be available at:
- **Development**: `http://localhost:4000/api/v1`
- **Production**: `https://your-domain.vercel.app/api/v1`

## 📚 API Documentation

### Health Check
- `GET /api/v1/health` - Health check endpoint

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/change-password` - Change password

### Resources
- `/api/v1/tenants` - Tenant management
- `/api/v1/workspaces` - Workspace CRUD
- `/api/v1/folders` - Folder hierarchy
- `/api/v1/projects` - Project management
- `/api/v1/tasks` - Task operations
- `/api/v1/notifications` - User notifications
- `/api/v1/automation` - Automation rules
- `/api/v1/approvals` - Approval workflows
- `/api/v1/time-entries` - Time tracking
- `/api/v1/webhooks` - Webhook configuration

## 🧪 Testing

```bash
# Backend tests
cd packages/backend
npm test

# Frontend tests
cd packages/frontend
npm test
```

## 📝 Project Structure

```
wrike-clone/
├── packages/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── auth/     # Authentication
│   │   │   ├── task/     # Task module
│   │   │   ├── project/  # Project module
│   │   │   └── ...
│   │   └── test/
│   ├── frontend/         # React app
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── api/
│   │   └── public/
│   └── shared/           # Shared types & schemas
│       └── src/
├── docker/               # Docker configs
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## 🔐 Security

- **JWT** authentication with refresh tokens
- **Row-Level Security (RLS)** in PostgreSQL
- **httpOnly cookies** for refresh tokens
- **CORS** protection
- **Rate limiting** (via NestJS Throttler)
- **Input validation** (Zod schemas)
- **SQL injection protection** (Knex parameterized queries)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by [Wrike](https://www.wrike.com/)
- Built with [NestJS](https://nestjs.com/)
- Database by [Supabase](https://supabase.com/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ by Your Team**

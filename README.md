# 🚀 Matching Core

**Matching Core** is a universal connection engine designed to match users and teams based on various strategies, including location, preferences, and skills. Built with a modern tech stack, it provides a scalable and robust solution for any platform needing matching capabilities.

---

## ✨ Key Features

- 🎯 **Universal Matching**: Supports User-to-User, User-to-Team, and Team-to-Team matching.
- 📍 **Distance-Based Strategy**: High-precision matching using the Haversine formula and PostGIS.
- 🧪 **Interactive Playground**: A step-by-step wizard to simulate and visualize matching results in real-time.
- 🔔 **Premium UI/UX**: Built with Next.js, featuring glassmorphism design, smooth animations, and sleek toast notifications.
- 🛠️ **Extensible Architecture**: Easily add new matching strategies (Skill, Preference, Hybrid) using a strategy pattern.
- ☁️ **Cloud Native**: Fully integrated with Supabase for real-time data and simplified backend management.

---

## 🛠 Tech Stack

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + PostGIS)
- **API Documentation**: [Swagger](https://swagger.io/)
- **Validation**: Class-validator & Class-transformer

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Notifications**: [Sonner](https://sonner.stevenly.com/)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase account and project

### 1. Database Setup
Execute the SQL scripts in your Supabase SQL Editor:
1. `work-plan/sql/01_create_tables.sql`
2. `work-plan/sql/02_seed_data.sql`

### 2. Backend Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
Run the backend:
```bash
cd backend
npm install
npm run start:dev
```

### 3. Frontend Configuration
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Run the frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 📖 API Documentation
Once the backend is running, visit:
`http://localhost:3001/api/docs`

---

## 🛣 Roadmap
- [x] Sprint 1: Core API & Playground Integration
- [ ] Sprint 2: Preference & Skill Strategies
- [ ] Sprint 3: Real-time Updates via Supabase Realtime
- [ ] Sprint 4: Performance Monitoring & Advanced Analytics

---

## 📄 License
This project is licensed under the MIT License.

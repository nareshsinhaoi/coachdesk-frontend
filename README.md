# CoachDesk Frontend

CoachDesk is a multi-tenant education management dashboard built with React, TypeScript, and Vite. This repository contains the frontend; application data and authentication are provided by the CoachDesk CodeIgniter 4 API.

## Features

- Dashboard and reporting
- Student admissions, profiles, and enrollment
- Courses, batches, and teacher management
- Attendance, fees, and exams
- Branch, user, profile, and institute settings
- Super-admin tenant, plan, subscription, support, and audit-log pages
- Protected routes and permission-based access

## Tech Stack

- React 18, TypeScript, and Vite
- React Router
- TanStack Query and Axios
- React Hook Form and Zod
- Tailwind CSS
- Zustand
- Recharts and Lucide icons

## Requirements

- Node.js and npm
- A running CoachDesk CodeIgniter 4 API

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the backend API. By default, the Vite development server proxies `/api` requests to `http://localhost:4002`.

3. Start the frontend:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173).

The frontend uses `/api/v1` as its default API base URL. To use a different API URL, create a `.env.local` file in the project root:

```dotenv
VITE_API_BASE_URL=http://localhost:4002/api/v1
```

Vite environment variables are included in the client bundle. Do not put secrets in `VITE_*` variables.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check the project and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format TypeScript, TSX, and CSS files under `src/` |

## Project Structure

```text
src/
├── api/          API clients and endpoint functions
├── components/   Shared UI, forms, and layout components
├── features/     Application pages grouped by feature
├── hooks/        Shared React hooks
├── layouts/      Authenticated and public layouts
├── lib/          Shared utilities and validators
├── routes/       Application routes and route guards
├── stores/       Client-side state stores
└── types/        Shared TypeScript types
```

## API Configuration

The API client reads `VITE_API_BASE_URL` and defaults to `/api/v1`. In development, Vite forwards requests beginning with `/api` to `http://localhost:4002`; this proxy target can be changed in `vite.config.ts`.

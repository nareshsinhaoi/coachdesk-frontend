# CoachDesk Frontend (React + Vite + TypeScript)

Frontend for CoachDesk SaaS — talks to the existing CodeIgniter 4 backend at
`http://localhost:4002/api/v1` through the Vite development proxy.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (default /api/v1 uses the Vite proxy)
# Set VITE_API_BASE_URL to the full API URL if the proxy is not appropriate

# 3. Start dev server
npm run dev
# → http://localhost:5173
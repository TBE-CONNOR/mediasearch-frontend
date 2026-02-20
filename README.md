# MediaSearch Web

React frontend for the MediaSearch file management and semantic search platform.

## Tech Stack

- React 19 + TypeScript 5.9
- Vite 7 (with SWC)
- Tailwind CSS v4
- React Router 7
- TanStack Query v5
- Zustand v5
- Amazon Cognito (authentication)
- Axios (API client)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment template and fill in values
cp .env.example .env

# Start dev server
npm run dev
```

## Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start Vite dev server              |
| `npm run build`    | Type-check and build for production|
| `npm run lint`     | Run ESLint                         |
| `npm run format`   | Format code with Prettier          |
| `npm run preview`  | Preview production build locally   |

## Project Structure

```
src/
  api/          # API client modules (axios, files, search, upload, subscription)
  auth/         # Cognito client, useAuth hook
  components/   # Shared components (NavBar, ErrorBoundary, QuotaError)
  config/       # AWS configuration
  pages/        # Route-level page components
  router/       # ProtectedRoute wrapper
  store/        # Zustand auth store
  utils/        # Shared utility functions
```

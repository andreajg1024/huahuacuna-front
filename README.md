
  # Huahuacuna Frontend

  This is a code bundle for Huahuacuna Frontend. The original project is available at https://www.figma.com/design/fSqR9c0uIGaVNQbZG0DaSd/Huahuacuna-Frontend.

  ## Running the code

  1. Install dependencies:
     - `npm install`

  2. Configure environment variables:
     - Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE_URL` to your backend base URL (e.g. `http://localhost:4000`).

  3. Development:
     - `npm run dev` (Next.js dev server, runs on port 3000 by default)

  4. Production build:
     - `npm run build`
     - `npm start` (serves the production build)

  ## 🔌 API Integration

  ### Backend Integration Status
  - ✅ **Create Child** endpoint implemented (`apadrinamiento_children_create`)
  - ⏳ Update Child endpoint (pending)
  - ⏳ Delete Child endpoint (pending)

  ### Documentation
  - **[API_IMPLEMENTATION.md](./API_IMPLEMENTATION.md)** - Quick start guide for API integration
  - **[INTEGRATION.md](./INTEGRATION.md)** - Detailed technical documentation

  ### Testing
  ```bash
  # Test API endpoint
  BACKEND_URL=http://localhost:4000 TOKEN=your-token node test-api.js
  ```

  ### Project Structure
  ```
  src/
  ├── lib/              # API client and utilities
  ├── types/            # TypeScript type definitions
  ├── services/         # API service layer
  ├── contexts/         # React contexts with API integration
  └── components/       # React components
  ```
  
# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Huahuacuna Frontend is a Next.js-based single-page application (SPA) for a child sponsorship and social impact organization. The project was generated from a Figma design and uses Next.js with TypeScript, React Context API for state management, and shadcn/ui components built on Radix UI primitives.

## Commands

### Development
```bash
npm install           # Install dependencies
npm run dev          # Start development server (runs on port 3000)
npm run build        # Create production build
npm start            # Serve production build
```

Note: There are no test, lint, or typecheck scripts defined in package.json. TypeScript checking happens at build time.

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:
- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL (e.g., `http://localhost:4000`)

The Next.js config includes API rewrites: requests to `/api/*` are proxied to the configured backend URL.

## Architecture

### Application Structure

This is a **hybrid Next.js + SPA architecture**:
- Next.js handles the build system and serves a single route (`pages/index.tsx`)
- All client-side routing and page logic lives in `src/App.tsx`
- The app uses a state-based navigation system (via `currentPage`) instead of Next.js routing
- The main app dynamically imports from `src/App.tsx` with `ssr: false`

### Key Directories

- **`pages/`**: Next.js entry point - contains only `_app.tsx`, `_document.tsx`, and `index.tsx`
- **`src/App.tsx`**: Main SPA router and navigation controller
- **`src/contexts/`**: React Context providers for global state
- **`src/components/`**: All React components organized by feature
- **`src/components/ui/`**: shadcn/ui component library (Radix UI + Tailwind)

### Component Organization

Components are organized by feature domain:
- **`auth/`**: Authentication pages (Login, Register, Password Recovery)
- **`dashboards/`**: Role-based dashboards (SuperAdmin, Admin, Padrino)
- **`sponsorship/`**: Child sponsorship features
- **`bitacora/`**: Child activity timeline and management
- **`projects/`**: Project management and volunteers
- **`volunteering/`**: Volunteer applications and management
- **`donations/`**: Donation tracking and management
- **`news/`**: News management
- **`reports/`**: Administrative and sponsorship reports
- **`admin/`**: Admin tools (user management, settings)
- **`profile/`**: User profile pages
- **`layouts/`**: Layout components (DashboardLayout)
- **`shared/`**: Shared/common components
- **`ui/`**: shadcn/ui design system components

### State Management

The app uses React Context API with 8 dedicated providers:
- **`AuthContext`**: User authentication, session management, role-based access
- **`SponsorshipContext`**: Child sponsorship data
- **`BitacoraContext`**: Child activity timeline
- **`ProjectsContext`**: Projects and project volunteers
- **`VolunteeringContext`**: Volunteer applications
- **`NewsContext`**: News articles
- **`DonationsContext`**: Donations tracking
- **`ReportsContext`**: Administrative reports

All contexts are wrapped in `src/App.tsx` and currently use **mock data** with localStorage persistence. They are designed to be easily replaced with real API calls.

### Navigation System

Navigation is handled via `currentPage` state in `App.tsx`:
- Use `onNavigate(pageName)` callback to change pages
- Page names: `'home'`, `'login'`, `'register'`, `'dashboard'`, `'profile'`, `'catalog'`, `'bitacora'`, etc.
- Role-based access control is enforced in the `renderDashboardContent()` function

### User Roles

Three role types defined in `AuthContext`:
- **`super_admin`**: Full system access
- **`admin`**: Limited admin capabilities with specific permissions array
- **`padrino`**: Sponsor/donor role with access to their sponsored children

### Mock Authentication

`AuthContext` includes a mock user database with test credentials:
- Super Admin: `admin@huahuacuna.org` / `Admin123`
- Admin: `maria@huahuacuna.org` / `Admin123`
- Padrino: `carlos@example.com` / `Padrino123`

Failed login attempts are tracked with temporary account blocking (15 minutes after 5 failed attempts).

## TypeScript Configuration

- Path alias `@/*` maps to `src/*`
- Strict mode enabled
- Module resolution: `bundler`
- Target: `ESNext`

## Styling

- **Tailwind CSS**: All styling via utility classes (configured in `src/index.css`)
- **shadcn/ui**: Pre-built components in `src/components/ui/`
- **Responsive**: Components use Tailwind responsive utilities
- **Dark mode**: Supported via `next-themes` (ThemeProvider)

## Important Implementation Notes

### Adding New Pages
1. Add the page component to the appropriate feature directory
2. Import it in `src/App.tsx`
3. Add a case in the `renderDashboardContent()` switch statement or top-level conditionals
4. Implement role-based access control if needed

### Modifying Context Providers
- All contexts follow the same pattern: Provider component, custom hook, mock data
- To integrate with backend: Replace mock data operations with API calls
- Keep the same interface to avoid breaking existing components

### Working with shadcn/ui Components
- Import from `@/components/ui/*`
- Components are Radix UI primitives styled with Tailwind via `class-variance-authority`
- Utility function `cn()` in `src/components/ui/utils.ts` merges Tailwind classes

### API Integration
When replacing mock data with real API:
- Backend URL is configured via `NEXT_PUBLIC_API_BASE_URL`
- API proxy rewrites `/api/*` to backend
- Update context providers to use `fetch()` or API client
- Maintain existing Context interfaces for backward compatibility

## Design System

Based on Figma design (https://www.figma.com/design/fSqR9c0uIGaVNQbZG0DaSd/Huahuacuna-Frontend) and uses:
- shadcn/ui components (MIT license)
- Unsplash photos (Unsplash license)
- Lucide React icons

## Known Limitations

- No test suite configured
- No linting/formatting scripts defined
- No CI/CD configuration
- All data is currently mocked (no real backend integration)
- Client-side only routing (doesn't leverage Next.js router)

# AI_RULES.md

## Tech Stack Overview

- **Framework**: Next.js 14 (App Router) with React 19
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS 3.4 with custom brand color palette and font variables
- **Fonts**: Google Fonts via `next/font` (Inter for sans-serif, Playfair Display for serif)
- **Icons**: lucide-react for all iconography
- **Utilities**: clsx and tailwind-merge for conditional class handling
- **Build Tool**: Vite (development) / Next.js (production)
- **Path Aliases**: `@/*` maps to the project root

---

## Project Structure Rules

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages, layouts, and global styles |
| `components/` | Reusable React components |
| `lib/` | Shared utilities, constants, and TypeScript types |

---

## Library Usage Rules

### Styling
- **ALWAYS** use Tailwind CSS utility classes for styling
- **NEVER** use inline styles or CSS modules
- Use the custom `brand-*` color palette defined in `tailwind.config.js` for brand consistency
- Use `font-sans` (Inter) for body text and `font-serif` (Playfair Display) for headings

### Icons
- **ALWAYS** use `lucide-react` for icons
- **NEVER** install or use other icon libraries (e.g., react-icons, heroicons)

### Class Name Utilities
- Use `clsx` for conditional class names
- Use `tailwind-merge` when merging Tailwind classes to avoid conflicts

### Components
- Keep components in `components/` directory
- Use TypeScript interfaces/types from `lib/types.ts`
- Use constants from `lib/constants.ts`

### SEO & Metadata
- Use Next.js `Metadata` API in `layout.tsx` for static metadata
- Use `JsonLd` component for structured data (Schema.org)
- Use `SEO` component for dynamic client-side meta updates

### Routing & Navigation
- Use Next.js App Router conventions
- For client-side navigation within the same page, use React state (as shown in `page.tsx`)
- Use `scroll-smooth` class on `<html>` for smooth scrolling

---

## Code Style Rules

1. **TypeScript**: Always define proper types; avoid `any`
2. **Components**: Use functional components with explicit return types
3. **Imports**: Use `@/` path alias for absolute imports
4. **Client Components**: Add `"use client"` directive only when necessary (hooks, browser APIs)
5. **Naming**: Use PascalCase for components, camelCase for functions/variables

---

## Do NOT

- Install additional CSS frameworks (Bootstrap, Material UI, etc.)
- Use CSS-in-JS libraries (styled-components, emotion)
- Create new icon libraries or SVG sprite systems
- Modify `tailwind.config.js` brand colors without explicit request
- Use `pages/` directory (this is an App Router project)

# Chronicle — Social App Frontend

A production-grade Next.js 14 frontend for the Chronicle social API.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** — custom design system (ink / cream / accent palette)
- **Zustand** — auth state management
- **Axios** — API client with interceptors
- **react-hot-toast** — notifications
- **date-fns** — time formatting
- **lucide-react** — icons

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set API URL
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL if your API runs on a different port

# 3. Run dev server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (or whichever port Next.js assigns).

> Your backend API should be running at `http://localhost:3000`.

---

## Project Structure

```
src/
├── app/
│   ├── auth/               # Login & signup page
│   ├── (app)/              # Protected layout (sidebar + auth guard)
│   │   ├── feed/           # Post feed + post detail
│   │   │   ├── page.tsx    # Feed list
│   │   │   └── [id]/       # Single post + comments
│   │   ├── profile/        # My profile (view + edit)
│   │   └── users/[id]/     # Public user profile + follow
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/
│   │   ├── Avatar.tsx
│   │   └── Skeleton.tsx
│   ├── posts/
│   │   ├── PostCard.tsx    # Like, edit, delete
│   │   └── CreatePostForm.tsx
│   └── comments/
│       └── CommentsSection.tsx
├── lib/
│   ├── api.ts              # Axios instance + error helper
│   └── store.ts            # Zustand auth store
└── types/
    └── index.ts            # All TypeScript interfaces
```

---

## Pages & Features

| Route | Description |
|-------|-------------|
| `/auth` | Login / signup (toggle) |
| `/feed` | Paginated post feed, create post |
| `/feed/[id]` | Post detail + comments |
| `/profile` | My profile (edit bio, avatar, cover, etc.) |
| `/users/[id]` | Public profile + follow/unfollow |

### Features
- ✅ JWT auth — token stored in localStorage, auto-attached to requests
- ✅ Create / edit / delete posts (owner only)
- ✅ Like / unlike with optimistic UI
- ✅ Create / delete comments
- ✅ Follow / unfollow users with optimistic count update
- ✅ Profile editing (display name, bio, avatar, cover, location, website, pronouns)
- ✅ Skeleton loaders throughout
- ✅ 401 auto-redirect to `/auth`
- ✅ Responsive — sidebar on desktop, top bar on mobile

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | Base URL for the backend API |

---

## Design System

**Fonts**: DM Serif Display (headings) + DM Sans (body) + DM Mono

**Palette**:
- `ink` — dark neutrals (#0d0d0d → #f5f5f0)
- `cream` — warm off-whites (#faf8f3 → #e8e0cc)
- `accent` — warm gold (#c8a96e)
- `signal` — red / green / blue for states

---

## Build for Production

```bash
npm run build
npm start
```

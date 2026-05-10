# Skill Exchange Platform (MERN)

A complete MERN stack project with JWT auth, User/Admin roles, skill matching, requests, scheduling, ratings, reports, and admin moderation.

## Project Structure

- `server/` - Express + MongoDB backend
- `client/` - React frontend (plain CSS)

## Backend Setup

1. Go to `server/`
2. Copy `.env.example` to `.env`
3. Update `MONGO_URI` and `JWT_SECRET`
4. Run:
   - `npm install`
   - `npm run dev`

## Frontend Setup

1. Go to `client/`
2. Copy `.env.example` to `.env`
3. Run:
   - `npm install`
   - `npm run dev`

## Main Backend APIs

- Auth: `/api/auth/signup`, `/api/auth/login`
- User/Profile: `/api/users/me`, `/api/users/matches`, `/api/users/session-count/:otherUserId`
- Requests: `/api/requests/*` (send/respond/schedule/complete/rate/continue/dashboard)
- Reports: `/api/reports`
- Admin: `/api/admin/users`, `/api/admin/users/:id/ban-toggle`, `/api/admin/reports`

## Roles

- `user` - skill exchange workflow
- `admin` - user moderation and reports review

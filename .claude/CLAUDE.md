# Sprout

## What we're building

Mobile app to help users keep their plants alive. Calendar-driven task management, plant tracking, and care reminders. MVP stage.

## Core MVP features (build in this order)

1. Dashboard / Home Screen — today's tasks, quick stats, leafling mascot
2. Calendar — month view, coloured task dots, day detail, task completion
3. My Garden — add/edit/delete plants, grid + list view, search/filter by different areas (e.g. living room, balcony, study, kitchen etc.)
4. Watering & Care Reminders — per-plant schedules, push notifications, task history
5. Profile - Update user settings, log out,

## Phase 1.5 (after launch)

- Photo Timeline — chronological per-plant photo gallery, before/after compare
- Plant Health Tracking — Thriving / Okay / Struggling status, notes, event log

## Key UX rules

- Satisfying animations + haptic feedback on task completion
- 60fps, minimal friction — fewest taps for common actions
- Easy to undo/reschedule — no punishing UX

## Stack

### Frontend

- React Native + Expo
- Zustand (state management)
- React Hook Form (forms)
- Expo UI (components)
- RevenueCat (subscriptions + paywalls)
- Reanimated v4
- Expo Push Notifications
- React Query

### Backend

- Supabase — Postgres DB, photo storage, auth

> This list is a living document. Add new packages/tools here as they are introduced during development.

## Avoid

- Over-engineering before launch
- Features outside current phase scope without discussion

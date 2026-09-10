# AGENTS.md — H'Leven

Two-stack project: a **Laravel 13 backend** (`backend/`) and a **React 19 + Vite frontend** (`frontend/`). Static design mocks live in `design/`; project rules in `md/`. No root-level README or package manager — each stack owns its own manifests and `node_modules`.

## Layout

| Dir | Stack | Entry |
|---|---|---|
| `backend/` | Laravel 13 (PHP 8.3), API-only | `php artisan serve` → `http://localhost:8000/api/v1` |
| `frontend/` | React 19, Vite 8, Tailwind v4 | `npm run dev` → `http://localhost:5713` |
| `design/` | Static HTML mocks | reference only, not built |
| `md/` | Project rules (see below) | — |

Backend assets (CSS/JS for Laravel's own `resources/`) are built by a **separate Vite config in `backend/`** — do not confuse it with the frontend React app. They have independent `node_modules`, `vite.config.js`, and `package.json`.

## Commands

**Backend** (`cd backend`):
- Setup: `composer install && cp .env.example .env && php artisan key:generate && php artisan migrate --force` (then `npm install && npm run build` for Laravel assets)
- `composer setup` — convenience script that runs the above in order
- `composer dev` — starts `php artisan serve` + `queue:listen` + `pail` + `npm run dev` concurrently (Laravel Vite, **not** the React app)
- Test: `composer test` → `php artisan config:clear && php artisan test`. PHPUnit uses **in-memory SQLite** (`phpunit.xml`), so no DB setup is needed for tests.
- `php artisan pint` — Laravel Pint formatter (no `pint.json`, default preset)
- `php test_dashboards.php` — standalone script that hits the admin + super-admin dashboards directly (needs seeded DB)

**Frontend** (`cd frontend`):
- `npm run dev` — dev server on port **5713**
- `npm run build` → output to `frontend/dist/`
- `npm run lint` — eslint (no eslint config file in repo; defaults only, no typecheck script)

## Architecture & boundaries

- **Auth:** Laravel Sanctum. Tokens issued as `access_token`; frontend stores `token` + `user` in `localStorage`. All `/api/v1` routes except `register`, `login`, `facilities`, `payments/callback`, and public hotel/room reads require `auth:sanctum`.
- **Roles** (column `users.role`): `user`, `admin_hotel`, `super_admin`. Enforced by `App\Http\Middleware\CheckRole`, aliased as `role` in `bootstrap/app.php`. Note: `spatie/laravel-permission` is installed but the codebase uses the raw `users.role` column — do not assume the roles/permissions tables are the source of truth.
- **Controller layout:** `app/Http/Controllers/Api/V1/` holds the API controllers; `app/Services/` holds business logic; `app/Models/` holds Eloquent models.
- **Scheduled command:** `booking:check-expired` runs every minute via `routes/console.php` (`Schedule::command(...)->everyMinute()`). Requires the scheduler to be running (e.g. `php artisan schedule:work` or a cron entry).
- **CORS** (`config/cors.php`) allows `localhost:5713` (frontend dev port) plus 5173/5174/3000, with `supports_credentials: true`.

## Gotchas

- **Frontend `api.js` hardcodes `baseURL: 'http://localhost:8000/api/v1'`** and does **not** read `VITE_API_URL` from `.env`. Changing `frontend/.env` will not redirect API calls.
- **Backend `.env` currently points to a hosted Supabase PostgreSQL** (`DB_CONNECTION=pgsql`), but `phpunit.xml` overrides to `:memory:` SQLite for tests. Tests are isolated from the real DB; `php artisan migrate` needs the configured PG connection.
- Backend `.npmrc` has `ignore-scripts=true` — `npm install` there skips postinstall scripts.
- `backend/.gitignore` ignores `.env`, `vendor`, `node_modules`, `public/build`, `storage/framework`, etc. The frontend `dist/` is **not** gitignored (it is committed).
- No CI workflows, pre-commit hooks, or eslint/prettier configs exist. `composer test` is the only automated check.

## Hard rules (from `md/Database.md`)

- **Never create, alter, or add a database table without explicit approval.** Before any schema change, stop and submit a `DATABASE CHANGE REQUEST` (table name, columns, types, nullability, defaults, relationships, FKs, impact on existing API). Only after approval may you create a migration, model, relationships, controller/service, and test.
- Prefer existing tables/columns over new ones. If a new column suffices, report it (with table + column + reason) and wait for approval.
- Frontend must not create database records; if the frontend needs data the API doesn't yet provide, report it as a backend change request.
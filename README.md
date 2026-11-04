# Admin panel

Persian guide: [README.fa.md](README.fa.md).

Agent guide: [AGENTS.md](AGENTS.md). Persian agent guide: [AGENTS.fa.md](AGENTS.fa.md).

This is the management UI for the apartment backend. It is a separate Next.js app. It is not a route inside the resident frontend.

The panel talks only to the versioned admin API:

```text
/api/admin/{module}-service/v1/...
```

The resident app keeps its own `/api/...` routes. Do not point this panel at those routes.

## Requirements

- Node.js 20.9 or newer
- npm
- The backend running on port 8000
- Docker, for the backend. The backend host does not need a local PHP binary.

Related repositories, as siblings of this folder:

| Folder | Role |
| --- | --- |
| `my-apartment-backend` | Laravel API |
| `my-apartment-admin` | This panel, port 3001 |
| `my-apartment-frontend` | Resident app. Leave it alone when changing the panel. |

## Run the backend

From `my-apartment-backend`:

```bash
docker compose up -d
docker compose exec app php artisan migrate --seed
```

Check that the API is up:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/up
```

`200` means the API is listening.

Container names follow `APP_NAME` in the backend `.env`. With the local value `pagard`, the app container is `pagard_app`. The compose service name stays `app`.

The seeded super admin is created by `database/seeders/DatabaseSeeder.php`. On a fresh local database that seeder uses:

- mobile `09129538215`
- password `123456789`

That password is only for the local seed. Do not reuse it outside local development.

Admin SMS login does not text a phone while `SMS_DEFAULT_PROVIDER=log`. The code is written to the backend log after the `otp-worker` container consumes the `otp` queue on RabbitMQ. Password login does not need that worker.

## Run the panel

From this folder:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://127.0.0.1:3001](http://127.0.0.1:3001).

`.env.local` is gitignored. The only required value is:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

`lib/http.ts` appends `/admin` itself. Do not put `/admin` in `NEXT_PUBLIC_API_URL`.

Changing `NEXT_PUBLIC_*` needs a restart of `npm run dev`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Production server on port 3001 |
| `npm run lint` | ESLint |
| `./node_modules/.bin/tsc --noEmit` | Typecheck. Use this binary, not a global `tsc`. |

There is no test runner in this package. Backend admin coverage lives in `modules/Account/Tests/Feature/AdminApiTest.php` and is run inside Docker.

## Layout

```text
app/
  layout.tsx              Root layout, font, theme, auth
  login/page.tsx          Password and SMS login
  (panel)/                Pages behind the shell
    page.tsx              Dashboard
    users/                List, create, detail
    roles/
    bills/
    payments/
    settings/
  fonts/                  IRANYekanXFaNum, weights 100–900
components/
  nav.ts                  The only navigation list
  shell.tsx               Sidebar, drawer, header
  ui.tsx                  Screen, fields, alerts, checklists
  role-form.tsx
  icons.tsx
lib/
  http.ts                 fetch client and error text
  endpoints.ts            Admin path builders
  types.ts                Response shapes
  auth.tsx                Session and permissions
  theme.tsx               Light and dark
  use-query.ts            Load one endpoint
  use-action.ts           Submit, pending, message, error
  format.ts               Digits, names, numbers
  form.ts                 FormData readers
```

`@/` maps to the project root (`tsconfig.json`).

## Request flow

1. `lib/endpoints.ts` builds a path such as `/account-service/v1/users`.
2. `http.get` or `http.post` calls `{NEXT_PUBLIC_API_URL}/admin` plus that path.
3. The client sends `Accept: application/json`, `Content-Type: application/json`, and `Authorization: Bearer <token>` when a token exists.
4. A successful body is `{ items, message, errors, token? }`.
5. Pages read `response.items`. They do not read a top-level `data` field.
6. Failures throw `ApiError`. `useAction` and `errorText` show `errors` first, then `message`.

The token is stored in `localStorage` under `admin_token`. The Sanctum token name on the server is `admin-panel`.

## Auth and permissions

Login accepts a password or a 5-digit SMS code. Both are always offered here. The resident auth method in Settings does not hide either method on this page.

The submit button stays disabled until the input is valid:

- mobile: 11 digits starting with `09` (Persian and Arabic-Indic digits are accepted)
- password: not empty
- SMS code: exactly 5 digits

Only a user who already has an admin role can sign in. OTP does not create users.

`useAuth().can("users.view")` checks the permission list returned by `/me`. `super_admin` receives every key from the backend permission config. The shell and dashboard both read `components/nav.ts`, so a new screen is added there once.

## Theme

The toggle writes the cookie `admin_theme` (`light` or `dark`) and sets the `dark` class on `<html>`. With no cookie, the first visit follows the operating system. Tokens live in `app/globals.css` as `--canvas`, `--surface`, `--ink`, `--primary`, and the matching Tailwind colors (`bg-canvas`, `text-ink`, `bg-primary`).

The UI font is IRANYekan FaNum. Latin digits in the UI are drawn as Persian digits. Values sent to the API are still converted to Latin digits by `toLatinDigits`.

## Add a screen

1. Add the page under `app/(panel)/your-page/page.tsx`.
2. Add one item to `navItems` in `components/nav.ts`, including the permission key.
3. Load data with `useQuery(apiPaths.somePath)`.
4. Save with `useAction` and `http.post` / `http.put` / `http.patch` / `http.delete`.
5. Hide actions the current user cannot perform with `can(...)`.

User ids in admin URLs are plain numbers. Building and unit ids elsewhere in the backend are Hashids. Do not encode user ids.

## Add an endpoint

1. Add the Laravel route under `modules/{Module}/routes/Admin/V1.php`.
2. Return `Helper\ResponseBuilder` (`items`, `message`, `errors`).
3. Protect it with `auth:sanctum`, `admin`, and `permission:...` when it is not a public login route.
4. Add a builder in `lib/endpoints.ts` and a type in `lib/types.ts`.
5. Call it through `http`. Do not call `fetch` from a page.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Login says the request failed immediately | Nothing is listening on port 8000. Start the backend. |
| Mobile is rejected before the password is checked | The value is not 11 digits beginning with `09`. Persian digits are fine. Spaces are stripped. |
| SMS code never arrives on the phone | `SMS_DEFAULT_PROVIDER=log`. Read the backend log after `otp-worker` runs. |
| Button looks inactive | That is expected until the fields are valid. It is `disabled` and does not receive clicks. |
| A new env value is ignored | Restart `npm run dev`. |
| `tsc` is the wrong package | Run `./node_modules/.bin/tsc --noEmit`. |

CORS on the local API allows any origin and does not use cookies for the API. The panel uses a bearer token, not a cookie session.

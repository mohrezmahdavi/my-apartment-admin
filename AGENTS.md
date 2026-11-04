# Agents — admin panel

Persian twin: [AGENTS.fa.md](AGENTS.fa.md). Keep the two files in agreement when a convention changes.

Human setup guide: [README.md](README.md) and [README.fa.md](README.fa.md).

This file is the source of truth for work in `my-apartment-admin`.

## What this app is

Next.js 16.2, React 19, Tailwind 4, TypeScript. Dev and production servers use port 3001.

It is only the admin UI. The resident app is `my-apartment-frontend`. The API is `my-apartment-backend`.

Admin HTTP calls go to:

```text
{NEXT_PUBLIC_API_URL}/admin{path from lib/endpoints.ts}
```

Default base is `http://localhost:8000/api`. Full example:

```text
GET http://localhost:8000/api/admin/account-service/v1/me
Authorization: Bearer <admin_token>
```

Resident routes under `/api/...` that return a top-level `data` field are a different contract. Do not convert them to `ResponseBuilder`, and do not call them from this panel.

## Hard rules

- UI strings are Persian. Identifiers, routes, permission keys, and JSON fields stay English.
- Do not render the product name پاگرد on `app/login/page.tsx`. The shell may keep it.
- Login always shows password and SMS. Do not hide one of them based on the resident `auth_method` setting.
- The login submit control stays `disabled`, with `pointer-events: none`, until the field rules below pass. Also return early in the submit handler.
- Mobile rule: `^09\d{9}$` after `toLatinDigits`. Password rule: trimmed non-empty. OTP rule: `^\d{5}$` after `toLatinDigits`.
- Do not call `fetch` from a page. Use `http` in `lib/http.ts` and paths in `lib/endpoints.ts`.
- Read payloads from `response.items`. The admin JSON shape is `items`, `message`, `errors`, optional `token`.
- Permission checks go through `useAuth().can`. Add a nav entry in `components/nav.ts` for a new screen. Dashboard shortcuts come from that list.
- User ids in this UI are numeric. Do not Hashid them.
- Do not `Hash::make` a password before `User::create` or `update` on the backend. The User password cast already hashes.
- Do not invent a second design system. Use `app/globals.css` tokens and `components/ui.tsx`.
- Before using a Next.js API that may differ from older Next, read the matching guide in `node_modules/next/dist/docs/`.
- Verify a UI change in the browser at `http://127.0.0.1:3001`: exercise the flow, not only a screenshot. Check both theme and a narrow viewport when layout changed.
- Do not commit unless the user asks.

## Where to change things

| Task | Files |
| --- | --- |
| New page | `app/(panel)/<name>/page.tsx`, then `components/nav.ts` |
| Shared control | `components/ui.tsx` |
| HTTP verb or error parsing | `lib/http.ts` |
| New admin URL | backend `modules/<Module>/routes/Admin/V1.php`, then `lib/endpoints.ts` and `lib/types.ts` |
| Session, redirect, `can` | `lib/auth.tsx` |
| Light / dark | `lib/theme.tsx`, cookie `admin_theme`, tokens in `app/globals.css` |
| Digits, names, money | `lib/format.ts` |
| FormData | `lib/form.ts` |
| Load a GET | `useQuery` from `lib/use-query.ts` |
| Submit and show the result | `useAction` from `lib/use-action.ts` |

`useQuery(path)` keeps the previous `data` while a later request is in flight. Pass `null` to skip the request. `useAction().run(action, fallback)` sets `pending`, clears the previous error, and stores a returned string as `message`.

Page components stay thin. A page that mixes several forms should split those forms into a sibling file, the way `app/(panel)/users/[id]/sections.tsx` and `wallet-panel.tsx` do.

## Backend contract

Routes are mounted from `routes/api.php` with prefix `admin`, on top of Laravel's `/api` prefix.

| Module prefix | Routes | Permission |
| --- | --- | --- |
| `account-service/v1` | `POST login`, `POST otp/send`, `POST otp/verify` | public, throttled |
| same | `POST logout`, `GET me`, `GET dashboard` | admin session |
| same | users CRUD | `users.view` `users.create` `users.edit` `users.delete` |
| `acl-service/v1` | permissions, roles CRUD, `PUT users/{user}/roles` | `roles.view` or `roles.manage` |
| `wallet-service/v1` | `GET users/{user}/wallet`, `POST .../adjust` | `wallet.view` `wallet.adjust` |
| `bill-service/v1` | providers, `refresh-cache`, `finnotech-token` | `bills.view` `bills.manage` |
| `payment-service/v1` | gateway, `refresh-cache` | `payments.view` `payments.manage` |
| `setting-service/v1` | `GET/PATCH settings` | `settings.manage` |

Protected routes use `auth:sanctum` and `admin` (`EnsureAdmin`). `CheckPermission` reads `$request->user()`.

`super_admin` cannot be deleted from the role screen. The role name `super_admin` is the guard.

Admin login returns 403 through `ResponseBuilder` when the account exists but has no admin role. OTP send does the same and does not create a user.

Validation and throttle JSON for the API also use `ResponseBuilder`. Throttle keeps the `Retry-After` header.

Settings `auth_method` is `password`, `otp`, or `both` for the resident app only.

Wallet deposit type on the client is `DEPOSIT = 1` in `lib/types.ts`. Adjust body is `{ type: "deposit" | "withdraw", amount, description }`.

## Local runtime

There is no PHP binary on the host. Backend commands:

```bash
cd ../my-apartment-backend
docker compose up -d
docker compose exec app php artisan migrate --seed
docker compose exec app php vendor/bin/phpunit modules/Account/Tests/Feature/AdminApiTest.php --no-coverage
```

Panel commands, from this repo:

```bash
npm run dev
./node_modules/.bin/tsc --noEmit
npm run lint
```

`npx tsc` can install the unrelated `tsc` package. Do not use it.

Fresh seed login, local only: mobile `09129538215`, password `123456789`, from `DatabaseSeeder.php`.

`SMS_DEFAULT_PROVIDER=log`. An OTP is not delivered to a handset. `otp-worker` must be running for the code to reach the Laravel log. Password login does not need it.

If login fails in a few milliseconds, the request never reached `Auth::attempt`. Usual causes: API not listening on port 8000, or mobile validation. A real password check takes noticeably longer.

CORS allows `*` and `supports_credentials` is false. Do not switch the panel to cookie auth without changing that on purpose.

## Theme and font

`app/layout.tsx` reads the `admin_theme` cookie on the server. `lib/theme.tsx` applies `light` or `dark` and writes the cookie. An inline script covers the first visit when the cookie is missing and the OS prefers dark.

Colors are CSS variables on `:root` and `.dark`. Components use `bg-canvas`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-primary`, `text-primary-ink`. Do not hard-code `slate` or `white` for surfaces that must follow the theme.

Font files: `app/fonts/iranyekan/Woff2/IRANYekanXFaNum-*.woff2`, exposed as `--font-app`. The family is FaNum, so painted digits look Persian even when the string is Latin.

## Login behavior to preserve

`app/login/page.tsx` owns both methods. `toLatinDigits` runs again inside `lib/auth.tsx` before the JSON body is sent. The backend `NormalizeRequestNumbers` middleware also rewrites JSON bodies. Keep both.

Empty and invalid forms must not submit on click or on Enter.

## Extending safely

A new admin feature usually touches both repos:

1. Add the route, controller, and permission key on the backend. Return `ResponseBuilder`.
2. Add the path and the TypeScript type in this repo.
3. Build the page from `Screen`, `PageHeader`, `Field` or `SelectField`, `Notices`, and `useQuery` / `useAction`.
4. Register it in `navItems` with the same permission string the middleware uses.
5. Typecheck with the local `tsc`. Then click through the new flow in light and dark, and on a narrow window if the layout can wrap.

Do not add a state library, a component kit, or a new HTTP wrapper beside `lib/http.ts`.

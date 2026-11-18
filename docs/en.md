# Admin panel screens

Persian: [fa.md](fa.md). Setup: [../README.md](../README.md). Agents: [../AGENTS.md](../AGENTS.md). Product map: [../../my-apartment-backend/docs/en/product.md](../../my-apartment-backend/docs/en/product.md).

Port 3001. UI copy is Persian. Routes, permission keys, and JSON fields stay English. HTTP goes through `lib/http.ts` and `lib/endpoints.ts`. Read `response.items`. User ids stay numeric.

Login always shows password and SMS. It does not read the resident `auth_method`. The submit control stays disabled until mobile matches `^09\d{9}$` or the password or five-digit OTP rule passes.

| Path | Permission | Module |
| --- | --- | --- |
| `/login` | public | Account |
| `/` | admin session | Account dashboard |
| `/users` | `users.view` | Account |
| `/users/new` | `users.create` | Account |
| `/users/[id]` | `users.view`, wallet `wallet.view` | Account, Wallet, Acl |
| `/roles` | `roles.view` | Acl |
| `/roles/new` | `roles.manage` | Acl |
| `/roles/[id]` | `roles.view` | Acl |
| `/buildings` | `buildings.view` | Building, Subscription |
| `/buildings/[id]` | `buildings.view` | Building, Subscription |
| `/bills` | `bills.view` | Bill |
| `/payments` | `payments.view` | Payment |
| `/settlements` | `wallet.view`, pay `wallet.adjust` | Wallet |
| `/support` | `support.view` | Support |
| `/support/[id]` | `support.view`, reply `support.reply` | Support |
| `/subscriptions` | `subscriptions.view` | Subscription |
| `/sms-packages` | `sms_packages.view` | Notification |
| `/settings` | `settings.manage` | Setting |

User, building, settlement, support, and user-wallet lists are one page at a time. The panel does not call resident `/api/...` routes that return `data`.

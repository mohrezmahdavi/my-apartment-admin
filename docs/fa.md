# صفحه‌های پنل مدیریت

انگلیسی: [en.md](en.md). راهنمای اجرا: [../README.fa.md](../README.fa.md). ایجنت: [../AGENTS.fa.md](../AGENTS.fa.md). نقشهٔ محصول: [../../my-apartment-backend/docs/fa/product.md](../../my-apartment-backend/docs/fa/product.md).

پورت ۳۰۰۱. رشتهٔ UI فارسی است. مسیر، کلید دسترسی و فیلد JSON انگلیسی می‌مانند. HTTP از `lib/http.ts` و `lib/endpoints.ts` است. بدنه از `response.items` خوانده می‌شود. شناسهٔ کاربر عدد است.

ورود همیشه رمز و پیامک را نشان می‌دهد و `auth_method` ساکن را نمی‌خواند. تا وقتی موبایل `^09\d{9}$` یا رمز یا OTP پنج رقمی درست نباشد دکمهٔ ارسال غیرفعال است.

| مسیر | دسترسی | ماژول |
| --- | --- | --- |
| `/login` | عمومی | Account |
| `/` | نشست ادمین | Account داشبورد |
| `/users` | `users.view` | Account |
| `/users/new` | `users.create` | Account |
| `/users/[id]` | `users.view`، کیف `wallet.view` | Account، Wallet، Acl |
| `/roles` | `roles.view` | Acl |
| `/roles/new` | `roles.manage` | Acl |
| `/roles/[id]` | `roles.view` | Acl |
| `/buildings` | `buildings.view` | Building، Subscription |
| `/buildings/[id]` | `buildings.view` | Building، Subscription |
| `/bills` | `bills.view` | Bill |
| `/payments` | `payments.view` | Payment |
| `/settlements` | `wallet.view`، واریز `wallet.adjust` | Wallet |
| `/support` | `support.view` | Support |
| `/support/[id]` | `support.view`، جواب `support.reply` | Support |
| `/subscriptions` | `subscriptions.view` | Subscription |
| `/sms-packages` | `sms_packages.view` | Notification |
| `/settings` | `settings.manage` | Setting |

فهرست کاربران، ساختمان، تسویه، پشتیبانی و دفتر کیف کاربر صفحه‌بندی یک‌صفحه‌ای دارند. پنل به مسیر ساکن `/api/...` که `data` برمی‌گرداند وصل نمی‌شود.

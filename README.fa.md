# پنل مدیریت

راهنمای انگلیسی: [README.md](README.md).

راهنمای ایجنت: [AGENTS.md](AGENTS.md). نسخهٔ فارسی ایجنت: [AGENTS.fa.md](AGENTS.fa.md).

این رابط مدیریت بک‌اند ساختمان است. پروژهٔ Next.js جداگانه‌ای است و داخل فرانت ساکنان قرار ندارد.

پنل فقط با API نسخه‌دار ادمین حرف می‌زند:

```text
/api/admin/{module}-service/v1/...
```

مسیرهای `/api/...` مخصوص اپ ساکنان است. پنل را به آن مسیرها وصل نکنید.

## پیش‌نیاز

- Node.js نسخهٔ ۲۰٫۹ یا جدیدتر
- npm
- بک‌اند روی پورت ۸۰۰۰
- Docker برای بک‌اند. روی خود سیستم لازم نیست PHP نصب باشد.

پوشه‌های هم‌سطح:

| پوشه | نقش |
| --- | --- |
| `my-apartment-backend` | API لاراول |
| `my-apartment-admin` | همین پنل، پورت ۳۰۰۱ |
| `my-apartment-frontend` | اپ ساکنان. با کار روی پنل آن را عوض نکنید. |

## اجرای بک‌اند

داخل `my-apartment-backend`:

```bash
docker compose up -d
docker compose exec app php artisan migrate --seed
```

سلامت API:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/up
```

پاسخ `200` یعنی API در حال گوش دادن است.

نام کانتینرها از `APP_NAME` در `.env` بک‌اند می‌آید. با مقدار محلی `pagard` کانتینر برنامه `pagard_app` است. نام سرویس در Compose همان `app` می‌ماند.

کاربر مدیر اولیه را `database/seeders/DatabaseSeeder.php` می‌سازد. روی دیتابیس تازهٔ محلی این سیدر این مقادیر را دارد:

- موبایل `09129538215`
- رمز `123456789`

این رمز فقط برای سید محلی است. بیرون از محیط توسعه از آن استفاده نکنید.

ورود پیامکی پنل، تا وقتی `SMS_DEFAULT_PROVIDER=log` باشد، به گوشی پیامک نمی‌فرستد. کد بعد از مصرف صف `otp` توسط کانتینر `otp-worker` در لاگ بک‌اند نوشته می‌شود. ورود با رمز به این worker نیاز ندارد.

## اجرای پنل

داخل همین پوشه:

```bash
cp .env.example .env.local
npm install
npm run dev
```

سپس [http://127.0.0.1:3001](http://127.0.0.1:3001) را باز کنید.

فایل `.env.local` در گیت نمی‌آید. تنها مقدار لازم:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

`lib/http.ts` خودش `/admin` را اضافه می‌کند. `/admin` را داخل `NEXT_PUBLIC_API_URL` نگذارید.

بعد از تغییر متغیرهای `NEXT_PUBLIC_*` باید `npm run dev` را از نو اجرا کنید.

## دستورها

| دستور | کار |
| --- | --- |
| `npm run dev` | سرور توسعه روی پورت ۳۰۰۱ |
| `npm run build` | بیلد پروداکشن |
| `npm run start` | سرور پروداکشن روی پورت ۳۰۰۱ |
| `npm run lint` | ESLint |
| `./node_modules/.bin/tsc --noEmit` | بررسی نوع. از همین باینری استفاده کنید، نه از `tsc` سراسری. |

در این بسته تست‌رانر نیست. پوشش API ادمین در `modules/Account/Tests/Feature/AdminApiTest.php` است و داخل Docker اجرا می‌شود.

## چیدمان

```text
app/
  layout.tsx              چیدمان ریشه، فونت، پوسته، احراز هویت
  login/page.tsx          ورود با رمز و پیامک
  (panel)/                صفحه‌های داخل پوسته
    page.tsx              داشبورد
    users/                فهرست، ساخت، جزئیات
    roles/
    bills/
    payments/
    settings/
  fonts/                  IRANYekanXFaNum، وزن ۱۰۰ تا ۹۰۰
components/
  nav.ts                  تنها فهرست منو
  shell.tsx               نوار کناری، کشو، سرصفحه
  ui.tsx                  صفحه، فیلد، هشدار، فهرست تیک
  role-form.tsx
  icons.tsx
lib/
  http.ts                 کلاینت fetch و متن خطا
  endpoints.ts            سازندهٔ مسیرهای ادمین
  types.ts                شکل پاسخ‌ها
  auth.tsx                نشست و دسترسی
  theme.tsx               روشن و تیره
  use-query.ts            خواندن یک مسیر
  use-action.ts           ارسال، انتظار، پیام، خطا
  format.ts               رقم، نام، عدد
  form.ts                 خواندن FormData
```

`@/` به ریشهٔ پروژه اشاره می‌کند (`tsconfig.json`).

## مسیر یک درخواست

1. `lib/endpoints.ts` مسیری مثل `/account-service/v1/users` می‌سازد.
2. `http.get` یا `http.post` این مسیر را به `{NEXT_PUBLIC_API_URL}/admin` می‌چسباند.
3. کلاینت `Accept: application/json` و `Content-Type: application/json` می‌فرستد و اگر توکن باشد `Authorization: Bearer` هم می‌فرستد.
4. بدنهٔ موفق `{ items, message, errors, token? }` است.
5. صفحه‌ها `response.items` را می‌خوانند. فیلد بالای `data` مال این پنل نیست.
6. شکست‌ها `ApiError` پرتاب می‌کنند. `useAction` و `errorText` اول `errors` و بعد `message` را نشان می‌دهند.

توکن در `localStorage` با کلید `admin_token` است. نام توکن Sanctum در سرور `admin-panel` است.

## ورود و دسترسی

ورود هم با رمز است و هم با کد ۵ رقمی. هر دو روش همیشه در این صفحه هستند. روش ورود اپ ساکنان که در تنظیمات ذخیره می‌شود، دکمه‌های این صفحه را پنهان نمی‌کند.

دکمهٔ ارسال تا وقتی ورودی معتبر نباشد غیرفعال است:

- موبایل: ۱۱ رقم و شروع با `09` (رقم فارسی و عربی هم قبول است)
- رمز: خالی نباشد
- کد پیامک: دقیقاً ۵ رقم

فقط کاربری که از قبل نقش مدیریتی دارد می‌تواند وارد شود. کد یکبارمصرف کاربر جدید نمی‌سازد.

`useAuth().can("users.view")` فهرست دسترسی‌های `/me` را چک می‌کند. `super_admin` همهٔ کلیدهای پیکربندی دسترسی بک‌اند را دارد. پوسته و داشبورد هر دو از `components/nav.ts` می‌خوانند، پس صفحهٔ تازه یک‌بار آنجا اضافه می‌شود.

## پوسته

دکمهٔ پوسته کوکی `admin_theme` را با مقدار `light` یا `dark` می‌نویسد و کلاس `dark` را روی `<html>` می‌گذارد. بدون کوکی، اولین بازدید از سیستم‌عامل پیروی می‌کند. توکن‌های رنگ در `app/globals.css` هستند: `--canvas` و `--surface` و `--ink` و `--primary` و رنگ‌های Tailwind متناظر مثل `bg-canvas` و `text-ink` و `bg-primary`.

فونت رابط IRANYekan FaNum است. رقم لاتین در ظاهر به شکل فارسی دیده می‌شود. مقداری که به API می‌رود را `toLatinDigits` به رقم لاتین برمی‌گرداند.

## افزودن صفحه

1. صفحه را زیر `app/(panel)/your-page/page.tsx` بسازید.
2. یک مورد به `navItems` در `components/nav.ts` اضافه کنید، همراه کلید دسترسی.
3. داده را با `useQuery(apiPaths.somePath)` بگیرید.
4. ذخیره را با `useAction` و `http.post` یا `http.put` یا `http.patch` یا `http.delete` انجام دهید.
5. کاری را که کاربر فعلی اجازه ندارد با `can(...)` پنهان کنید.

شناسهٔ کاربر در آدرس پنل عدد ساده است. شناسهٔ ساختمان و واحد در بقیهٔ بک‌اند Hashids است. شناسهٔ کاربر را کد نکنید.

## افزودن endpoint

1. مسیر لاراول را در `modules/{Module}/routes/Admin/V1.php` بگذارید.
2. خروجی را با `Helper\ResponseBuilder` برگردانید (`items` و `message` و `errors`).
3. به‌جز مسیر عمومی ورود، `auth:sanctum` و `admin` و در صورت نیاز `permission:...` بگذارید.
4. سازنده را در `lib/endpoints.ts` و نوع را در `lib/types.ts` اضافه کنید.
5. از صفحه مستقیم `fetch` نزنید. از `http` استفاده کنید.

## وقتی چیزی درست کار نمی‌کند

| نشانه | بررسی |
| --- | --- |
| ورود همان لحظه شکست می‌خورد | روی پورت ۸۰۰۰ چیزی گوش نمی‌دهد. بک‌اند را بالا بیاورید. |
| موبایل قبل از بررسی رمز رد می‌شود | مقدار ۱۱ رقم و با `09` نیست. رقم فارسی اشکالی ندارد. فاصله حذف می‌شود. |
| کد پیامک به گوشی نمی‌رسد | `SMS_DEFAULT_PROVIDER=log` است. بعد از اجرای `otp-worker` لاگ بک‌اند را ببینید. |
| دکمه غیرفعال دیده می‌شود | تا فیلدها معتبر نباشند همین‌طور است. `disabled` است و کلیک را نمی‌گیرد. |
| مقدار تازهٔ env اثر ندارد | `npm run dev` را دوباره اجرا کنید. |
| `tsc` بستهٔ اشتباه است | `./node_modules/.bin/tsc --noEmit` را بزنید. |

CORS در API محلی هر مبدأیی را اجازه می‌دهد و برای API از کوکی استفاده نمی‌کند. پنل توکن Bearer دارد، نه نشست کوکی.

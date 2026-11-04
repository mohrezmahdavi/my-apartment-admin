# ایجنت‌ها — پنل مدیریت

نسخهٔ انگلیسی: [AGENTS.md](AGENTS.md). اگر قراردادی عوض شد هر دو فایل باید با هم بخوانند.

راهنمای انسان: [README.md](README.md) و [README.fa.md](README.fa.md).

این فایل مرجع کار داخل `my-apartment-admin` است.

## این برنامه چیست

Next.js ۱۶٫۲ و React ۱۹ و Tailwind ۴ و TypeScript. سرور توسعه و پروداکشن روی پورت ۳۰۰۱ است.

فقط رابط ادمین است. اپ ساکنان `my-apartment-frontend` است. API در `my-apartment-backend` است.

درخواست‌های ادمین به این شکل می‌روند:

```text
{NEXT_PUBLIC_API_URL}/admin{path from lib/endpoints.ts}
```

پایهٔ پیش‌فرض `http://localhost:8000/api` است. نمونه:

```text
GET http://localhost:8000/api/admin/account-service/v1/me
Authorization: Bearer <admin_token>
```

مسیرهای ساکنان زیر `/api/...` که فیلد بالای `data` برمی‌گردانند قرارداد دیگری هستند. آن‌ها را به `ResponseBuilder` تبدیل نکنید و از این پنل صدا نزنید.

## قاعده‌های ثابت

- متن رابط فارسی است. شناسه، مسیر، کلید دسترسی و فیلد JSON انگلیسی می‌مانند.
- نام محصول «پاگرد» را در `app/login/page.tsx` نشان ندهید. پوسته می‌تواند آن را نگه دارد.
- ورود همیشه رمز و پیامک را با هم نشان می‌دهد. هیچ‌کدام را با تنظیم `auth_method` ساکنان پنهان نکنید.
- دکمهٔ ورود تا گذر از قاعده‌های زیر `disabled` می‌ماند و `pointer-events: none` دارد. در خود هندلر ارسال هم زود برگردید.
- موبایل بعد از `toLatinDigits`: `^09\d{9}$`. رمز: بعد از trim خالی نباشد. کد: بعد از `toLatinDigits` دقیقاً `^\d{5}$`.
- از صفحه `fetch` نزنید. از `http` در `lib/http.ts` و مسیرهای `lib/endpoints.ts` استفاده کنید.
- بدنه را از `response.items` بخوانید. شکل JSON ادمین `items` و `message` و `errors` و در صورت وجود `token` است.
- بررسی دسترسی با `useAuth().can` است. صفحهٔ تازه یک مورد در `components/nav.ts` می‌گیرد. میانبر داشبورد از همان فهرست می‌آید.
- شناسهٔ کاربر در این رابط عدد است. آن را Hashid نکنید.
- در بک‌اند پیش از `User::create` یا `update` رمز را `Hash::make` نکنید. cast رمز کاربر خودش هش می‌کند.
- سیستم ظاهر دوم نسازید. از توکن‌های `app/globals.css` و `components/ui.tsx` استفاده کنید.
- پیش از استفاده از API ای در Next که ممکن است با نسخه‌های قدیمی فرق داشته باشد، راهنمای متناظر را در `node_modules/next/dist/docs/` بخوانید.
- تغییر رابط را در مرورگر روی `http://127.0.0.1:3001` واقعاً انجام دهید، نه فقط با یک عکس. اگر چیدمان عوض شده، پوستهٔ روشن و تیره و عرض کم را هم ببینید.
- تا کاربر نخواسته کامیت نسازید.

## کجا عوض شود

| کار | فایل |
| --- | --- |
| صفحهٔ تازه | `app/(panel)/<name>/page.tsx` و بعد `components/nav.ts` |
| کنترل مشترک | `components/ui.tsx` |
| فعل HTTP یا خواندن خطا | `lib/http.ts` |
| آدرس تازهٔ ادمین | `modules/<Module>/routes/Admin/V1.php` در بک‌اند، بعد `lib/endpoints.ts` و `lib/types.ts` |
| نشست، ریدایرکت، `can` | `lib/auth.tsx` |
| روشن و تیره | `lib/theme.tsx`، کوکی `admin_theme`، توکن‌ها در `app/globals.css` |
| رقم، نام، پول | `lib/format.ts` |
| FormData | `lib/form.ts` |
| GET | `useQuery` از `lib/use-query.ts` |
| ارسال و نشان دادن نتیجه | `useAction` از `lib/use-action.ts` |

`useQuery(path)` تا رسیدن پاسخ بعدی، `data` قبلی را نگه می‌دارد. برای نزدن درخواست `null` بدهید. `useAction().run(action, fallback)` مقدار `pending` را می‌گذارد، خطای قبلی را پاک می‌کند، و اگر رشته برگردد آن را در `message` می‌گذارد.

صفحه نازک بماند. اگر چند فرم در یک صفحه است، مثل `app/(panel)/users/[id]/sections.tsx` و `wallet-panel.tsx` فرم‌ها را کنار صفحه جدا کنید.

## قرارداد بک‌اند

مسیرها از `routes/api.php` با پیشوند `admin` می‌آیند، روی پیشوند `/api` خود لاراول.

| پیشوند ماژول | مسیرها | دسترسی |
| --- | --- | --- |
| `account-service/v1` | `POST login` و `POST otp/send` و `POST otp/verify` | عمومی، با throttle |
| همان | `POST logout` و `GET me` و `GET dashboard` | نشست ادمین |
| همان | CRUD کاربران | `users.view` و `users.create` و `users.edit` و `users.delete` |
| `acl-service/v1` | دسترسی‌ها، CRUD نقش، `PUT users/{user}/roles` | `roles.view` یا `roles.manage` |
| `wallet-service/v1` | `GET users/{user}/wallet` و `POST .../adjust` | `wallet.view` و `wallet.adjust` |
| `bill-service/v1` | سرویس‌ها، `refresh-cache`، `finnotech-token` | `bills.view` و `bills.manage` |
| `payment-service/v1` | درگاه و `refresh-cache` | `payments.view` و `payments.manage` |
| `setting-service/v1` | `GET/PATCH settings` | `settings.manage` |

مسیرهای محافظت‌شده `auth:sanctum` و `admin` یعنی `EnsureAdmin` دارند. `CheckPermission` از `$request->user()` می‌خواند.

نقش `super_admin` از صفحهٔ نقش حذف نمی‌شود. نگهبان همین نام `super_admin` است.

ورود ادمین اگر حساب باشد ولی نقش مدیریتی نداشته باشد با `ResponseBuilder` وضعیت ۴۰۳ می‌دهد. ارسال کد هم همین کار را می‌کند و کاربر نمی‌سازد.

JSON اعتبارسنجی و throttle هم از `ResponseBuilder` می‌آید. throttle هدر `Retry-After` را نگه می‌دارد.

`auth_method` در تنظیمات فقط برای اپ ساکنان است: `password` یا `otp` یا `both`.

نوع واریز در کلاینت `DEPOSIT = 1` داخل `lib/types.ts` است. بدنهٔ تغییر موجودی `{ type: "deposit" | "withdraw", amount, description }` است.

## اجرای محلی

روی خود سیستم PHP نیست. دستور بک‌اند:

```bash
cd ../my-apartment-backend
docker compose up -d
docker compose exec app php artisan migrate --seed
docker compose exec app php vendor/bin/phpunit modules/Account/Tests/Feature/AdminApiTest.php --no-coverage
```

دستور پنل، داخل همین مخزن:

```bash
npm run dev
./node_modules/.bin/tsc --noEmit
npm run lint
```

`npx tsc` ممکن است بستهٔ بی‌ربط `tsc` را نصب کند. از آن استفاده نکنید.

ورود سید تازه، فقط محلی: موبایل `09129538215` و رمز `123456789` از `DatabaseSeeder.php`.

`SMS_DEFAULT_PROVIDER=log` است. کد به گوشی نمی‌رسد. برای رسیدن کد به لاگ لاراول باید `otp-worker` بالا باشد. ورود با رمز به آن نیاز ندارد.

اگر ورود در چند میلی‌ثانیه شکست بخورد، درخواست به `Auth::attempt` نرسیده است. علت معمول: API روی پورت ۸۰۰۰ گوش نمی‌دهد، یا اعتبار موبایل رد شده است. بررسی واقعی رمز به‌طور محسوس بیشتر طول می‌کشد.

CORS مقدار `*` را اجازه می‌دهد و `supports_credentials` برابر false است. پنل را بدون تصمیم جداگانه به احراز کوکی عوض نکنید.

## پوسته و فونت

`app/layout.tsx` کوکی `admin_theme` را روی سرور می‌خواند. `lib/theme.tsx` مقدار `light` یا `dark` را اعمال می‌کند و کوکی را می‌نویسد. اگر کوکی نباشد و سیستم تیره بخواهد، اسکریپت اولیه همان بار اول را می‌پوشاند.

رنگ‌ها متغیر CSS روی `:root` و `.dark` هستند. کامپوننت‌ها از `bg-canvas` و `bg-surface` و `text-ink` و `text-muted` و `border-line` و `bg-primary` و `text-primary-ink` استفاده می‌کنند. برای سطحی که باید با پوسته عوض شود `slate` یا `white` ثابت نگذارید.

فونت‌ها: `app/fonts/iranyekan/Woff2/IRANYekanXFaNum-*.woff2` با متغیر `--font-app`. خانواده FaNum است، پس رقم نقاشی‌شده فارسی دیده می‌شود حتی اگر رشته لاتین باشد.

## رفتار ورود که باید بماند

`app/login/page.tsx` هر دو روش را دارد. `toLatinDigits` یک‌بار دیگر داخل `lib/auth.tsx` پیش از بدنهٔ JSON اجرا می‌شود. میان‌افزار `NormalizeRequestNumbers` در بک‌اند هم بدنهٔ JSON را بازنویسی می‌کند. هر دو را نگه دارید.

فرم خالی یا نامعتبر نه با کلیک ارسال شود و نه با Enter.

## توسعهٔ بی‌خطر

قابلیت تازهٔ ادمین معمولاً هر دو مخزن را لمس می‌کند:

1. در بک‌اند مسیر، کنترلر و کلید دسترسی را اضافه کنید. خروجی `ResponseBuilder` باشد.
2. در این مخزن مسیر و نوع TypeScript را اضافه کنید.
3. صفحه را با `Screen` و `PageHeader` و `Field` یا `SelectField` و `Notices` و `useQuery` / `useAction` بسازید.
4. آن را در `navItems` با همان رشتهٔ دسترسی میان‌افزار ثبت کنید.
5. با `tsc` محلی نوع را چک کنید. بعد جریان تازه را در روشن و تیره، و اگر چیدمان می‌شکند در پنجرهٔ باریک، واقعاً طی کنید.

کتابخانهٔ state، کیت کامپوننت، یا پوشش HTTP دوم کنار `lib/http.ts` اضافه نکنید.

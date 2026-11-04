export function toLatinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\s/g, "");
}

export function isIranMobile(value: string) {
  return /^09\d{9}$/.test(toLatinDigits(value));
}

export function isOtpCode(value: string) {
  return /^\d{5}$/.test(toLatinDigits(value));
}

export function fullName(user: { first_name: string | null; last_name: string | null }) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || "بدون نام";
}

export function faNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

export function toggleId(ids: number[], id: number, checked: boolean) {
  return checked ? [...ids, id] : ids.filter((item) => item !== id);
}

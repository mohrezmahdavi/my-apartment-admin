export function toLatinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\s/g, "");
}

export function digitsOnly(value: string) {
  return toLatinDigits(value).replace(/[^\d]/g, "");
}

export function groupThousands(value: string | number) {
  const digits = digitsOnly(String(value));
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function parseAmount(value: string) {
  const digits = digitsOnly(value);
  return digits ? Number(digits) : 0;
}

export function applyAmountGrouping(input: HTMLInputElement) {
  const digitCount = digitsOnly(input.value.slice(0, input.selectionStart ?? input.value.length)).length;
  input.value = groupThousands(input.value);
  if (digitCount === 0) {
    input.setSelectionRange(0, 0);
    return;
  }
  let seen = 0;
  for (let index = 0; index < input.value.length; index += 1) {
    if (/\d/.test(input.value[index] ?? "")) seen += 1;
    if (seen === digitCount) {
      input.setSelectionRange(index + 1, index + 1);
      return;
    }
  }
  input.setSelectionRange(input.value.length, input.value.length);
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

export function toman(value: number) {
  return `${faNumber(value)} تومان`;
}

export function periodLabel(days: number) {
  return days > 0 ? `${faNumber(days)} روز` : "یک ماه شمسی";
}

export function faDate(value: string) {
  return new Date(value).toLocaleDateString("fa-IR");
}

export function toggleId(ids: number[], id: number, checked: boolean) {
  return checked ? [...ids, id] : ids.filter((item) => item !== id);
}

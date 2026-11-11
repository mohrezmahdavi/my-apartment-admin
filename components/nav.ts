import type { ComponentType } from "react";
import { BuildingIcon, CardIcon, GridIcon, ReceiptIcon, ShieldIcon, SlidersIcon, SupportIcon, UsersIcon } from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  permission: string | null;
  description?: string;
  icon: ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  { href: "/", label: "داشبورد", permission: null, icon: GridIcon },
  { href: "/users", label: "کاربران", permission: "users.view", description: "جستجو، ساخت و ویرایش حساب‌ها", icon: UsersIcon },
  { href: "/buildings", label: "ساختمان‌ها", permission: "buildings.view", description: "لیست ساختمان‌ها و اشتراک هر کدام", icon: BuildingIcon },
  { href: "/roles", label: "نقش‌ها", permission: "roles.view", description: "دسترسی‌ها و نقش‌های مدیریتی", icon: ShieldIcon },
  { href: "/bills", label: "قبض‌ها", permission: "bills.view", description: "سرویس استعلام و کارمزد", icon: ReceiptIcon },
  { href: "/payments", label: "درگاه پرداخت", permission: "payments.view", description: "درگاه فعال و کارمزد شارژ", icon: CardIcon },
  { href: "/support", label: "پشتیبانی", permission: "support.view", description: "درخواست‌های کاربران", icon: SupportIcon },
  { href: "/subscriptions", label: "اشتراک ساختمان", permission: "subscriptions.view", description: "پلن‌ها و قفل اشتراک", icon: ReceiptIcon },
  { href: "/sms-packages", label: "بسته‌های پیامک", permission: "sms_packages.view", description: "قیمت و تعداد پیامک یادآوری", icon: CardIcon },
  { href: "/settings", label: "تنظیمات", permission: "settings.manage", description: "ورود اپلیکیشن و پوش", icon: SlidersIcon },
];

export function isNavActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

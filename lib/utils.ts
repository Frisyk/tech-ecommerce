import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from "nanoid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null) {
  if (price === null) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
  }).format(price);
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10)

export function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

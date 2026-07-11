import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const shortenToken = (token) => {
  if (!token) return '';
  if (token.length <= 15) return token;
  return `${token.slice(0, 6)}...${token.slice(-6)}`;
};

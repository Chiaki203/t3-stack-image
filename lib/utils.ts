import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const postPerPage = 2
export const userPostPerPage = 2
export const commentPerPage = 2

export const MAX_COUNT = 5
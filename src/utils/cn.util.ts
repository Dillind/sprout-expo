import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * `cn` is a combination of twMerge & clsx. Makes conditional styling much simpler to use and readable.
 * See:
 * - https://github.com/lukeed/clsx
 * - https://github.com/dcastil/tailwind-merge
 */
export default function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

/**
 * Helper type for defining types for the 'classnames' pattern.
 */
export type ClassValues<Keys extends string> = Partial<Record<Keys, ClassValue>>;

export { type ClassValue } from 'clsx';

import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Composition de classes du design system.
 *
 * `twMerge` nu classe `text-control`, `text-heading`… comme des COULEURS : mis en
 * conflit avec une vraie couleur (`text-foreground`), le palier de taille serait
 * supprimé du DOM. On lui apprend donc les paliers du DS comme groupe `font-size`.
 * Une app qui compose ses classes passe par `cn` : les paliers y sont déjà.
 */
const PALIERS_TYPO = [
  'display-xl', 'display', 'heading-xl', 'heading', 'subheading',
  'heading-sm', 'body-lg', 'body', 'body-sm', 'control', 'caption', 'eyebrow', 'chip',
] as const;

const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: [...PALIERS_TYPO] }] } },
});

export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return twMerge(classes.filter(Boolean).join(' '));
}

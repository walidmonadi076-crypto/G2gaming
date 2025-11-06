export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normalise les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/[^\w-]+/g, '') // Supprime les caractères non alphanumériques (sauf les tirets)
    .replace(/--+/g, '-'); // Remplace les tirets multiples par un seul
}

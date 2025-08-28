/**
 * Formats a string to Title Case, but keeps specified abbreviations and all-caps words in uppercase.
 * e.g., "cemerlang tki" with abbreviation "TKI" becomes "Cemerlang TKI".
 * e.g., "cemerlang BDG" becomes "Cemerlang BDG" automatically.
 * @param name The string to format.
 * @param abbreviations A list of predefined abbreviations to keep in uppercase.
 * @returns The formatted string.
 */
export function formatDisplayName(name: string, abbreviations: string[]): string {
  if (!name) return "";

  const lowerCaseAbbreviations = abbreviations.map(abbr => abbr.toLowerCase());

  return name
    .split(' ')
    .map(word => {
      if (!word) return "";

      // 1. Check predefined abbreviations list (case-insensitive)
      const lowerWord = word.toLowerCase();
      const abbrIndex = lowerCaseAbbreviations.indexOf(lowerWord);
      if (abbrIndex !== -1) {
        return abbreviations[abbrIndex]; // Use the original cased abbreviation from the DB
      }

      // 2. Heuristic: if the word is all-caps, treat it as an abbreviation
      // (Added check for length > 1 to avoid single letters like 'A')
      if (word.length > 1 && word === word.toUpperCase()) {
        return word;
      }

      // 3. Default to standard Title Case for all other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
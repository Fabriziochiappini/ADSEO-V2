/**
 * Prettifies a domain string into a readable Brand Name.
 * Example: "palestradigitaleapp.it" -> "Palestra Digitale App"
 */
export function prettifyDomainToBrand(domain: string): string {
    // Remove protocol and extensions
    let name = domain.replace(/^https?:\/\//i, '')
        .split('/')[0]
        .replace(/\.(it|online|com|net|org|eu|info|biz|site|website|top|shop|cloud|digital)$/i, '')
        .replace(/\./g, ' ');

    // Capitalize each word
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
}

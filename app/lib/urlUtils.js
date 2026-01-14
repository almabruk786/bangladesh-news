export const generateSeoUrl = (title, id) => {
    if (!title) return `news/${id}`;

    // Convert title to slug
    let slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-') // Allow Bengali chars + alphanumeric
        .replace(/^-+|-+$/g, ''); // Trim edges

    // Critical: Limit length to prevent ENAMETOOLONG errors (filesystem limits)
    if (slug.length > 80) {
        slug = slug.substring(0, 80).replace(/-+$/, '');
    }

    return `${slug}-${id}`;
};

export const extractIdFromUrl = (slugId) => {
    if (!slugId) return null;

    // Decode first to handle percent-encoded Bangla URLs
    const decoded = decodeURIComponent(slugId);

    // ID is always the last part after the last hyphen
    const parts = decoded.split('-');
    return parts[parts.length - 1];
};

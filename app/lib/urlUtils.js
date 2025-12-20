export const generateSeoUrl = (title, id) => {
    if (!title) return `news/${id}`;

    // Convert title to slug
    const slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-') // Allow Bengali chars + alphanumeric, replace others with hyphen
        .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens

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

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
    // ID is always the last part after the last hyphen
    // Assuming standard IDs don't have hyphens or we split loosely.
    // If ID is Firestore ID (alphanumeric approx 20 chars), we can try to extract.

    // Strategy: Split by hyphen, take the last part.
    const parts = slugId.split('-');
    return parts[parts.length - 1];
};

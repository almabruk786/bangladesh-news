export const formatIsoDate = (dateInput) => {
    if (!dateInput) return new Date().toISOString();

    let date;
    // Handle Firestore Timestamp
    if (typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
    } else {
        date = new Date(dateInput);
    }

    // Check for invalid date
    if (isNaN(date.getTime())) {
        return new Date().toISOString(); // Fallback to now
    }

    return date.toISOString();
};

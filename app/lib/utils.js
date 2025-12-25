export function parseNewsContent(content) {
    if (!content) return "";
    let cleanContent = content;

    try {
        // Strategy 1: Is it already a valid JSON string?
        const straightParse = JSON.parse(content);
        if (straightParse.body) return straightParse.body;
    } catch (e) { }

    // Strategy 2: Try finding embedded JSON object (with braces)
    try {
        const firstOpen = content.indexOf('{');
        const lastClose = content.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const jsonStr = content.substring(firstOpen, lastClose + 1);
            const parsed = JSON.parse(jsonStr);
            if (parsed.body) return parsed.body;
        }
    } catch (e) { }

    // Strategy 3: Handle "headline": "...", "body": "..." (missing braces)
    if (content.includes('"body":') || content.includes('"headline":')) {
        try {
            // Check if it's just missing wrapper braces
            // We need to be careful not to double wrap if braces are somehow there but malformed
            if (!content.trim().startsWith('{')) {
                const wrapped = `{${content}}`;
                const parsed = JSON.parse(wrapped);
                if (parsed.body) return parsed.body;
            }
        } catch (e) { }

        // Strategy 4: Regex fallback for "body": "..." as a last resort
        // Matches "body": "ANYTHING NO QUOTE OR ESCAPED QUOTE"
        try {
            const bodyMatch = content.match(/"body"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (bodyMatch && bodyMatch[1]) {
                // Unescape JSON string content manually since we extracted it via regex
                return bodyMatch[1]
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\')
                    .replace(/\\n/g, '\n')
                    .replace(/\\t/g, '\t');
            }
        } catch (e) { }
    }

    return cleanContent;
}

export function stripHtml(html) {
    if (!html) return "";

    // 1. Decode entities (basic set)
    const decoded = html
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"');

    // 2. Strip tags
    return decoded.replace(/<[^>]+>/g, '').trim();
}

export function getSmartExcerpt(content, wordLimit = 25) {
    if (!content) return "";

    // 1. Parse JSON if applicable and strip HTML
    const plainText = stripHtml(parseNewsContent(content));

    // 2. Split into words
    const words = plainText.split(/\s+/);

    // 3. Check if we need to truncate
    if (words.length <= wordLimit) return plainText;

    // 4. Truncate and add ellipsis
    return words.slice(0, wordLimit).join(" ") + "...";
}

export function getBanglaRelativeTime(dateInput) {
    if (!dateInput) return "";

    const now = new Date();
    const date = new Date(dateInput);
    const diffInSeconds = Math.floor((now - date) / 1000);

    const toBanglaDigit = (num) => num.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

    if (diffInSeconds < 60) {
        return "এইমাত্র";
    }

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) {
        return `${toBanglaDigit(minutes)} মিনিট আগে`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${toBanglaDigit(hours)} ঘণ্টা আগে`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `${toBanglaDigit(days)} দিন আগে`;
    }

    // Default to full date if older than 7 days
    return date.toLocaleDateString("bn-BD", { day: 'numeric', month: 'long', year: 'numeric' });
}

export function extractYoutubeVideoId(content) {
    if (!content) return null;
    // Match youtube.com/embed/VIDEO_ID or youtu.be/VIDEO_ID
    const regex = /(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{11})/;
    const match = content.match(regex);
    return match ? match[1] : null;
}



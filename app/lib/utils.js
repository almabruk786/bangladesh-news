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

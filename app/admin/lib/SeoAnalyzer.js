/**
 * SEO Analysis Helper
 * Grades content based on basic SEO principles.
 * Returns a score (0-100) and specific feedback.
 */

export function analyzeSeo(article) {
    let score = 100;
    const issues = [];
    const good = [];

    // 1. Title Analysis
    if (!article.title) {
        score -= 20;
        issues.push("Missing Title");
    } else {
        if (article.title.length < 30) {
            score -= 10;
            issues.push("Title too short (< 30 chars)");
        } else if (article.title.length > 70) {
            score -= 5;
            issues.push("Title too long (> 70 chars)");
        } else {
            good.push("Title length is optimal");
        }
    }

    // 2. Content Analysis
    if (!article.content) {
        score -= 30;
        issues.push("Missing Content");
    } else {
        const wordCount = article.content.split(/\s+/).length;
        if (wordCount < 300) {
            score -= 20;
            issues.push(`Content is thin (${wordCount} words). Aim for 600+`);
        } else {
            good.push(`Good content length (${wordCount} words)`);
        }
    }

    // 3. Keyword Check (Basic) - uses title words in body
    if (article.title && article.content) {
        const titleWords = article.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
        const contentLower = article.content.toLowerCase();
        const foundKeywords = titleWords.filter(w => contentLower.includes(w));

        if (foundKeywords.length < 1) {
            score -= 10;
            issues.push("Title keywords not found in body content");
        } else {
            good.push("Keywords properly distributed");
        }
    }

    // 4. Image Check
    if (!article.imageUrl && (!article.imageUrls || article.imageUrls.length === 0)) {
        score -= 15;
        issues.push("No featured image found");
    } else {
        good.push("Featured image present");
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    return { score, issues, good };
}

export const SEO_CONFIG = {
    // 0-100 Score Thresholds
    good: 80,
    average: 50,
};

// 🇧🇩 Bangla Power Words (Viral/Emotional Triggers)
const POWER_WORDS = [
    'ব্রেকিং', 'ভিডিও', 'ভাইরাল', 'শকিং', 'ফাঁস', 'গোপন', 'চমক', 'অবিশ্বাস্য',
    'ভয়ংকর', 'মর্মান্তিক', 'লাইভ', 'এক্সক্লুসিভ', 'সতর্কতা', 'জরুরি',
    'আবেগঘন', 'তোলপাড়', 'লঙ্কাকাণ্ড', 'ইতিহাস', 'লজ্জা', 'গর্ব',
    'হুলস্থুল', 'রহস্য', 'খুন', 'হত্যা', 'ধর্ষণ', 'গ্রেফতার', 'মামলা',
    'রায়', 'নজির', 'রেকর্ড', 'সেরা', 'শীর্ষ', 'প্রথম', 'শেষ'
];

// 🛑 Common Bangla Stop Words (Ignored in Keyword Density)
const STOP_WORDS = new Set([
    'ও', 'এবং', 'কিন্তু', 'অথবা', 'নয়', 'না', 'কি', 'কী', 'কেন', 'কেমন', 'কোথায়',
    'কবে', 'যখন', 'তখন', 'যে', 'কে', 'কার', 'কাকে', 'জন্য', 'থেকে', 'পর', 'পর্যন্ত',
    'করে', 'করা', 'হয়', 'হচ্ছে', 'হবে', 'ছিল', 'আছে', 'নেই', 'একটি', 'টি', 'গুলো',
    'এর', 'কে', 'তে', 'র', 'ব', 'ই', 'সহ', 'নিয়ে', 'দিয়ে', 'দ্বারা', 'কর্তৃক'
]);

// 🎭 Sentiment Dictionaries
const POSITIVE_WORDS = ['জয়', 'সাফল্য', 'বড়', 'সেরা', 'অর্জন', 'নতুন', 'ভালো', 'উন্নতি', 'রেকর্ড', 'স্বস্তি', 'শুভ', 'চমৎকার', 'গর্ব'];
const NEGATIVE_WORDS = ['মৃত্যু', 'হত', 'আহত', 'ধ্বংস', 'ক্ষতি', 'শঙ্কা', 'ভয়', 'দুর্ঘটনা', 'মামলা', 'পতন', 'সঙ্কট', 'ব্যর্থ', 'নিন্দা', 'বিক্ষোভ'];

// 🛑 Passive Voice Patterns (Weak Writing)
const PASSIVE_PATTERNS = [
    /করা হয়েছে/g, /দেখা গিয়েছে/g, /বলা হয়েছে/g, /নেওয়া হয়েছে/g, /জানানো হয়েছে/g, /পাওয়া গেছে/g
];

// ⚠️ AdSense Risk Dictionaries (Prohibited Content)
const ADSENSE_RISK_WORDS = {
    gambling: ['বাজি', 'ক্যাসিনো', 'লটারি', 'জুয়া', 'বেটিং', 'Betting', 'Casino'],
    adult: ['১৮+', 'নীল ছবি', 'রগরগে', 'অশ্লীল', 'সেক্স', 'পর্ণ'],
    violence: ['বোমা', 'জঙ্গি', 'খুন', 'হত্যা', 'আত্মহত্যা', 'রক্তপাত'], // Context warning
};

/**
 * 🕵️ Primary Analysis Function
 */
export const analyzeContent = (data) => {
    const { title = '', content = '', tags = [], imageUrls = [], category = '' } = data;
    const plainText = content.replace(/<[^>]+>/g, ' '); // Strip HTML
    const sentences = plainText.split(/[।!?|]/).filter(s => s.trim().length > 0);
    const words = plainText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    let score = 0;
    let problems = [];
    let criticals = [];
    let goodPoints = [];

    // --- 0. ADSENSE SAFETY GUARD 🛡️ (New) ---
    let adSenseRisk = { label: 'Safe ✅', level: 'safe', warnings: [] };

    // Check Gambling
    const gamblingMatches = ADSENSE_RISK_WORDS.gambling.filter(w => plainText.includes(w));
    if (gamblingMatches.length > 0) {
        adSenseRisk.level = 'danger';
        adSenseRisk.label = 'Policy Violation';
        criticals.push(`Gambling words detected (${gamblingMatches.join(', ')}). Strict AdSense Violation!`);
    }

    // Check Adult
    const adultMatches = ADSENSE_RISK_WORDS.adult.filter(w => plainText.includes(w));
    if (adultMatches.length > 0) {
        adSenseRisk.level = 'danger';
        adSenseRisk.label = 'Adult Content';
        criticals.push(`Restricted content words detected (${adultMatches.join(', ')}). AdSense may block this page.`);
    }

    // Check Violence (Allow minor usage for news, warn on excess)
    const violenceCount = ADSENSE_RISK_WORDS.violence.reduce((acc, w) => acc + (plainText.match(new RegExp(w, 'g')) || []).length, 0);
    if (violenceCount > 5) {
        if (adSenseRisk.level === 'safe') adSenseRisk.level = 'warning';
        adSenseRisk.label = 'Sensitive/Violence';
        problems.push(`High violence keywords (${violenceCount}+). Ensure this is news reporting, not glorification.`);
    }

    if (adSenseRisk.level === 'safe') {
        score += 10;
        goodPoints.push('AdSense Safety Check Passed');
    }

    // --- 1. READABILITY & SENTIMENT (New Power Up ⚡) ---

    // Avg Sentence Length
    const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
    let readabilityScore = 'Easy';
    if (avgSentenceLength > 20) {
        readabilityScore = 'Hard';
        problems.push('Sentences are too long (Avg > 20 words). Shorten them for mobile readers.');
    } else if (avgSentenceLength > 15) {
        readabilityScore = 'Medium';
    } else {
        score += 10;
        goodPoints.push('Readability is Excellent (Short, snappy sentences).');
    }

    // Passive Voice Check
    let passiveCount = 0;
    PASSIVE_PATTERNS.forEach(regex => {
        const matches = content.match(regex);
        if (matches) passiveCount += matches.length;
    });

    if (passiveCount > 3) {
        problems.push(`Too much Passive Voice detected (${passiveCount} times). Use Active Voice (e.g. "পুলিশ জানিয়েছে" instead of "জানানো হয়েছে").`);
    } else {
        score += 5;
    }

    // Sentiment Analysis
    let sentimentScore = 0;
    words.forEach(w => {
        if (POSITIVE_WORDS.some(pw => w.includes(pw))) sentimentScore++;
        if (NEGATIVE_WORDS.some(nw => w.includes(nw))) sentimentScore--;
    });

    let sentimentLabel = 'Neutral 😐';
    if (sentimentScore > 2) sentimentLabel = 'Positive 😃';
    if (sentimentScore < -2) sentimentLabel = 'Negative/Serious 😟';
    if (Math.abs(sentimentScore) > 2) {
        score += 5; // Emotional content (Pos or Neg) gets more clicks
        goodPoints.push(`High Emotional Impact detected (${sentimentLabel}). Good for Viral reach.`);
    }

    // --- 2. TITLE OPTIMIZATION (20 Points) ---
    if (title.length >= 10 && title.length <= 80) {
        score += 15;
        goodPoints.push('Title length is optimal');
    } else if (title.length > 80) {
        problems.push('Title is too long (keep under 80 chars)');
    } else {
        criticals.push('Title is too short');
    }

    const hasPowerWord = POWER_WORDS.some(w => title.includes(w));
    if (hasPowerWord) {
        score += 5;
        goodPoints.push('Title contains "Power Words" (High CTR)');
    } else {
        problems.push('Add a Power Word in title for better CTR (e.g. ব্রেকিং, ভিডিও)');
    }

    // --- 3. CONTENT QUALITY (30 Points) ---
    if (wordCount >= 300) {
        score += 20;
        goodPoints.push(`Content length is good (${wordCount} words)`);
    } else if (wordCount > 100) {
        score += 10;
        problems.push('Content is a bit short (<300 words).');
    } else {
        criticals.push('Thin Content! Write at least 300 words.');
    }

    // Paragraph Check (Wall of text)
    const paragraphs = content.split('</p>').length;
    if (paragraphs >= wordCount / 50) { // Avg 50 words per para
        score += 10;
        goodPoints.push('Good paragraph spacing');
    } else {
        problems.push('Paragraphs are too long.');
    }

    // --- 4. KEYWORD & TAGS (20 Points) ---
    if (tags.length >= 3) {
        score += 10;
        goodPoints.push(`${tags.length} Tags added`);
    } else {
        criticals.push('Add at least 3 Tags for SEO');
    }

    // Check if tags appear in text
    const tagsInText = tags.filter(tag => plainText.includes(tag));
    if (tagsInText.length > 0) {
        score += 10;
        goodPoints.push('Tags found in content body');
    } else {
        problems.push('Primary keywords (Tags) not found in content body. Try writing them in the first paragraph.');
    }

    // --- 5. GOOGLE DISCOVER / MEDIA (30 Points) ---
    let discoverEligible = true;
    let discoverReasons = [];

    // Image Check
    if (imageUrls.length > 0) {
        score += 20;
        goodPoints.push('Cover image present');
    } else {
        discoverEligible = false;
        criticals.push('No Cover Image! Not eligible for Google Discover.');
        discoverReasons.push('Missing Image');
    }

    // Engagement Check
    if (hasPowerWord) {
        score += 10;
        discoverReasons.push('High Impact Title');
    } else {
        discoverEligible = false; // Loose rule: usually need punchy titles
        discoverReasons.push('Weak Title for Feed');
    }

    return {
        score: Math.min(100, score),
        wordCount,
        problems,
        criticals,
        goodPoints,
        adSenseRisk,
        readability: {
            score: readabilityScore,
            passiveCount,
            avgSentenceLength: avgSentenceLength.toFixed(1)
        },
        sentiment: {
            label: sentimentLabel,
            score: sentimentScore
        },
        discover: {
            isEligible: discoverEligible,
            reasons: discoverReasons,
            viralWords: POWER_WORDS.filter(w => title.includes(w))
        },
        keywords: extractKeywords(plainText)
    };
};

/**
 * 🔑 Keyword Extraction
 */
const extractKeywords = (text) => {
    const words = text
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));

    // Count frequency
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);

    // Sort by freq
    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => ({
            word,
            count,
            density: ((count / words.length) * 100).toFixed(1) + '%'
        }));
};

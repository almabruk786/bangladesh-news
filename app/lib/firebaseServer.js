import { adminDb } from "./firebaseAdmin";

export const getNews = async () => {
    try {
        // Use firebase-admin for server-side operations
        if (!adminDb) return [];

        const articlesRef = adminDb.collection("articles");
        const snapshot = await articlesRef
            .where("status", "==", "published")
            .orderBy("publishedAt", "desc")
            .select('title', 'category', 'publishedAt', 'updatedAt', 'imageUrl', 'imageUrls', 'isPinned', 'views', 'excerpt', 'status')
            .limit(25)
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            // Ensure specific fields are serializable for Next.js Server Components
            return {
                id: doc.id,
                ...data,
                // serialize timestamps if they exist and are not already strings
                publishedAt: (data.publishedAt && data.publishedAt.toDate) ? data.publishedAt.toDate().toISOString() : data.publishedAt,
                updatedAt: (data.updatedAt && data.updatedAt.toDate) ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            };
        }).filter(doc => !doc.hidden);
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
};

export const getCategories = async () => {
    try {
        // Use firebase-admin for server-side operations
        if (!adminDb) return [];

        const snapshot = await adminDb.collection("categories").orderBy("name").get();

        if (snapshot.empty) return [];

        const cats = snapshot.docs.map(doc => ({
            name: doc.data().name,
            bn: doc.data().bn,
            link: `/category/${doc.data().name}`,
            hot: doc.data().hot,
            order: doc.data().order !== undefined ? doc.data().order : 999
        }));

        // Sort: Order first (asc), then Name (asc)
        cats.sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));

        return cats;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};

export default function sitemap() {
  const baseUrl = 'https://bakalia.xyz';

  return [
    // ১. হোমপেজ
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    // ২. লিগ্যাল পেজ
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    // ৩. ক্যাটাগরি পেজ (উদাহরণ)
    {
      url: `${baseUrl}/?category=politics`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/?category=sports`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/?category=technology`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    // ৪. স্যাম্পল নিউজ (গুগলকে বোঝানোর জন্য যে স্ট্রাকচার ঠিক আছে)
    {
      url: `${baseUrl}/news/sample-news-1`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/news/sample-news-2`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/news/sample-news-3`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];
}
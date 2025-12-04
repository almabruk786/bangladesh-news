export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // এডমিন এবং এপিআই গুগল থেকে লুকিয়ে রাখা হলো
    },
    sitemap: 'https://bakalia.xyz/sitemap.xml', // সাইটম্যাপের লিংক
  }
}
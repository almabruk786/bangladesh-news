export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // এডমিন প্যানেল গুগলে দেখাবে না
    },
    sitemap: 'https://bakalia.xyz/sitemap.xml', // এখানে সাইটম্যাপের লিংক দেখিয়ে দিলাম
  }
}
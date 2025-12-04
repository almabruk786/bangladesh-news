export default function robots() {
  return {
    rules: [
      {
        userAgent: 'Googlebot', // গুগল রোবটের জন্য স্পেশাল নিয়ম
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: '*', // বাকি সবার জন্য নিয়ম
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://bakalia.xyz/sitemap.xml',
  }
}
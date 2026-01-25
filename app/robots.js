export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/private/', '/index', '/index/'],
      },
    ],
    sitemap: 'https://bakalia.xyz/sitemap-index.xml',
  }
}
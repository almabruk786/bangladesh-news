export default function sitemap() {
  const baseUrl = "https://bakalia.xyz";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
    }
  ];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // বিল্ডের সময় ESLint এরর ইগনোর করবে
  eslint: {
    ignoreDuringBuilds: true,
  },
  // টাইপস্ক্রিপ্ট বা ডাটা টাইপ এরর ইগনোর করবে
  typescript: {
    ignoreBuildErrors: true,
  },
  // ইমেজের জন্য কনফিগারেশন (যদি লাগে)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // সব জায়গা থেকে ইমেজ লোড করার পারমিশন
      },
    ],
  },
};

export default nextConfig; 
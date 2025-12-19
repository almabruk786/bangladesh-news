/** @type {import('next').NextConfig} */
const nextConfig = {
  // ১. সব জায়গা থেকে ইমেজ লোড করার পারমিশন
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // ২. টাইপস্ক্রিপ্ট এরর থাকলেও বিল্ড আটকাবে না
  typescript: {
    ignoreBuildErrors: true,
  },

  // Suppress cross-origin warning for local network development
  experimental: {
    turbopack: {
      root: __dirname,
    },
  },
};

// এই লাইনটি .js ফাইলের জন্য জরুরি
module.exports = nextConfig;
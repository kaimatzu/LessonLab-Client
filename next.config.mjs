/** @type {import('next').NextConfig} */
const nextConfig = { 
  reactStrictMode: false, 
  // experimental: {
  //   externalDir: true,
  // },
  typescript: {
    // !! WARN !!
    // TODO: Delete this shit after demo.
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

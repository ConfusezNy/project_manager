/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Lint errors should not block production builds
        // Fix lint issues separately with: npm run lint
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;

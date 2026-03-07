/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Lint errors should not block production builds
        // Fix lint issues separately with: npm run lint
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "4000",
                pathname: "/uploads/**",
            },
        ],
    },
};

export default nextConfig;

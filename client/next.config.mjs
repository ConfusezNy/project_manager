/** @type {import('next').NextConfig} */
const nextConfig = {
    // Standalone output for Docker production build
    output: "standalone",
    eslint: {
        // Lint errors should not block production builds
        // Fix lint issues separately with: npm run lint
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "4000",
                pathname: "/uploads/**",
            },
            {
                protocol: "http",
                hostname: "api.cpeproject.app",
                pathname: "/uploads/**",
            },
            {
                protocol: "https",
                hostname: "api.cpeproject.app",
                pathname: "/uploads/**",
            },
        ],
    },
};

export default nextConfig;

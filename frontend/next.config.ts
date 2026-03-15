import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://localhost:4000/api/:path*",
            },
            {
                source: "/rails/:path*",
                destination: "http://localhost:4000/rails/:path*",
            },
        ];
    },
};

export default nextConfig;
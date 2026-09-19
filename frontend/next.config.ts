import type { NextConfig } from "next";

// Hosting: user site (repo <account>.github.io) phục vụ ở gốc domain → basePath rỗng.
// Nếu sau này host dưới path (project site), build với NEXT_PUBLIC_BASE_PATH=/<path>:
// mọi URL sinh ra và các link <a> nối hằng BASE sẽ tự đúng theo.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

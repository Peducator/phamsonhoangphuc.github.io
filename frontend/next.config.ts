import type { NextConfig } from "next";

// Hosting: GitHub Pages project site (account "Peducator") phục vụ dưới path tên repo
// → CI build với NEXT_PUBLIC_BASE_PATH=/phamsonhoangphuc.github.io. Mọi URL sinh ra
// và các link <a> nối hằng BASE sẽ tự đúng theo.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

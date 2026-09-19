import type { NextConfig } from "next";

// GitHub Pages project site serving tại /<tên-repo>/ — đặt khác rỗng khi build cho Pages
// (workflow CI truyền NEXT_PUBLIC_BASE_PATH=/personal_site). Build local để rỗng.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

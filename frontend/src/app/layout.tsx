import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hoang Phuc — Full-Stack Developer",
  description:
    "Portfolio of Hoang Phuc, a full-stack developer building and deploying things for the web, cloud and infra.",
};

export const viewport: Viewport = {
  themeColor: "#0b0f19",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {/*
          [antd] AntdRegistry: gom CSS-in-JS của antd vào thẻ <style> ngay khi SSR.
          Bắt buộc với App Router, nếu thiếu sẽ bị nháy style (FOUC) ở lần load đầu.
          [antd] Providers: ConfigProvider bọc ngoài để mọi component antd dùng theme dark.
        */}
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}

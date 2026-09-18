"use client";

import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import { antdTheme } from "@/theme";

/**
 * [antd] Cần "use client" vì ConfigProvider dùng React context.
 *
 * Lưu ý về React 19: repo đang dùng antd 6 — bản này đã hỗ trợ React 19 gốc
 * (peerDependencies: react >=18), nên KHÔNG cần cài
 * @ant-design/v5-patch-for-react-19. Gói patch đó chỉ để vá antd v5 chạy trên
 * React 19; cài vào antd 6 là thừa.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>;
}

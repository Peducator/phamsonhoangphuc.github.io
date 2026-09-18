"use client";

import { Layout, Typography } from "antd";
import Container from "./Container";
import { palette } from "@/theme";

/**
 * Footer tối thiểu — ngoài vai trò trang trí, nó còn cho trang thêm độ cao
 * cuộn ở đáy: section #skills là phần cuối nên trước đây không thể cuộn tới
 * đỉnh viewport (bấm menu Skills bị "hụt"). Chiều cao footer bù đúng khoảng
 * thiếu đó (~140px).
 */
export default function Footer() {
  return (
    <Layout.Footer
      style={{
        background: palette.bg,
        borderTop: `1px solid ${palette.border}`,
        paddingBlock: "clamp(56px, 7vw, 84px)",
        // Khoang đệm cuộn cho anchor cuối trang (#skills): phần cuối là section
        // cuối cùng nên cần đủ "đường chạy" bên dưới để cuộn tới đỉnh viewport.
        minHeight: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container>
        <Typography.Text
          style={{
            display: "block",
            textAlign: "center",
            color: palette.textMuted,
            fontSize: 14,
          }}
        >
          © {new Date().getFullYear()} Hoang Phuc · Built with Next.js &amp;
          Ant Design
        </Typography.Text>
      </Container>
    </Layout.Footer>
  );
}

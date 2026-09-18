"use client";

import { Progress, Space, Typography } from "antd";
import type { IconType } from "react-icons";
import { palette } from "@/theme";

/**
 * Một hàng kỹ năng: icon + tên bên trái, phần trăm bên phải, thanh Progress bên dưới.
 * Dựa trên tech-stack.tsx chuẩn antd v5 — khác v5: antd 6 đã đổi tên prop
 * `trailColor` → `railColor` (cũ vẫn chạy nhưng cảnh báo deprecate), và phần
 * fill của thanh line có class riêng `.ant-progress-track` để gắn glow CSS.
 */
export type Skill = {
  name: string;
  Icon: IconType;
  percent: number;
  /** Chấm glow ở đầu thanh (theo thiết kế ở cột PostgreSQL). */
  dot?: boolean;
};

export default function SkillBar({ name, Icon, percent, dot = false }: Skill) {
  return (
    <div style={{ position: "relative" }}>
      {/* Hàng trên: icon + tên trái, số % phải */}
      <Space size={10} align="center" style={{ width: "100%", justifyContent: "space-between" }}>
        <Space size={10} align="center">
          <Icon aria-hidden="true" style={{ fontSize: 20, color: palette.accent }} />
          <Typography.Text strong style={{ fontSize: 15 }}>
            {name}
          </Typography.Text>
        </Space>
        <Typography.Text style={{ fontSize: 15, color: palette.accent, fontWeight: 600 }}>
          {percent}%
        </Typography.Text>
      </Space>

      <Progress
        percent={percent}
        showInfo={false}
        strokeColor={palette.accent}
        railColor="#1a2232" // antd 6: trước đây là `trailColor`
        strokeLinecap="round"
        size={["100%", 6]}
        style={{ margin: 0 }}
        // Glow của phần fill: antd không có token cho hiệu ứng này, và inline style
        // chỉ áp lên lớp rail (nền xám) chứ không lên fill — nên phải chạm class CSS.
        // Vị trí này là một trong hai chỗ được phép dùng CSS thuần (xem README mục 6).
        className="skillbar-progress"
      />

      {/* Chấm glow tại đầu thanh — trang trí thuần, không mang nội dung */}
      {dot && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `calc(${percent}% - 5px)`,
            bottom: -1,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: palette.accent,
            boxShadow: `0 0 10px ${palette.accent}, 0 0 18px rgba(34, 211, 238, 0.6)`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Flex, Space, Tooltip, Typography } from "antd";
import type { IconType } from "react-icons";
import { FaAws } from "react-icons/fa";
import {
  SiCss,
  SiDocker,
  SiGithub,
  SiGithubactions,
  SiHtml5,
  SiJavascript,
  SiNodedotjs,
  SiReact,
} from "react-icons/si";
import { palette } from "@/theme";

/**
 * [antd] Vẫn dùng react-icons cho hàng logo này: @ant-design/icons không có
 * logo thương hiệu (HTML5, React, Node...), antd cũng không khuyến nghị tự vẽ.
 */
type Tech = { label: string; Icon: IconType; color: string };

const TECHNOLOGIES: Tech[] = [
  { label: "HTML5", Icon: SiHtml5, color: "#e34f26" },
  { label: "CSS3", Icon: SiCss, color: "#1572b6" },
  { label: "JavaScript", Icon: SiJavascript, color: "#f7df1e" },
  { label: "React", Icon: SiReact, color: "#61dafb" },
  { label: "Node.js", Icon: SiNodedotjs, color: "#5fa04e" },
  { label: "Docker", Icon: SiDocker, color: "#2496ed" },
  { label: "GitHub", Icon: SiGithub, color: "#ffffff" },
  { label: "GitHub Actions", Icon: SiGithubactions, color: "#2088ff" },
  { label: "AWS", Icon: FaAws, color: "#ff9900" },
];

/** [responsive] glyph co theo bề rộng màn hình, khung bấm vẫn giữ 44px */
const GLYPH_SIZE = "clamp(26px, 3.4vw, 32px)";

import { motion } from "framer-motion";

function TechIcon({ label, Icon, color }: Tech) {
  return (
    <Tooltip title={label}>
      <motion.span
        role="img"
        aria-label={label}
        whileHover={{ y: -5, scale: 1.15, filter: "drop-shadow(0 0 12px currentColor)" }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          // [responsive] 44x44 = đúng mức touch target tối thiểu ở mobile
          minWidth: 44,
          minHeight: 44,
          fontSize: GLYPH_SIZE,
          color,
          cursor: "pointer",
        }}
      >
        <Icon aria-hidden="true" />
      </motion.span>
    </Tooltip>
  );
}

export default function TechStack() {
  return (
    <Flex vertical gap={14} style={{ width: "100%" }}>
      <Typography.Text
        style={{
          fontSize: 14, // [responsive] nâng từ 12px lên 14px cho đủ ngưỡng đọc được
          fontWeight: 500,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: palette.textMuted,
        }}
      >
        Technologies I work with
      </Typography.Text>

      {/* [responsive] Space wrap: mobile tự xuống nhiều dòng thay vì dồn một hàng ngang */}
      <Space size={[10, 6]} wrap>
        {TECHNOLOGIES.map((tech) => (
          <TechIcon key={tech.label} {...tech} />
        ))}
      </Space>
    </Flex>
  );
}

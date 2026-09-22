"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Space,
  Typography,
} from "antd";
import {
  ArrowUpOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import type { IconType } from "react-icons";
import { FaLinkedin } from "react-icons/fa"; // SiLinkedin đã bị simple-icons lược bỏ
import { SiGithub, SiInstagram, SiX } from "react-icons/si";
import Container from "./Container";
import { palette } from "@/theme";
import { motion } from "framer-motion";

/* ============================================================
   Section Contact (#contact) — bố cục 3 cột: CTA / Testimonial / Social.

   Được dựng theo một ảnh mẫu, nhưng MÀU thì đồng bộ 100% với các section
   phía trên: mọi giá trị lấy từ `palette` (src/theme.ts), không hardcode
   theo hex trong ảnh mẫu. Tương ứng cụ thể:
     ảnh mẫu            ->  palette
     #0B0F19 (nền)      ->  palette.bg
     #111827 (card)     ->  palette.surface   (cùng nền với card Skills)
     #22D3EE (cyan)     ->  palette.accent
     #FFFFFF (chữ đậm)  ->  palette.text
     #94A3B8 (chữ mờ)   ->  palette.textMuted
   Các hiệu ứng glow dùng rgba dẫn xuất của palette.accent — cùng cách
   AboutSkills/SkillBar đang làm.
   ============================================================ */

/* ----- Nhãn nhỏ uppercase (badge "Let's Work Together" + "Follow Me") ----- */
const LABEL_STYLE: CSSProperties = {
  // [skill: polish] 14px: chạm ngưỡng đọc được tối thiểu của trang (trước 12px)
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: palette.accent,
};

/* ----- Social links — href đang là placeholder, thay bằng URL thật khi có ----- */
type Social = { label: string; Icon: IconType; href: string };

const SOCIALS: Social[] = [
  { label: "GitHub", Icon: SiGithub, href: "https://github.com/Peducator" },
  { label: "LinkedIn", Icon: FaLinkedin, href: "https://www.linkedin.com/" },
  { label: "X (Twitter)", Icon: SiX, href: "https://x.com/" },
  { label: "Instagram", Icon: SiInstagram, href: "https://www.instagram.com/" },
];

/**
 * Nút social tròn: nền tối, icon sáng, glow cyan khi hover.
 * Làm bằng state giống TechIcon của TechStack — dự án đã bỏ file CSS
 * nên hiệu ứng hover không dùng :hover được.
 */
function SocialIcon({ label, Icon, href }: Social) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -5, scale: 1.15 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44, // đúng mức touch target tối thiểu như các icon khác
        height: 44,
        borderRadius: "50%",
        fontSize: 18,
        color: palette.text,
        background: hovered ? "rgba(0, 112, 243, 0.12)" : palette.surface,
        border: `1px solid ${
          hovered ? "rgba(0, 112, 243, 0.55)" : palette.borderStrong
        }`,
        boxShadow: hovered ? "0 0 16px rgba(0, 112, 243, 0.45)" : "none",
        transition:
          "background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      <Icon aria-hidden="true" />
    </motion.a>
  );
}

/* ----- Một dòng liên hệ: icon cyan + text (mailto: / tel:) ----- */
function ContactRow({
  icon,
  text,
  href,
}: {
  icon: ReactNode;
  text: string;
  href: string;
}) {
  return (
    <Flex gap={8} align="center">
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          color: palette.accent,
          fontSize: 16,
        }}
      >
        {icon}
      </span>
      <a
        href={href}
        style={{ color: palette.text, fontSize: 14, lineHeight: 1.6 }}
      >
        {text}
      </a>
    </Flex>
  );
}

export default function ContactFooter() {
  return (
    <section
      id="contact"
      style={{
        position: "relative",
        overflow: "hidden",
        background: palette.bg,
        // [fix anchor] Đệm cuộn cuối trang: không có footer nữa nên #contact là
        // section cuối — khi bấm menu Contact, trình duyệt hết tài liệu để cuộn
        // và dừng LỆCH vị trí (thấy 160px thay vì 96px). Padding đáy cho phép
        // cuộn đủ sâu để đỉnh section chạm đúng offset header.
        paddingBottom: "clamp(96px, 12vh, 160px)",
      }}
    >
      <Container>
        {/* [responsive] xs = 24 (xếp dọc: CTA -> card -> social),
            md trở lên = 3 cột đều nhau; align="stretch" để card testimonial
            cao bằng 2 cột kia (cùng cách AboutSkills dùng cho lưới stat) */}
        <Row
          gutter={[32, 32]}
          align="stretch"
          style={{ paddingBlock: "clamp(56px, 7vw, 80px)" }}
        >
          {/* ================= CỘT 1 — CTA ================= */}
          <Col xs={24} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              style={{ height: "100%" }}
            >
              <Flex vertical align="flex-start">
              <Typography.Text style={LABEL_STYLE}>
                Let&apos;s Work Together
              </Typography.Text>

              <Typography.Title
                level={2}
                style={{
                  color: palette.text,
                  margin: "8px 0 12px",
                  // cùng cỡ tiêu đề h2 với section About/Skills
                  fontSize: "clamp(1.5rem, 2.6vw, 2rem)",
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                }}
              >
                Have a project in mind?
              </Typography.Title>

              <Typography.Paragraph
                style={{
                  margin: 0,
                  color: palette.textMuted,
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                I&apos;m always open to discussing new projects and
                opportunities. Let&apos;s create something amazing together!
              </Typography.Paragraph>

              {/* Glow cyan đậm hơn primaryShadow mặc định trong theme —
                  đây là nút CTA chính của trang nên được nhấn mạnh */}
              <Button
                type="primary"
                size="large"
                href="mailto:hello@buildops.dev"
                icon={<ArrowUpOutlined />}
                iconPlacement="end" // antd 6: `iconPosition` đã bị deprecate
                className="btn-press"
                style={{
                  marginTop: 24,
                  borderRadius: 12,
                  height: "auto",
                  minHeight: 48,
                  paddingBlock: 12,
                  paddingInline: 24,
                  boxShadow: "0 0 20px rgba(0, 112, 243, 0.4)",
                }}
              >
                Get In Touch
              </Button>
            </Flex>
            </motion.div>
          </Col>

          {/* ================= CỘT 2 — TESTIMONIAL ================= */}
          <Col xs={24} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ height: "100%" }}
            >
              <Card
              variant="outlined" // antd 6: `bordered` đã đổi thành `variant`
              style={{
                height: "100%",
                background: palette.surface, // cùng nền với card Skills
                borderColor: "rgba(0, 112, 243, 0.2)",
                borderRadius: 16,
              }}
              styles={{
                body: {
                  padding: 24,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              {/* Dấu ngoặc kép glow — trang trí thuần */}
              <span
                aria-hidden="true"
                style={{
                  display: "block",
                  color: palette.accent,
                  fontSize: 36,
                  lineHeight: 1,
                  fontFamily: "sans-serif",
                  filter: "drop-shadow(0 0 8px rgba(0, 112, 243, 0.8))",
                }}
              >
                {"\u201C"}
              </span>

              <Typography.Paragraph
                style={{
                  margin: "12px 0 20px",
                  color: palette.text,
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Phúc is a fast, reliable developer who delivers high-quality
                work on time. His attention to detail and problem-solving
                skills are outstanding.
              </Typography.Paragraph>

              {/* marginTop: auto -> dòng tác giả luôn dính đáy card dù quote
                  ngắn/dài, kể cả khi cột bị kéo cao ở desktop */}
              <Flex align="center" gap={12} style={{ marginTop: "auto" }}>
                {/* Chưa có ảnh -> avatar chữ cái; khi có file trong public/
                    chỉ cần đổi thành <Avatar src="/avatar.jpg" size={44} /> */}
                <Avatar
                  size={44}
                  style={{
                    backgroundColor: "rgba(0, 112, 243, 0.14)",
                    color: palette.accent,
                    fontWeight: 600,
                    flex: "0 0 auto",
                  }}
                >
                  MT
                </Avatar>
                <Flex vertical>
                  <Typography.Text strong style={{ color: palette.text }}>
                    Minh Tran
                  </Typography.Text>
                  <Typography.Text
                    style={{ color: palette.accent, fontSize: 12 }}
                  >
                    Teammate, UIT Group Project
                  </Typography.Text>
                </Flex>
              </Flex>
            </Card>
            </motion.div>
          </Col>

          {/* ================= CỘT 3 — SOCIAL + LIÊN HỆ ================= */}
          <Col xs={24} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ height: "100%" }}
            >
              <Flex vertical align="flex-start" gap={16}>
              <Typography.Text style={LABEL_STYLE}>Follow Me</Typography.Text>

              <Space size={12} wrap>
                {SOCIALS.map((social) => (
                  <SocialIcon key={social.label} {...social} />
                ))}
              </Space>

              <Flex vertical gap={10} style={{ marginTop: 6 }}>
                <ContactRow
                  icon={<MailOutlined />}
                  text="hello@buildops.dev"
                  href="mailto:hello@buildops.dev"
                />
                <ContactRow
                  icon={<PhoneOutlined />}
                  text="+1 (555) 123-4567"
                  href="tel:+15551234567"
                />
              </Flex>
            </Flex>
            </motion.div>
          </Col>
        </Row>
      </Container>

    </section>
  );
}

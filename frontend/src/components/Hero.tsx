"use client";

import Image from "next/image";
import { Button, Col, Row, Tag, Typography } from "antd";
import { DownloadOutlined, ExportOutlined } from "@ant-design/icons";
import TechStack from "./TechStack";
import Container from "./Container";
import { goToHash } from "./AnchorLink";
import { palette } from "@/theme";
import { motion, Variants } from "framer-motion";

const PORTRAIT_FILE = "hero-character.png";

// GitHub Pages project site phục vụ dưới path tên repo — link/asset tuyệt đối phải
// nối basePath (CI build với NEXT_PUBLIC_BASE_PATH=/phamsonhoangphuc.github.io).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.6, bounce: 0 } }
};

const floatAnimation: Variants = {
  float: {
    y: ["-3%", "3%"],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

export default function Hero({ hasPortrait }: { hasPortrait: boolean }) {
  return (
    <section id="home" style={{ position: "relative", overflow: "hidden" }}>
      {/* Vệt sáng cyan sau hero — hiệu ứng antd không có token nên giữ bằng inline style */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -220,
          right: -140,
          width: 720,
          height: 720,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,112,243,0.16) 0%, rgba(0,112,243,0.05) 45%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container>
        <Row
          align="middle"
          // [responsive] gutter [dọc, ngang]: khoảng cách 48px ở desktop, antd tự giảm trên mobile
          gutter={[48, 48]}
          style={{
            paddingBlock: "clamp(32px, 6vw, 56px) clamp(48px, 8vw, 88px)",
          }}
        >
          {/* ===== CỘT NỘI DUNG =====
              [responsive] xs/sm = 24 (một cột, nằm trên) — md trở lên = 13/24 như thiết kế desktop */}
          <Col xs={24} sm={24} md={13}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.1 }}
              style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start" }}
            >
              {/* Badge: div + CSS cũ -> antd Tag */}
              <motion.div variants={itemVariants}>
                <Tag
                  style={{
                    margin: 0,
                    paddingBlock: 8,
                    paddingInline: 18,
                    borderRadius: 999,
                    borderColor: palette.borderStrong,
                    // [responsive] đúng ràng buộc "không chữ nào dưới 14px"
                    fontSize: 14,
                    lineHeight: 1.6,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Full-Stack Dev | Cloud &amp; Infra
                </Tag>
              </motion.div>

              {/* Tiêu đề: h1 thuần -> Typography.Title
                  [responsive] clamp: mobile 30px -> tablet ~40px -> desktop 49.6px (giữ nguyên,
                  không dùng media query nên không bị nháy khi tải trang) */}
              <motion.div variants={itemVariants}>
                <Typography.Title
                level={1}
                style={{
                  fontSize: "clamp(1.875rem, 5.2vw, 3.1rem)",
                  fontWeight: 700,
                  lineHeight: 1.13,
                  // [skill: polish] tracking chặt hơn ở cỡ chữ lớn (trước: -0.025em)
                  letterSpacing: "-0.03em",
                  margin: 0,
                  textWrap: "balance",
                }}
              >
                Hi, I&apos;m{" "}
                <span
                  style={{
                    color: palette.accent,
                    // [skill: polish] glow chữ đồng bộ với vòng tròn neon — trước
                    // đây chỉ là chữ màu, thiếu hiệu ứng nổi
                    textShadow:
                      "0 0 24px rgba(0, 112, 243, 0.45), 0 0 64px rgba(0, 112, 243, 0.18)",
                  }}
                >
                  Phạm Sơn Hoàng Phúc
                </span>
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #e8ecf4 30%, rgba(232, 236, 244, 0.55))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  I build and deploy things for the web.
                </span>
                </Typography.Title>
              </motion.div>

              {/* Đoạn mô tả: p thuần -> Typography.Paragraph */}
              <motion.div variants={itemVariants}>
                <Typography.Paragraph                  style={{
                      maxWidth: "32rem",
                      margin: 0,
                      fontSize: "clamp(1rem, 1.5vw, 1.06rem)",
                      lineHeight: 1.65,
                      color: palette.textMuted,
                      textWrap: "pretty",
                    }}
                >
                  {"I build and deploy things for the web, and care about the whole path — from a clean interface to the infrastructure it runs on.".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { duration: 0.1, delay: 0.8 + index * 0.02 } }
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </Typography.Paragraph>
              </motion.div>

              {/* ===== CTA =====
                  [responsive] Dùng Row/Col của antd thay cho flex-wrap:
                  xs = 24/24 -> mỗi nút chiếm cả hàng, xếp dọc, full width trên mobile
                  md = 12/24 -> nằm cạnh nhau từ 768px trở lên (tablet/desktop)
                  Cách này cắt đúng mốc 768px; nếu chỉ dùng flex-basis thì 2 nút vẫn
                  nằm cạnh nhau ở các máy 400-767px. */}
              <motion.div variants={itemVariants} style={{ width: "100%" }}>
                <Row gutter={[16, 16]} style={{ width: "100%" }}>
                  <Col xs={24} md={12}>
                    <Button
                      type="primary"
                      size="large"
                      block
                      href={`${BASE}/#projects`}
                      icon={<ExportOutlined />}
                      iconPlacement="end" // antd 6: `iconPosition` đã bị deprecate
                      style={{ minHeight: 48, height: "auto", paddingBlock: 13 }}
                      onClick={(e) => goToHash(e, "#projects")}
                    >
                      View My Work
                    </Button>
                  </Col>
                  <Col xs={24} md={12}>
                    <Button
                      size="large"
                      block
                      href={`${BASE}/cv.pdf`}
                      icon={<DownloadOutlined />}
                      iconPlacement="end"
                      style={{ minHeight: 48, height: "auto", paddingBlock: 13 }}
                    >
                      Download CV
                    </Button>
                  </Col>
                </Row>
              </motion.div>

              <motion.div variants={itemVariants}>
                <TechStack />
              </motion.div>
            </motion.div>
          </Col>

          {/* ===== CỘT MINH HOẠ =====
              [responsive] xs/sm = 24 và căn giữa -> ảnh xuống dưới phần chữ, canh giữa;
              md trở lên = 11/24 nằm bên phải như cũ */}
          <Col
            xs={24}
            sm={24}
            md={11}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div
              style={{
                position: "relative",
                display: "grid",
                placeItems: "center",
                // [responsive] co lại theo bề rộng cột, không bao giờ tràn ngang
                width: "100%",
                maxWidth: "min(100%, 470px)",
                minHeight: "clamp(300px, 44vw, 520px)",
              }}
            >
              {/* Vòng tròn glow neon — hiệu ứng antd không hỗ trợ */}
              <motion.div
                animate="float"
                variants={floatAnimation}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  width: "min(100%, 440px)",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  border: "2px solid rgba(0, 112, 243, 0.85)",
                  boxShadow:
                    "0 0 70px rgba(0,112,243,0.35), inset 0 0 90px rgba(0,112,243,0.14)",
                }}
              />

              {hasPortrait ? (
                <motion.div animate="float" variants={floatAnimation} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                  <Image
                    src={`/${PORTRAIT_FILE}`}
                    alt="Illustration of Phạm Sơn Hoàng Phúc working on a laptop"
                    width={640}
                    height={640}
                    priority
                    style={{
                      width: "100%",
                      height: "auto",
                      filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.55))",
                      position: "relative",
                      zIndex: 2,
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  animate="float"
                  variants={floatAnimation}
                  style={{
                    display: "grid",
                    placeItems: "center",
                    gap: 10,
                    width: "min(78%, 360px)",
                    aspectRatio: "1",
                    padding: 24,
                    border: `1px dashed ${palette.borderStrong}`,
                    borderRadius: "50%",
                    textAlign: "center",
                    color: palette.textMuted,
                    fontSize: 14, // [responsive] không nhỏ hơn 14px
                    lineHeight: 1.6,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <span>
                    Đặt ảnh nhân vật 3D vào
                    <br />
                    <code
                      style={{
                        fontFamily: "var(--font-geist-mono), monospace",
                        color: palette.accent,
                      }}
                    >
                      public/{PORTRAIT_FILE}
                    </code>
                  </span>
                </motion.div>
              )}

              {/*
                Card JSON nổi trên minh hoạ đã bỏ theo yêu cầu: card đặt absolute đè
                lên vùng ảnh nên rất dễ méo/che nội dung khi bề rộng cột đổi.
                Phần trang trí còn lại: vòng glow + ảnh nhân vật.
              */}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

"use client";

import {
  Card,
  Col,
  Divider,
  Flex,
  Row,
  Tag,
  Typography,
} from "antd";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import {
  BookOutlined,
  ReadOutlined,
  SmileOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import type { IconType } from "react-icons";
import { FaAws } from "react-icons/fa";
import {
  SiDocker,
  SiExpress,
  SiGit,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiTypescript,
} from "react-icons/si";
import Container from "./Container";
import SkillBar, { type Skill } from "./SkillBar";
import Counter from "./Counter";
import { palette } from "@/theme";

/* ============================================================
   Section "About Me + Skills" — tông màu lấy từ theme của trang
   (src/theme.ts): nền #0b0f19, card #0f1626, nhấn cyan #0070f3.
   Ảnh mẫu có thể sai màu nên tất cả giá trị màu đều lấy từ
   `palette`, không hardcode từ ảnh.
   ============================================================ */

/* ----- dữ liệu stat 2x2 (cột phải của About) ----- */

type Stat = {
  Icon: typeof BookOutlined;
  title: string;
  value: string;
  suffix: string;
  description: string;
};

const STATS: Stat[] = [
  {
    Icon: ReadOutlined,
    title: "CS Education Foundation",
    value: "3",
    suffix: "+",
    description: "Since 2022 | High School CS Gifted | UIT Student",
  },
  {
    Icon: BookOutlined,
    title: "Academic & Personal Projects",
    value: "8",
    suffix: "+",
    description: "Projects Completed During Studies",
  },
  {
    Icon: SmileOutlined,
    title: "Learning Velocity",
    value: "10",
    suffix: "+",
    description: "Technologies Explored in a Short Time",
  },
  {
    Icon: TrophyOutlined,
    title: "Problem Solving Approach",
    value: "100",
    suffix: "%",
    description: "Passion for Code | Eager to Learn",
  },
];

/* ----- dữ liệu kỹ năng: 3 nhóm × 3 thanh (data-driven, không hardcode JSX) ----- */

type SkillGroup = { key: string; skills: Skill[] };

const SKILL_GROUPS: SkillGroup[] = [
  {
    key: "Frontend",
    skills: [
      { name: "React", Icon: SiReact, percent: 68 },
      { name: "Next.js", Icon: SiNextdotjs, percent: 55 },
      { name: "TypeScript", Icon: SiTypescript, percent: 62 },
    ],
  },
  {
    key: "Backend",
    skills: [
      { name: "Node.js", Icon: SiNodedotjs, percent: 70 },
      { name: "Express", Icon: SiExpress, percent: 52 },
      { name: "Docker", Icon: SiDocker, percent: 65 },
    ],
  },
  {
    key: "Cloud & Tools",
    skills: [
      { name: "AWS", Icon: FaAws as IconType, percent: 50 },
      { name: "PostgreSQL", Icon: SiPostgresql, percent: 59 },
      { name: "Git", Icon: SiGit, percent: 57 },
    ],
  },
];

/* ----- khối icon vuông glow dùng chung cho 4 stat ----- */

function StatIcon({ icon: Icon }: { icon: Stat["Icon"] }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        flex: "0 0 auto",
        borderRadius: 12,
        border: `1px solid rgba(0, 112, 243, 0.45)`,
        boxShadow: `0 0 12px rgba(0, 112, 243, 0.3)`,
        background: "rgba(0, 112, 243, 0.06)",
        color: palette.accent,
        fontSize: 20,
      }}
    >
      <Icon />
    </span>
  );
}

/* ----- một ô stat trong lưới 2x2 ----- */

function StatCell({ stat }: { stat: Stat }) {
  return (
    <Flex gap={14} align="flex-start">
      <StatIcon icon={stat.Icon} />
      <Flex vertical gap={6} style={{ minWidth: 0 }}>
        {/* [skill: polish] 3 cấp chữ rõ rệt theo mẫu: eyebrow label mờ -> số lớn
            -> mô tả nhỏ. Trước đây title đậm 15px cạnh số to cùng màu nên phẳng. */}
        <Typography.Text
          style={{
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: palette.textMuted,
          }}
        >
          {stat.title}
        </Typography.Text>
        <Typography.Title
          level={3}
          style={{
            margin: 0,
            lineHeight: 1.15,
            fontWeight: 600,
            // [skill: polish] tabular-nums: các con số stat đổi không rung layout
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <Counter value={stat.value} />
          <span style={{ color: palette.accent }}>{stat.suffix}</span>
        </Typography.Title>
        <Typography.Text
          style={{ fontSize: 13, color: palette.textMuted, lineHeight: 1.5 }}
        >
          {stat.description}
        </Typography.Text>
      </Flex>
    </Flex>
  );
}

export default function AboutSkills() {
  return (
    <section
      id="about"
      style={{
        background: palette.elevated,
        borderTop: `1px solid ${palette.border}`,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      <Container>
        {/* ================= ABOUT ME ================= */}
        <Row
          gutter={[48, 40]}
          align="middle"
          style={{
            paddingBlock: "clamp(48px, 7vw, 72px)",
            // [skill: polish] đường phân cách mảnh giữa 2 khối — "borders for structure",
            // tách About khỏi Skills mà không cần khoảng trống lớn
            borderBottom: `1px solid ${palette.border}`,
          }}
        >
          {/* ----- CỘT TRÁI: giới thiệu -----
              [responsive] xs/sm = 24 (xếp dọc), md trở lên = 12/24 như thiết kế */}
          <Col xs={24} sm={24} md={12}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <Flex vertical align="flex-start" gap={20}>
              <Tag
                style={{
                  margin: 0,
                  paddingBlock: 6,
                  paddingInline: 16,
                  borderRadius: 999,
                  borderColor: palette.borderStrong,
                  fontSize: 14,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                About Me
              </Tag>

              <Typography.Title
                level={2}
                style={{
                  fontSize: "clamp(1.5rem, 2.6vw, 2rem)",
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                I&apos;m a{" "}
                <span style={{ color: palette.accent }}>passionate</span>{" "}
                developer with a strong foundation in computer science.
              </Typography.Title>

              <Typography.Paragraph
                style={{
                  margin: 0,
                  color: palette.textMuted,
                  fontSize: "clamp(1rem, 1.4vw, 1.06rem)",
                  lineHeight: 1.65,
                }}
              >
                As an aspiring web developer from High School CS Gifted | UIT
                6IS, and am currently pursuing my studies at the University of
                Information Technology (UIT). I&apos;m focused on applying my
                skills to real-world challenges and driving continuous
                learning.
              </Typography.Paragraph>


            </Flex>
            </motion.div>
          </Col>

          {/* ----- CỘT PHẢI: lưới 2x2 stat có đường phân cách -----
              Divider type="vertical" của antd 6 đã đổi thành orientation="vertical" */}
          <Col xs={24} sm={24} md={12}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <Row gutter={[24, 28]} align="stretch">
              {STATS.map((stat, index) => (
                <Col
                  key={stat.title}
                  xs={12}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <Flex vertical style={{ flex: 1 }}>
                    <StatCell stat={stat} />
                    {/* Đường kẻ mảnh giữa các ô: sau ô 1 và 2 (kẻ ngang dưới),
                        sau ô 1 và 3 (kẻ dọc phải) — mô phỏng separator mảnh của ảnh mẫu */}
                    {index < 2 && (
                      <Divider
                        style={{
                          margin: "20px 0 0",
                          borderColor: palette.border,
                        }}
                      />
                    )}
                  </Flex>
                </Col>
              ))}
            </Row>
            </motion.div>
          </Col>
        </Row>

        {/* ================= MY SKILLS ================= */}
        {/* Anchor #skills cho menu — đặt ở khối nhãn/heading để khi nhảy tới
            thấy ngay tiêu đề chứ không bị mất đầu phần card. */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.8 }}
          transition={{ duration: 0.6 }}
        >
          <Flex
            id="skills"
            vertical
            align="center"
            gap={10}
            style={{ paddingBlock: "clamp(40px, 6vw, 64px)" }}
          >
            <Typography.Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: palette.textMuted,
              }}
            >
              My Skills
            </Typography.Text>
            <Typography.Title
              level={2}
              style={{
                fontSize: "clamp(1.5rem, 2.6vw, 2rem)",
                fontWeight: 700,
                color: palette.accent,
                margin: 0,
              }}
            >
              Technologies I Master
            </Typography.Title>
            {/* Gạch nhấn ngắn dưới tiêu đề — antd không có primitive này */}
            <div
              aria-hidden="true"
              style={{
                width: 40,
                height: 3,
                borderRadius: 2,
                background: palette.accent,
                boxShadow: `0 0 10px rgba(0, 112, 243, 0.6)`,
              }}
            />
          </Flex>
        </motion.div>

        {/* ----- 3 Card kỹ năng -----
            [responsive] 1 cột ở mobile (24), 3 cột từ lg (1024px) trở lên */}
        <Row gutter={[24, 24]} style={{ paddingBottom: "clamp(48px, 7vw, 80px)" }}>
          {SKILL_GROUPS.map((group, index) => (
            <Col key={group.key} xs={24} sm={24} md={12} lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -5 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                style={{ height: "100%" }}
              >
                <Card
                  variant="outlined" // antd 6: `bordered` đã đổi thành `variant`
                  style={{
                    height: "100%",
                    background: palette.surface,
                    borderColor: "rgba(0, 112, 243, 0.2)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0, 112, 243, 0.6)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 112, 243, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0, 112, 243, 0.2)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
                  }}
                >
                  {/* các SkillBar xếp dọc, giãn đều chiều cao card */}
                  <Flex vertical justify="space-between" gap={24}>
                    {group.skills.map((skill) => (
                      <SkillBar key={skill.name} {...skill} />
                    ))}
                  </Flex>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Col, Drawer, Layout, Menu, Row, Typography } from "antd";
import type { ColProps, MenuProps } from "antd";
import { ExportOutlined, MenuOutlined } from "@ant-design/icons";
import Container from "./Container";
import { palette } from "@/theme";

const NAV_LINKS = [
  { key: "home", label: "Home", href: "/" },
  { key: "about", label: "About", href: "/#about" },
  { key: "skills", label: "Skills", href: "/#skills" },
  { key: "projects", label: "Projects", href: "/#projects" },
  { key: "blog", label: "Blog", href: "/#blog" },
  { key: "contact", label: "Contact", href: "/#contact" },
];

/**
 * [antd] Menu của antd nhận mảng items dạng object thay vì children <li>.
 * Nội dung 6 mục giữ nguyên, chỉ đổi cách khai báo.
 */
const NAV_ITEMS: MenuProps["items"] = NAV_LINKS.map((item) => ({
  key: item.key,
  label: <Link href={item.href}>{item.label}</Link>,
}));

/**
 * [responsive] Công tắc ẩn/hiện dùng đúng Grid của antd, KHÔNG cần media query.
 *
 * Quan trọng — khác antd v5: trong antd 6, class `-xs` được sinh ở dạng BASE
 * (không nằm trong media query, xem genGridStyle(token, '-xs') bỏ ngoài media),
 * còn `-sm` trở lên mới là @media (min-width: ...). Nghĩa là:
 *   - `span: 0` ở xs -> display:none áp cho MỌI bề rộng chưa bị breakpoint lớn hơn ghi đè.
 *   - Vì vậy khi mở lại ở md KHÔNG thể chỉ set `flex`, mà phải set thêm `span`
 *     để antd sinh rule `display: block` ghi đè `display: none`. Truyền flex trong
 *     cùng một breakpoint thì rule -flex được sinh sau nên vẫn thắng về `flex`,
 *     nên Col vẫn rộng đúng theo nội dung thay vì 100%.
 */
const MOBILE_HIDDEN: ColProps["xs"] = { span: 0 };
const DESKTOP_AUTO: ColProps["md"] = { span: 24, flex: "0 0 auto" };
const MOBILE_AUTO: ColProps["xs"] = { flex: "0 0 auto" };

export default function Header() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Giữ nguyên logic active cũ: chỉ mục Home tự nhận active theo pathname
  const selectedKeys = pathname === "/" ? ["home"] : [];

  return (
    <Layout.Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        // Hiệu ứng mờ sau header — antd không có token cho backdrop-filter
        background: "rgba(11, 15, 25, 0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        lineHeight: "normal",
        padding: 0,
      }}
    >
      <Container>
        <Row
          align="middle"
          justify="space-between"
          wrap={false} // [responsive] chặn antd tự đẩy nút xuống dòng thứ hai
          style={{ minHeight: 78 }}
        >
          {/* LOGO — luôn hiển thị, căn trái ở mọi breakpoint */}
          <Col flex="none">
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  color: palette.accent,
                  fontSize: 18,
                  fontWeight: 600,
                  textShadow: "0 0 18px rgba(34, 211, 238, 0.55)",
                }}
              >
                {"</>"}
              </span>
              <Typography.Text strong style={{ fontSize: 21 }}>
                Buildops
              </Typography.Text>
            </Link>
          </Col>

          {/* MENU NGANG — [responsive] ẩn dưới 768px, hiện lại từ md trở lên */}
          <Col flex="auto" style={{ minWidth: 0 }}>
            {/* Col này cố tình nhận span 24 (bề rộng xác định) chứ không phải flex-none:
                Menu ngang của antd đo overflow bên trong, nếu Col co theo nội dung thì
                bề rộng = 0 và menu tự ẩn hết item. span 24 cũng là thứ reset display:none. */}
            <Col xs={MOBILE_HIDDEN} md={{ span: 24 }}>
              <Menu
                mode="horizontal"
                items={NAV_ITEMS}
                selectedKeys={selectedKeys}
                style={{
                  background: "transparent",
                  borderBottom: "none",
                  justifyContent: "center", // căn giữa dải menu trong header
                }}
              />
            </Col>
          </Col>

          {/* NÚT CTA — [responsive] chỉ hiện từ md trở lên (mobile đã có trong Drawer) */}
          <Col xs={MOBILE_HIDDEN} md={DESKTOP_AUTO}>
            <Button
              type="primary"
              shape="round"
              href="/#contact"
              icon={<ExportOutlined />}
              iconPlacement="end" // antd 6: `iconPosition` đã bị deprecate
            >
              Let&apos;s Connect
            </Button>
          </Col>

          {/* HAMBURGER — [responsive] chỉ hiện dưới 768px, thay menu ngang.
              Chiều ẩn này đơn giản hơn: base hiện, md-0 -> @media (min-width:768px) display:none */}
          <Col xs={MOBILE_AUTO} md={{ span: 0 }}>
            <Button
              type="text"
              size="large"
              aria-label="Open navigation menu"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{
                border: `1px solid ${palette.borderStrong}`,
                borderRadius: 8,
              }}
            />
          </Col>
        </Row>
      </Container>

      {/* [responsive] Drawer trượt từ phải — chỉ dùng ở mobile (<768px) */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="right"
        size={300} // antd 6: `width` đã bị deprecate, dùng `size`
        title={<Typography.Text strong>Menu</Typography.Text>}
        styles={{ body: { padding: 16 }, footer: { padding: 16 } }}
        // Nút "Let's Connect" đặt ở đáy drawer theo đúng yêu cầu
        footer={
          <Button
            type="primary"
            block
            size="large"
            href="/#contact"
            icon={<ExportOutlined />}
            iconPlacement="end"
            onClick={() => setDrawerOpen(false)}
          >
            Let&apos;s Connect
          </Button>
        }
      >
        <Menu
          mode="vertical"
          items={NAV_ITEMS}
          selectedKeys={selectedKeys}
          onClick={() => setDrawerOpen(false)}
          style={{ background: "transparent", borderInlineEnd: "none" }}
        />
      </Drawer>
    </Layout.Header>
  );
}

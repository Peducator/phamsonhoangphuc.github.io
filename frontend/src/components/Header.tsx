"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Col, Drawer, Layout, Menu, Row, Typography } from "antd";
import type { ColProps, MenuProps } from "antd";
import { ExportOutlined, MenuOutlined } from "@ant-design/icons";
import AnchorLink, { goToHash, scrollToHash } from "./AnchorLink";
import Container from "./Container";
import { palette } from "@/theme";

// GitHub Pages project site phục vụ dưới path tên repo — link tuyệt đối phải nối
// basePath (CI build với NEXT_PUBLIC_BASE_PATH=/phamsonhoangphuc.github.io).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
// Menu ngang (desktop): cuộn NGAY khi bấm.
const NAV_ITEMS: MenuProps["items"] = NAV_LINKS.map((item) => ({
  key: item.key,
  // AnchorLink tự cuộn với đệm header — fix lỗi nhảy About/Skills sai chỗ
  label: <AnchorLink href={item.href}>{item.label}</AnchorLink>,
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
  // [smooth] Đích neo chờ xử lý: click trong Drawer chỉ ĐÁNH DẤU đích + đóng
  // drawer; việc cuộn diễn ra trong afterOpenChange — đúng khoảnh khắc body
  // được nhả khóa scroll, không còn độ trễ cứng 380ms lơ lửng.
  const [pendingHash, setPendingHash] = useState<string | null>(null);

  // Menu Drawer: chặn native navigation, ghi nhận đích rồi đóng drawer.
  const drawerItems: MenuProps["items"] = NAV_LINKS.map((item) => ({
    key: item.key,
    label: (
      <AnchorLink
        href={item.href}
        onClick={(e) => {
          e.preventDefault(); // AnchorLink thấy defaultPrevented sẽ đứng im
          setPendingHash(item.href);
          setDrawerOpen(false);
        }}
      >
        {item.label}
      </AnchorLink>
    ),
  }));

  // Drawer vừa đóng xong (open=false): cuộn tới đích đã ghi nhận.
  const afterDrawerClose = (open: boolean) => {
    if (open || pendingHash === null) return;
    const hash = pendingHash.includes("#")
      ? pendingHash.slice(pendingHash.indexOf("#"))
      : ""; // link Home "/" -> cuộn về đỉnh trang
    scrollToHash(hash);
    window.history.pushState(null, "", `${BASE}/${hash}`);
    setPendingHash(null);
  };

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
        // [skill: polish] bo góc đồng tâm: section bên dưới + Card 20 -> header 24
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
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
              href={`${BASE}/`}
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
              href={`${BASE}/#contact`}
              icon={<ExportOutlined />}
              iconPlacement="end" // antd 6: `iconPosition` đã bị deprecate
              // [skill: polish] feedback nhấn nút — scale 0.96 chuẩn, transition
              // khai báo đúng property chứ không dùng transition: all
              style={{ scale: "0.96" } as CSSProperties}
              className="btn-press"
              onClick={(e) => goToHash(e, "#contact")}
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
        // [smooth] Cuộn sau khi drawer đóng XONG — không đoán thời lượng animation
        afterOpenChange={afterDrawerClose}
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
            href={`${BASE}/#contact`}
            icon={<ExportOutlined />}
            iconPlacement="end"
            onClick={(e) => {
              // Cùng cơ chế với menu: đánh dấu đích, cuộn khi drawer đóng xong
              e.preventDefault();
              setPendingHash("#contact");
              setDrawerOpen(false);
            }}
          >
            Let&apos;s Connect
          </Button>
        }
      >
        <Menu
          mode="vertical"
          items={drawerItems}
          selectedKeys={selectedKeys}
          onClick={() => setDrawerOpen(false)}
          style={{ background: "transparent", borderInlineEnd: "none" }}
        />
      </Drawer>
    </Layout.Header>
  );
}

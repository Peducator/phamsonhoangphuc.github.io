import { theme, type ThemeConfig } from "antd";

/**
 * [antd] Bảng màu giữ nguyên 100% từ globals.css cũ — không đổi màu nào,
 * chỉ chuyển từ CSS variable sang nguồn duy nhất là file này.
 */
export const palette = {
  bg: "#0b0f19", // nền chính
  surface: "#0f1626", // nền card / khối nổi
  elevated: "#111726", // nền drawer / dải section
  border: "#1e2637",
  borderStrong: "#2c3750",
  text: "#e8ecf4",
  textMuted: "#8d9aae",
  accent: "#22d3ee", // cyan nhấn (giữ đúng hex cũ)
  accentHover: "#4ce0f5",
  accentInk: "#05131a", // chữ trên nền cyan
  badgeText: "#b9c4d6",
} as const;

export const antdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Màu
    colorPrimary: palette.accent,
    colorLink: palette.accent,
    colorInfo: palette.accent,
    colorBgBase: palette.bg,
    colorBgLayout: palette.bg,
    colorBgContainer: palette.surface,
    colorBgElevated: palette.elevated,
    colorText: palette.text,
    colorTextSecondary: palette.textMuted,
    colorTextDescription: palette.textMuted,
    colorBorder: palette.border,
    colorBorderSecondary: palette.border,
    // Hình dạng — bo góc mềm nhất quán như thiết kế cũ
    borderRadius: 10,
    borderRadiusLG: 12,
    borderRadiusSM: 8,
    // Chữ
    fontFamily:
      "var(--font-geist-sans), Inter, 'Segoe UI', system-ui, sans-serif",
    fontSize: 16,
    // [responsive] controlHeight 44 = đúng mức touch target tối thiểu 44px,
    // áp cho MỌI control của antd nên không cần chỉnh tay từng nút.
    controlHeight: 44,
    controlHeightLG: 48,
  },
  components: {
    Layout: {
      headerBg: "transparent",
      headerHeight: 78,
      headerPadding: 0, // padding do component Container lo, không để antd cộng thêm
      bodyBg: palette.bg,
    },
    Menu: {
      /*
        KHÔNG dùng prop theme="dark" trên Menu: bộ token dark của antd ép
        activeBarHeight = 0 và activeBarBorderWidth = 0 (antd 6 dùng nền bo tròn
        cho mục đang chọn thay vì gạch chân), tức là mất luôn gạch chân cyan.
        Ở đây tự khai báo màu dark nên mọi thứ vẫn đúng tông, và giữ được activeBar.
      */
      itemBg: "transparent",
      itemSelectedBg: "transparent",
      itemHoverBg: "transparent",
      itemColor: palette.textMuted,
      itemHoverColor: palette.text,
      itemSelectedColor: palette.text,
      horizontalItemHoverColor: palette.text,
      horizontalItemSelectedColor: palette.text,
      horizontalItemSelectedBg: "transparent",
      horizontalLineHeight: "78px",
      activeBarHeight: 3, // gạch chân cyan dưới mục đang active
      activeBarBorderWidth: 3,
      itemBorderRadius: 6,
      /*
        [responsive] Cỡ chữ menu: 16px (tăng từ 15px theo yêu cầu — chữ to lên
        một chút). Bù lại giảm itemPaddingInline 12 -> 10 để 6 mục vẫn vừa ở
        breakpoint tablet: 6 mục font 16px cần ~392px (text ~272px + padding
        6x20px), mà dải giữa ở 768px còn ~415px (đã trừ logo + nút CTA) — an toàn,
        không bị gom mục cuối vào nút overflow.
      */
      fontSize: 16,
      itemPaddingInline: 10,
    },
    Button: {
      primaryColor: palette.accentInk, // chữ tối trên nền cyan (antd mặc định là chữ trắng)
      fontWeight: 600,
      primaryShadow: "0 10px 30px rgba(34, 211, 238, 0.22)",
      defaultBg: "transparent",
      defaultColor: palette.text,
      defaultBorderColor: palette.borderStrong,
    },
    Card: {
      colorBorderSecondary: palette.borderStrong,
      paddingLG: 16,
    },
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
    },
    Tag: {
      defaultBg: "rgba(17, 23, 38, 0.7)",
      defaultColor: palette.badgeText,
    },
  },
};

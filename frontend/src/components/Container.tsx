import type { CSSProperties, ReactNode } from "react";

/**
 * [antd] antd không có primitive "container" (khung max-width căn giữa như
 * Container của MUI), nên giữ một component nhỏ dùng inline style thay cho
 * class .shell trước đây.
 *
 * [responsive] Dùng clamp() cho padding hai bên: 64px ở desktop -> 20px ở mobile,
 * không cần media query nên không cần file CSS.
 *
 * [layout] maxWidth 1920 (1180 ban đầu -> 1440 -> 1920): nội dung chiếm trọn
 * bề rộng các màn hình phổ biến (Full HD trở xuống), không còn hụt trống 2 bên;
 * chỉ chặn lại ở màn hình siêu rộng (2K/ultrawide) để chữ không dàn quá dài.
 */
export default function Container({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1920,
        marginInline: "auto",
        paddingInline: "clamp(20px, 4vw, 64px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

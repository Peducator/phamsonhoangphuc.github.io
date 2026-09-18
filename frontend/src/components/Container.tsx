import type { CSSProperties, ReactNode } from "react";

/**
 * [antd] antd không có primitive "container" (khung max-width căn giữa như
 * Container của MUI), nên giữ một component nhỏ dùng inline style thay cho
 * class .shell trước đây.
 *
 * [responsive] Dùng clamp() cho padding hai bên: 64px ở desktop -> 20px ở mobile,
 * không cần media query nên không cần file CSS.
 *
 * [layout] maxWidth 1440 (thay vì 1180 trước đây): nội dung giãn gần hết bề
 * màn hình, không còn hụt trống 2 bên nhiều ở desktop lớn; vẫn giữ trần
 * max-width để ở màn hình siêu rộng chữ không dàn quá dài khó đọc.
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
        maxWidth: 1440,
        marginInline: "auto",
        paddingInline: "clamp(20px, 4vw, 64px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

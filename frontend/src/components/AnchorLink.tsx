"use client";

import type { MouseEvent, ComponentProps, ReactNode } from "react";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Khoảng cách đệm khi nhảy anchor = chiều cao header 78 + 18px thoáng.
 * Phải khớp scroll-padding-top trong globals.css (bản fallback không JS).
 */
export const HEADER_OFFSET = 96;

/* ============================================================
   [smooth] Cuộn mượt tự điều khiển thay cho window.scrollTo({smooth}):
   - easing easeInOutCubic: vào chậm - giữa nhanh - đích giảm tốc dịu,
     KHÔNG còn kiểu native "phanh cứng" ở cuối.
   - thời lượng tỉ lệ theo cự ly (400-800ms): đoạn ngắn không bị lê thê,
     đoạn dài không bị phóng như tên lửa.
   - Hủy ngay khi người dùng chạm/véo/cuộn tay (wheel) — hành vi chuẩn:
     người dùng luôn thắng animation.
   ============================================================ */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const CANCEL_EVENTS = [
  "wheel",
  "touchstart",
  "keydown",
] as const;

export function animateScrollTo(
  targetY: number,
  onDone?: () => void,
): void {
  const startY = window.scrollY;
  const distance = targetY - startY;
  // Cự ly nhỏ cuộn nhanh, xa nhất 800ms — con số từ kỹ thuật animate phổ biến
  const duration = Math.min(800, Math.max(400, Math.abs(distance) * 0.4));
  let rafId = 0;
  let startTime = 0;
  let finished = false;

  const cancel = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(rafId);
    for (const ev of CANCEL_EVENTS)
      window.removeEventListener(ev, cancel, { capture: true });
  };

  // Hủy nếu người dùng chủ động cuộn — passive listener, không chặn mặc định
  for (const ev of CANCEL_EVENTS)
    window.addEventListener(ev, cancel, {
      capture: true,
      passive: true,
    });

  const step = (now: number) => {
    if (finished) return;
    if (startTime === 0) startTime = now;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, Math.round(startY + distance * eased));
    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      cancel();
      onDone?.();
    }
  };
  rafId = requestAnimationFrame(step);
}

/**
 * Cuộn tới #hash với đệm header, trả về true nếu có đích để cuộn.
 * Dùng thay cho native anchor vì các lỗi thật đã gặp: drawer khóa scroll,
 * re-click no-op, section cuối hết đường cuộn.
 */
export function scrollToHash(hash: string): boolean {
  const id = hash.replace(/^#/, "");
  if (!id) {
    animateScrollTo(0);
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  animateScrollTo(top);
  return true;
}

/**
 * Handler cho Button href (antd Button sinh <a> thuần) — chặn navigation mặc
 * định rồi tự cuộn, cập nhật hash bằng pushState để không reload.
 */
export function goToHash(
  e: { preventDefault(): void },
  hash: string,
  delay = 0,
) {
  e.preventDefault();
  window.setTimeout(() => {
    scrollToHash(hash);
  }, delay);
  window.history.pushState(null, "", `${BASE}/${hash}`);
}

type AnchorLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  /**
   * "drawer": đợi Drawer đóng XONG rồi mới cuộn — dùng callback afterOpenChange
   * của antd Drawer thay cho độ trễ cứng 380ms: cuộn bắt đầu đúng khoảnh khắc
   * scroll body được nhả khóa, không còn khoảng chết lơ lửng.
   * Số/không truyền: cuộn ngay (menu ngang desktop, nút CTA).
   */
  delay?: number;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
};

/**
 * Link neo cuộn mượt: chặn native navigation, tự tính vị trí đích trừ đệm
 * header rồi animate cuộn — không phụ thuộc scroll-padding của trình duyệt.
 */
export default function AnchorLink({
  href,
  delay = 0,
  onClick,
  children,
  ...rest
}: AnchorLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return; // link thường (vd "/") -> next/link tự xử lý
    e.preventDefault();
    const hash = href.slice(hashIndex);
    if (delay > 0) {
      window.setTimeout(() => scrollToHash(hash), delay);
    } else {
      scrollToHash(hash);
    }
    window.history.pushState(null, "", `${BASE}/${hash}`);
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

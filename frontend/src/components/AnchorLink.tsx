"use client";

import type { MouseEvent, ComponentProps, ReactNode } from "react";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Khoảng cách đệm khi nhảy anchor = chiều cao header 78 + 18px thoáng.
 * Phải khớp scroll-padding-top trong globals.css (bản fallback không JS).
 */
export const HEADER_OFFSET = 96;

/**
 * Cuộn mượt tới #hash với đệm header, trả về true nếu có đích để cuộn.
 * Dùng thay cho native anchor vì 2 lỗi thật:
 *  1) Drawer mobile khóa scroll body — khi đóng drawer cùng lúc với native
 *     scroll thì scroll bị hủy giữa đường -> landing sai vị trí.
 *  2) Re-click khi hash đã trùng thì native anchor là no-op (không cuộn lại).
 */
export function scrollToHash(
  hash: string,
  behavior: ScrollBehavior = "smooth",
): boolean {
  const id = hash.replace(/^#/, "");
  if (!id) {
    window.scrollTo({ top: 0, behavior });
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior });
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
   * Trì hoãn trước khi cuộn (ms). Dùng cho menu trong Drawer: đợi animation
   * đóng drawer + nhả khóa scroll body xong (~350ms) rồi mới cuộn, nếu không
   * scroll sẽ bị hủy giữa đường.
   */
  delay?: number;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
};

/**
 * Link neo cuộn mượt: chặn native navigation, tự tính vị trí đích trừ đệm
 * header rồi scrollTo — không phụ thuộc scroll-padding của trình duyệt.
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
    window.setTimeout(() => {
      scrollToHash(hash);
      window.history.pushState(null, "", `${BASE}/${hash}`);
    }, delay);
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

# Portfolio

Landing page portfolio — Next.js 16 (App Router, TypeScript) + Ant Design 6, dark theme cyan.

| Thư mục | Là gì | Chạy |
|---|---|---|
| `frontend/` | Landing page portfolio. Chi tiết: `frontend/README.md` | `npm run dev` → port 3000 |

Yêu cầu **Node ≥ 20.9** (Next 16 chặn Node 18); máy này dùng Node 20 trong nvm — xem `frontend/README.md` mục 7.

---

## Cấu trúc file

```
.
├── README.md                        ← file này: bản đồ tổng thể của repo
├── .gitignore
│
└── frontend/                        ===== NEXT.JS 16 + ANT DESIGN 6 =====
    ├── package.json                 Scripts + deps (next, antd, @ant-design/icons, react-icons)
    ├── package-lock.json            Lockfile — cần cho `npm ci` (CI/deploy)
    ├── next.config.ts               Cấu hình Next.js: output "export" + basePath cho GitHub Pages
    ├── tsconfig.json                Cấu hình TypeScript + alias "@/..."
    ├── eslint.config.mjs            Cấu hình ESLint
    ├── next-env.d.ts                Type do Next sinh ra (không sửa tay)
    ├── README.md                    Tài liệu layout: lắp trang, breakpoint, ràng buộc antd 6, deploy
    ├── public/                      File tĩnh served tại "/" (ảnh nhân vật, cv.pdf đặt ở đây)
    └── src/
        ├── theme.ts                 NGUỒN MÀU DUY NHẤT của cả trang: palette + theme token antd.
        │                            Đổi tông (cyan → tím) chỉ cần sửa file này
        ├── app/
        │   ├── layout.tsx           Khung HTML: font Geist, metadata, AntdRegistry + Providers
        │   ├── providers.tsx        ConfigProvider — áp theme dark cho mọi component antd
        │   ├── page.tsx             Lắp các section thành trang (Server Component, đọc public/ để biết có ảnh chưa)
        │   ├── globals.css          CSS thuần duy nhất: base body + 2 override antd không làm được
        │   └── favicon.ico
        └── components/
            ├── Container.tsx        Khung bề rộng trang (max-width 1920, căn giữa) — mọi section bọc trong đây
            ├── Header.tsx           Thanh trên cùng: logo, menu ngang, CTA, hamburger + Drawer ở mobile
            ├── Hero.tsx             Section đầu trang (#home): badge, tiêu đề, 2 nút CTA, ảnh minh hoạ glow
            ├── TechStack.tsx        Hàng logo công nghệ (react-icons), nằm trong cột chữ của Hero
            ├── AboutSkills.tsx      Section About Me (#about) + My Skills (#skills): stat 2×2 + 3 card kỹ năng
            ├── SkillBar.tsx         Một hàng kỹ năng: icon + tên + % + thanh Progress glow
            └── ContactFooter.tsx    Section Contact (#contact) 3 cột: CTA / testimonial / social + liên hệ
```

---

## Luồng dữ liệu

Frontend hiện dùng dữ liệu tĩnh khai trực tiếp trong component. Khi cần dữ liệu động
(blog, projects...), có thể thêm API route trong `frontend/src/app/api/` của chính Next.js.

---

## Deploy

Site sống tại **https://phamsonhoangphuc.github.io/** — user site (repo tên
`phamsonhoangphuc.github.io` trên tài khoản GitHub trùng tên → phục vụ ở gốc domain,
không cần basePath).

- Workflow `.github/workflows/deploy-pages.yml`: mỗi push lên `master` → build trong
  `frontend/` → upload `frontend/out` → deploy.
- Bật lần đầu (làm tay trên GitHub): **Settings → Pages → Source: GitHub Actions**.
- Nếu sau này host dưới path (project site), build với `NEXT_PUBLIC_BASE_PATH=/<path>`
  — chi tiết kỹ thuật basePath: `frontend/README.md` mục 8.

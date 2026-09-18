# Portfolio — Monorepo

Hai phần, chạy độc lập:

| Thư mục | Là gì | Chạy |
|---|---|---|
| `frontend/` | Landing page portfolio — Next.js 16 (App Router, TypeScript) + Ant Design 6, dark theme cyan. Chi tiết: `frontend/README.md` | `npm run dev` → port 3000 |
| `backend/` | REST API (Express 5) cho projects / blog / profile, lưu bằng file JSON. Chi tiết: `backend/README.md` | `npm run dev` → port 4000 |

---

## Cấu trúc file

```
.
├── README.md                        ← file này: bản đồ tổng thể của repo
├── .gitignore
│
├── backend/                         ===== API EXPRESS 5 =====
│   ├── server.js                    Điểm khởi động: helmet → CORS → json(1mb) → audit log → routers → 404 → error-handler
│   ├── package.json                 Scripts + deps (express, cors, dotenv, helmet, express-rate-limit)
│   ├── .env.example                 Tài liệu biến môi trường (PORT, ADMIN_SECRET, CORS_ORIGIN, DATA_DIR...)
│   ├── .env                         Env thật của máy này — ĐÃ GITIGNORE, không commit
│   ├── README.md                    Tài liệu API: endpoint, validate, bảo mật, deploy
│   ├── scripts/
│   │   └── smoke-test.sh            Bộ test 35 case: bash scripts/smoke-test.sh
│   ├── data/                        Nơi lưu 3 file JSON (projects/blog/profile) — GITIGNORE, tự seed lần đầu chạy
│   └── src/
│       ├── routes/                  Khai báo endpoint + gắn rate-limit / require-secret cho route ghi
│       │   ├── projects.routes.js   GET/POST/PATCH/DELETE /api/projects
│       │   ├── blog.routes.js       GET/POST/PATCH/DELETE /api/blog (+ /admin/all cho draft)
│       │   └── profile.routes.js    GET/PATCH /api/profile
│       ├── controllers/             Lớp mỏng: gọi service → set status code → trả json
│       │   ├── projects.controller.js
│       │   ├── blog.controller.js
│       │   └── profile.controller.js
│       ├── services/                Toàn bộ logic nghiệp vụ + validate dữ liệu
│       │   ├── projects.service.js  Quy tắc cho project (title ≤120, summary ≤200, links https...)
│       │   ├── blog.service.js      Quy tắc cho bài viết (draft/published, excerpt, readingTime...)
│       │   ├── profile.service.js   Quy tắc cho profile (technologies, socials...)
│       │   └── shared.js            Dùng chung: HttpError, validators, slugify, compact()
│       ├── middlewares/
│       │   ├── require-secret.js    Chặn route ghi thiếu/sai ADMIN_SECRET (timingSafeEqual, fail-closed)
│       │   ├── rate-limit.js        10 lần ghi SAI / 15 phút / IP → 429
│       │   ├── request-log.js       Audit log [audit] cho mọi POST/PATCH/DELETE
│       │   └── error-handler.js     Bắt mọi lỗi → JSON thống nhất, không lộ stack
│       └── data/
│           └── store.js             Đọc/ghi JSON atomic (ghi file tạm + rename), seed khi thiếu
│
└── frontend/                        ===== NEXT.JS 16 + ANT DESIGN 6 =====
    ├── package.json                 Scripts + deps (next, antd, @ant-design/icons, react-icons)
    ├── next.config.ts               Cấu hình Next.js
    ├── tsconfig.json                Cấu hình TypeScript + alias "@/..."
    ├── eslint.config.mjs            Cấu hình ESLint
    ├── next-env.d.ts                Type do Next sinh ra (không sửa tay)
    ├── README.md                    Tài liệu layout: lắp trang, breakpoint, ràng buộc antd 6
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
            ├── Container.tsx        Khung bề rộng trang (max-width 1180, căn giữa) — mọi section bọc trong đây
            ├── Header.tsx           Thanh trên cùng: logo, menu ngang, CTA, hamburger + Drawer ở mobile
            ├── Hero.tsx             Section đầu trang (#home): badge, tiêu đề, 2 nút CTA, ảnh minh hoạ glow
            ├── TechStack.tsx        Hàng logo công nghệ (react-icons), nằm trong cột chữ của Hero
            ├── AboutSkills.tsx      Section About Me (#about) + My Skills (#skills): stat 2×2 + 3 card kỹ năng
            ├── SkillBar.tsx         Một hàng kỹ năng: icon + tên + % + thanh Progress glow
            ├── ContactFooter.tsx    Section Contact (#contact) 3 cột: CTA / testimonial / social + liên hệ
            └── Footer.tsx           Dòng copyright ở đáy trang
```

---

## Luồng dữ liệu dự kiến

Hiện frontend mới dùng dữ liệu tĩnh trong component; khi nối API, theo lộ trình ở
`backend/README.md` mục 7: GET công khai gọi từ Server Component (fetch +
`revalidate`), route ghi gọi từ phía server — `ADMIN_SECRET` không bao giờ đặt vào
biến `NEXT_PUBLIC_*`.

# Backend — Personal Site API

API Express 5 cho site cá nhân: **đã triển khai hoàn chỉnh theo bản thiết kế cũ**, lưu dữ liệu
bằng file JSON. Tài liệu này mô tả đúng cái đang chạy, không phải đề xuất nữa.

```
backend/
├── server.js                     wiring: helmet → CORS → json(1mb) → audit log → routers → 404 → error-handler
├── .env.example                  tài liệu biến môi trường (file .env thật KHÔNG commit)
├── .env                          env local (đã gitignore)
├── scripts/smoke-test.sh         bộ test 35 case — bash scripts/smoke-test.sh
├── data/                         projects.json, blog.json, profile.json (gitignore, tự seed khi thiếu)
└── src/
    ├── routes/                   khai báo endpoint + gắn rate-limit/require-secret cho route ghi
    │   ├── projects.routes.js
    │   ├── blog.routes.js
    │   └── profile.routes.js
    ├── controllers/              mỗi hàm 1–3 dòng: gọi service, set status, trả json
    │   ├── projects.controller.js
    │   ├── blog.controller.js
    │   └── profile.controller.js
    ├── services/                 toàn bộ logic + validate
    │   ├── projects.service.js
    │   ├── blog.service.js
    │   ├── profile.service.js
    │   └── shared.js             HttpError, fail(), validators, slugify, pickFrom/compact
    ├── middlewares/
    │   ├── require-secret.js     secret cho route ghi (timingSafeEqual, fail-closed)
    │   ├── rate-limit.js         10 lần SAI / 15 phút / IP → 429 kèm Retry-After
    │   ├── request-log.js        audit log [audit] cho POST/PATCH/DELETE
    │   └── error-handler.js      bắt mọi lỗi → JSON, không lộ stack
    └── data/
        └── store.js              đọc/ghi JSON atomic (tmp + rename), seed khi thiếu file
```

---

## 1. Chạy

```bash
cd backend
npm install
cp .env.example .env        # rồi điền ADMIN_SECRET
npm run dev                 # node --watch, mặc định port 4000
```

Sinh secret: `openssl rand -hex 32`. **Thiếu `ADMIN_SECRET` → mọi route ghi trả 503
(fail-closed)** — server vẫn chạy để phục vụ GET công khai.

Kiểm tra nhanh:

```bash
curl http://localhost:4000/api/health
bash scripts/smoke-test.sh   # 35 case, tự dựng server + DATA_DIR tạm, thoát 0 khi pass hết
```

## 2. Biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | `4000` | Cổng API (frontend Next chạy 3000 — đừng trùng). |
| `ADMIN_SECRET` | (không có) | Secret cho route ghi. Thiếu → 503 fail-closed; < 32 ký tự → cảnh báo khi khởi động. |
| `CORS_ORIGIN` | `http://localhost:3000` | Origin được phép, phân tách bằng dấu phẩy. **Đừng bao giờ để `*` khi deploy thật.** |
| `DATA_DIR` | `backend/data` | Thư mục chứa 3 file JSON. |
| `RATE_LIMIT_MAX` | `10` | Số lần ghi **sai** secret tối đa trong một cửa sổ / IP. |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Độ dài cửa sổ (15 phút). |
| `TRUST_PROXY` | (không có) | **Chỉ set khi chạy sau reverse proxy**, đúng số hop (`1`, `2`, …) hoặc `true`. |
| `NODE_ENV` | `development` | — |

## 3. Endpoint (12 route + 2 admin + health)

| Method | Đường dẫn | Secret | Thành công | Lỗi |
|---|---|---|---|---|
| GET | `/api/health` | – | 200 `{ok, uptime}` | – |
| GET | `/api/projects` | – | 200 `{items, total}` | – |
| GET | `/api/projects/:slug` | – | 200 object | 404 |
| POST | `/api/projects` | ✅ | 201 object | 400, 401, 409, 429, 503 |
| PATCH | `/api/projects/:slug` | ✅ | 200 object | 400, 401, 404, 409, 429, 503 |
| DELETE | `/api/projects/:slug` | ✅ | 200 object vừa xoá | 401, 404, 429, 503 |
| GET | `/api/blog?page&limit` | – | 200 `{items, total, page, limit, totalPages}` — **chỉ bài published** | – |
| GET | `/api/blog/:slug` | – | 200 object (draft → 404) | 404 |
| GET | `/api/blog/admin/all` | ✅ | 200 `{items, total}` — thấy cả draft | 401 |
| GET | `/api/blog/admin/:slug` | ✅ | 200 object (kể cả draft) | 401, 404 |
| POST | `/api/blog` | ✅ | 201 object (mặc định `draft`) | 400, 401, 409, 429, 503 |
| PATCH | `/api/blog/:slug` | ✅ | 200 object | 400, 401, 404, 409, 429, 503 |
| DELETE | `/api/blog/:slug` | ✅ | 200 object vừa xoá | 401, 404, 429, 503 |
| GET | `/api/profile` | – | 200 object | – |
| PATCH | `/api/profile` | ✅ | 200 object | 400, 401, 429, 503 |

**Gửi secret qua một trong hai cách:** `x-admin-secret: <secret>` hoặc `Authorization: Bearer <secret>`.

Định dạng chung:

- JSON `utf-8`; body sai JSON → **400 `INVALID_JSON`**; body > 1mb → **413**; charset lạ → **415**.
- `id` là UUID do server sinh; thời gian ISO 8601 UTC do server set; client gửi lên bị bỏ qua.
- Danh sách trả `{ "items": [...], "total": n }`; lỗi trả
  `{ "error": { "code", "message" } }` — slug trùng có thêm `details.suggestedSlug`.
- `DELETE` trả về object vừa xoá để frontend cập nhật ngay.
- Phân trang blog: `?page=1&limit=10`, tối đa `limit=50`.
- Chi tiết theo **slug** (URL ổn định cho SEO); sửa `title` không tự đổi slug — muốn đổi
  phải gửi `slug` trong PATCH, trùng thì 409 kèm gợi ý (`du-an-moi-2`).
- Slug sinh từ title: bỏ dấu tiếng Việt, `^[a-z0-9-]+$` — `"Dự án mới!"` → `du-an-moi`.

## 4. Dữ liệu

Lưu **3 file JSON** trong `DATA_DIR`, nạp vào RAM khi khởi động, ghi lại sau mỗi thay đổi
kiểu atomic (ghi file tạm rồi `rename`). Lần chạy đầu tự sinh **seed** (1 project, 1 bài viết
published, profile đầy đủ) — xoá file trong `data/` để sinh lại.

Giới hạn: chỉ **một tiến trình** được ghi vào chung một `DATA_DIR`. File JSON hỏng → server
thoát ngay và báo sửa/xoá tay, **không tự ghi đè** để tránh mất dữ liệu thật.

Validate (tóm tắt — chi tiết nằm trong từng `*.service.js`):

| Resource | Trường bắt buộc | Trần |
|---|---|---|
| Project | `title` (≤120), `summary` (≤200) | `techStack` ≤ 20 × 40 ký tự; `description` ≤ 20.000; `links` chỉ `repo`/`demo` https |
| Blog | `title` (≤160), `content` (≤100.000) | `tags` ≤ 10 × 30 ký tự; `status` ∈ `draft`/`published` (mặc định draft); `publishedAt` tự set lần đầu published; `readingTimeMinutes` ≈ 200 từ/phút; `excerpt` tự cắt 160 ký tự nếu bỏ trống |
| Profile | `name` (≤80), `headline` (≤120) | `technologies` ≤ 12 × `{label ≤40, icon ≤60, color #rrggbb}`; `socials` chỉ `github/linkedin/x/facebook` dạng `https://` |

Quy tắc chung: trim mọi chuỗi; mảng có trần; **chỉ nhận khoá trong danh sách trắng** (trường
lạ bị bỏ qua — chống prototype pollution); `null` = xoá giá trị (với trường tuỳ chọn);
PATCH body rỗng → 400 kèm danh sách trường được sửa.

## 5. Bảo mật — 7 lớp

1. **Secret** — so bằng `crypto.timingSafeEqual` (kiểm tra độ dài trước vì hàm này ném lỗi
   khi khác độ dài). Sai/thiếu → 401, không giải thích thêm, không bao giờ log giá trị secret.
2. **Fail-closed** — chưa cấu hình `ADMIN_SECRET` → 503 cho mọi route ghi.
3. **Rate limit** — `express-rate-limit`, chỉ áp cho nhóm route ghi, `skipSuccessfulRequests:
   true` (gõ đúng bao nhiêu lần cũng không chặn). Vượt → 429 kèm `Retry-After`.
4. **Giới hạn body** — `express.json({ limit: "1mb" })`, vượt → 413 dạng JSON.
5. **Helmet** — `nosniff`, chống iframe, Referrer-Policy, ẩn `X-Powered-By`.
6. **Audit log** — mỗi POST/PATCH/DELETE một dòng `[audit]` JSON ra stdout (thời điểm, method,
   path, IP, User-Agent, status, ms), **cả** lần bị từ chối để thấy dấu hiệu dò secret.
   Không log body, không log secret; xoay vòng file để systemd/docker lo.
7. **Markdown chỉ lưu thô** — server không render HTML; sanitize khi render ở frontend
   (`react-markdown` + `rehype-sanitize` hoặc DOMPurify).

Lưu ý deploy sau proxy: phải set `TRUST_PROXY` đúng số hop. Sai một chiều thì `req.ip` luôn
là IP của proxy (mọi user bị coi là một IP — rate limit thành ngưỡng chung), sai chiều kia
(`true` vô điều kiện) thì client tự khai IP giả và rate limit mất tác dụng.

## 6. Ghi nhớ đã sửa trong lúc code

- `src/sevices` (typo) đã đổi thành `src/services`.
- Dependencies cuối cùng: `express`, `cors`, `dotenv`, `helmet`, `express-rate-limit`.
  Không có gì khác — UUID/so secret dùng `node:crypto`, file dùng `node:fs`.
- Bug đã gặp và sửa: hàm `clean()` trả object có khoá mang giá trị `undefined`, khi merge
  ghi đè mất `content` cũ của bài viết → PATCH blog lỗi 500. Xử lý bằng helper `compact()`
  bỏ khoá undefined trước khi merge.
- Express 5 tự bắt promise reject của controller/service đẩy về error-handler — controller
  không cần try/catch (chỉ có một ngoại lệ: 409 cần gắn `details.suggestedSlug` vào body).

## 7. Lộ trình tiếp theo

- **Giai đoạn 2 lưu trữ:** SQLite (`better-sqlite3`) hoặc Postgres — chỉ viết lại `store.js`
  + thân services, routes/controllers/frontend không đổi.
- **Frontend gọi API:** GET công khai từ Server Component của Next
  (`fetch(url, { next: { revalidate: 60 } })`); route ghi gọi từ Route Handler/Server Action
  phía server — secret **không bao giờ** đặt vào biến `NEXT_PUBLIC_*`.
- Ảnh (`coverImage`, `avatar`, `heroCharacter`) là file tĩnh trong `frontend/public`; API
  chỉ lưu chuỗi đường dẫn, không nhận upload.

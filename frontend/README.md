# Frontend — cấu trúc file & layout

Landing page portfolio, Next.js 16 (App Router) + Ant Design 6, một trang duy nhất.
Tài liệu này **chỉ nói về layout**: trang được dựng từ những khối nào, mỗi file chịu
trách nhiệm gì, và ở mỗi breakpoint thì cái gì đổi.

---

## 1. Cấu trúc file

```
src/
├── app/
│   ├── layout.tsx        Khung ngoài cùng: font Geist, metadata, AntdRegistry + Providers
│   ├── providers.tsx     ConfigProvider — nơi theme của antd được áp cho toàn bộ cây
│   ├── page.tsx          Lắp các khối thành trang (Server Component)
│   └── globals.css       CSS thuần duy nhất: base body + 2 override antd không làm được
├── components/
│   ├── Container.tsx     Khung bề rộng trang (max-width 1920) — mọi section đều bọc trong đây
│   ├── Header.tsx        Thanh trên cùng: logo, menu ngang, nút CTA, hamburger + Drawer
│   ├── Hero.tsx          Khối đầu trang (#home): 2 cột chữ / minh hoạ
│   ├── TechStack.tsx     Hàng logo công nghệ (nằm trong cột chữ của Hero)
│   ├── AboutSkills.tsx   Section About Me + My Skills (#about, #skills)
│   ├── SkillBar.tsx      Một hàng kỹ năng: icon + tên + % + thanh Progress glow
│   └── ContactFooter.tsx Section Contact 3 cột (#contact): CTA / testimonial / social
└── theme.ts              Token thiết kế: màu (palette), bo góc, control height, token component
```

Không còn file `.module.css` nào. Mọi thứ về layout dùng **Grid của antd** (`Row`/`Col`)
và inline style; chỉ `globals.css` là có CSS thuần (2 chỗ, xem mục 6).

### Màu sắc — nguồn duy nhất là `src/theme.ts`

Toàn bộ section dùng `palette` từ `src/theme.ts`, **không hardcode màu**: nền `#0b0f19`,
card `#0f1626`, dải section `#111726`, nhấn cyan `#22d3ee`, chữ `#e8ecf4` / muted `#8d9aae`.
Section About + Skills được dựng theo một ảnh mẫu, nhưng **màu trong ảnh không được tin** —
mọi giá trị đều lấy từ palette của trang để đồng bộ với Hero/Header. Muốn đổi tông cả trang
(ví dụ cyan → tím) chỉ cần sửa `palette.accent` trong `theme.ts`, mọi section đổi theo.

Các hiệu ứng glow (viền icon stat, bóng thanh progress) dùng giá trị
`rgba(34, 211, 238, …)` — dẫn xuất của `palette.accent`, chỉ tồn tại ở AboutSkills/SkillBar.

---

## 2. Trang được lắp như thế nào

```
body                                  nền #0b0f19, overflow-x: hidden
└── Providers (ConfigProvider)        áp theme cho mọi component antd
    └── page.tsx
        ├── Header.tsx                sticky top 0, cao 78px, z-index 50
        └── main
            ├── Hero.tsx              id="home"
            ├── AboutSkills.tsx       id="about" — chứa luôn anchor #skills (mục My Skills)
            └── ContactFooter.tsx     id="contact" — CTA + testimonial + social/liên hệ
```

**Cấu trúc bên trong từng khối:**

- **Header** — một `Row` (wrap = false) gồm 4 `Col`:
  `logo` → `menu ngang` → `nút Let's Connect` → `burger`.
  Hai cột giữa và phải bị ẩn/hiện theo breakpoint bằng chính class của `Col`.
  Link logo và 2 nút CTA là đường dẫn tuyệt đối nối hằng `BASE`
  (`NEXT_PUBLIC_BASE_PATH`) — xem mục Deploy.
- **Hero** — một `Row` gutter `[48, 48]` gồm 2 `Col`:
  `cột chữ` (badge → tiêu đề → mô tả → 2 nút CTA → hàng icon) và `cột minh hoạ`
  (vòng glow, ảnh nhân vật).
  Cột minh hoạ dùng `position: relative` + `display: grid; place-items: center`;
  vòng glow là `absolute` **chỉ để trang trí**, không mang nội dung.
- **Container** — `max-width: 1920px`, căn giữa, padding hai bên
  `clamp(20px, 4vw, 64px)`. Đây là thứ quyết định "khung" của cả trang:
  nội dung chiếm trọn bề rộng màn hình phổ biến (Full HD trở xuống), chỉ chặn
  lại ở màn hình siêu rộng (2K/ultrawide) để dòng chữ không dàn quá dài.
- **AboutSkills** — hai khối xếp dọc trong một section:
  - **About Me** — `Row` 2 cột `md={12}/md={12}`: trái là badge `Tag` + tiêu đề
    (chữ "passionate" bọc span cyan) + đoạn giới thiệu; phải là lưới `Row` 2×2
    gồm 4 ô stat (icon vuông glow + số lớn +
    mô tả), các ô ngăn bởi `Divider` mảnh.
  - **My Skills** — nhãn căn giữa + tiêu đề cyan + gạch nhấn 40×3px, rồi
    `Row` 3 cột `Card` (mỗi card 3 `<SkillBar />` xếp dọc). Dữ liệu nằm trong
    2 mảng `STATS` và `SKILL_GROUPS` ngay đầu file — thêm/bớt stat hay skill
    chỉ cần sửa mảng, không đụng JSX.
- **SkillBar** — hàng trên: icon `react-icons/si` + tên + số % cyan; hàng dưới:
  `Progress` của antd (`railColor` — antd 6 đã đổi tên từ `trailColor`,
  `size={["100%", 6]}`, `showInfo={false}`).
- **ContactFooter** — một `Row` gutter `[32, 32]` gồm 3 `Col` `md={8}`:
  `CTA` (label cyan → tiêu đề → đoạn → nút "Get In Touch") → `Card testimonial`
  (dấu ngoặc kép glow + quote + dòng tác giả với `marginTop: "auto"` để luôn
  dính đáy card) → `Social` (label + 4 nút tròn react-icons + 2 dòng
  mailto/tel).
  Dữ liệu social nằm trong mảng `SOCIALS` ngay đầu file — href đang là
  placeholder, thay URL thật bằng cách sửa mảng.

---

## 3. Breakpoint — cái gì đổi ở đâu

| Thành phần | Mobile `< 768px` | Tablet `768–1023px` | Desktop `≥ 1024px` |
|---|---|---|---|
| Header | logo trái + **burger** phải; menu ngang ẩn; nút CTA ẩn (nằm trong Drawer) | menu ngang 6 mục + nút CTA; burger ẩn | giống tablet, khung rộng tối đa 1920px |
| Menu | mở bằng **Drawer trượt từ phải**: 6 mục xếp dọc + nút "Let's Connect" ở đáy | hàng ngang, căn giữa | hàng ngang, căn giữa |
| Hero | 1 cột: chữ ở trên, minh hoạ xuống dưới và **canh giữa** | 2 cột `13/24` chữ — `11/24` minh hoạ | giống tablet |
| 2 nút CTA | **xếp dọc, full width** | nằm cạnh nhau (`12/24` mỗi nút) | nằm cạnh nhau |
| Cỡ tiêu đề | 30px | ~40px (ở đúng 768px) | 49.6px |
| Hàng icon | wrap nhiều hàng (1 hàng 9 icon ở ~667px) | 2 hàng (cột chữ chỉ ~371px) | 1 hàng (cột chữ ~575px) |
| Bề rộng vòng glow | theo bề rộng cột, `min(100%, 440px)` | như mobile | 440px |
| About — 2 cột | xếp dọc (trái trên, stat grid dưới) | 2 cột `12/24` từ md | giống tablet |
| About — stat 2×2 | vẫn 2 cột `xs={12}` (4 ô thành 2 hàng) | giống mobile | giống mobile, ô giãn theo chiều cao |
| Skills — 3 card | **1 cột** full width | 2 cột (`md={12}`, card 3 rơi xuống hàng riêng) | **3 cột** từ lg (1024px) |

### Vì sao không dùng media query

Breakpoint được thể hiện bằng props của `Col`, không viết `@media` tay. Hai chỗ duy
nhất dùng cơ chế khác:

1. **Cỡ tiêu đề** — `fontSize: clamp(1.875rem, 5.2vw, 3.1rem)`. Dùng cách này thay vì
   `useBreakpoint()` là để trang **không bị nháy chữ** lúc hydrate (SSR không biết bề
   rộng màn hình, nên nếu chọn cỡ bằng JS thì lần vẽ đầu luôn sai cỡ).
2. **Padding hai bên của Container** — `clamp(20px, 4vw, 64px)`, cùng lý do.

---

## 4. Một điểm rất dễ sai của antd 6 (đọc trước khi sửa Header)

antd **khác antd 5** ở chỗ class `-xs` được sinh **ngoài mọi media query** (là style base,
áp cho mọi bề rộng), còn `-sm` trở lên mới là `@media (min-width: …)`:

| Class | Media query | Tác dụng |
|---|---|---|
| `ant-col-xs-0` | không có → áp mọi bề rộng | `display: none` |
| `ant-col-xs-24` / `xs-flex` | không có | full width / rộng theo nội dung |
| `ant-col-sm-24` | `(min-width: 576px)` | full width |
| `ant-col-md-0` | `(min-width: 768px)` | `display: none` |
| `ant-col-md-13` / `md-11` | `(min-width: 768px)` | 54.17% / 45.83% |

Hệ quả: muốn **ẩn ở mobile rồi hiện lại từ 768px** thì không thể chỉ set `md={{ flex }}` —
rule đó chỉ đổi `flex`, không reset `display: none`. Phải set **cả `span`** ở md để antd
sinh `display: block`, rồi thêm `flex` trong cùng breakpoint đó để cột vẫn rộng theo nội dung:

```tsx
const MOBILE_HIDDEN: ColProps["xs"] = { span: 0 };
const DESKTOP_AUTO:  ColProps["md"] = { span: 24, flex: "0 0 auto" }; // span để reset display, flex để không bị 100%
const MOBILE_AUTO:   ColProps["xs"] = { flex: "0 0 auto" };
```

Chiều ngược lại (hiện ở mobile, ẩn từ md) thì đơn giản hơn: `xs={{ flex: "0 0 auto" }} md={{ span: 0 }}`.

**Một cái bẫy nữa:** `Menu` ngang của antd tự đo overflow bên trong. Nếu `Col` bọc nó co
theo nội dung (`flex: 0 0 auto`) thì bề rộng = 0 → menu tự ẩn hết item. Vì vậy cột menu
cố tình nhận `span: 24` (bề rộng xác định).

---

## 5. Muốn sửa gì thì sửa ở đâu

| Muốn đổi | Sửa ở |
|---|---|
| Màu, màu nhấn, bo góc, cỡ chữ mặc định, touch target | `src/theme.ts` |
| Bề rộng khung trang / padding hai bên | `src/components/Container.tsx` |
| Chiều cao header (78px) | `src/theme.ts` (`Layout.headerHeight`) **+** `Header.tsx` (`minHeight`) **+** `globals.css` (`scroll-padding-top: 96px`) |
| Tỉ lệ 2 cột hero | `Hero.tsx` — `md={13}` cho cột chữ, `md={11}` cho cột minh hoạ |
| Cỡ tiêu đề theo breakpoint | `Hero.tsx` — biểu thức `clamp(...)` của `Typography.Title` |
| Thêm/bớt mục menu | `Header.tsx` — mảng `NAV_LINKS` (dùng chung cho cả menu ngang và Drawer) |
| Mốc chuyển menu ngang ↔ burger | `Header.tsx` — các hằng `MOBILE_HIDDEN` / `DESKTOP_AUTO` / `MOBILE_AUTO` (hiện là mốc `md` = 768px) |
| Độ nén của menu ngang | `src/theme.ts` — `Menu.fontSize: 16`, `Menu.itemPaddingInline: 10` |
| Hàng logo công nghệ | `src/components/TechStack.tsx` — mảng `TECHNOLOGIES` |
| Nội dung About / stat 2×2 | `src/components/AboutSkills.tsx` — mảng `STATS` |
| Kỹ năng & phần trăm | `src/components/AboutSkills.tsx` — mảng `SKILL_GROUPS` (thanh tự sinh từ mảng) |
| Cao/thấp section About + Skills | `AboutSkills.tsx` — các `paddingBlock: clamp(...)` |
| Social / email / SĐT của Contact | `src/components/ContactFooter.tsx` — mảng `SOCIALS` + 2 `ContactRow` |
| Nội dung testimonial | `src/components/ContactFooter.tsx` — cột 2 của `Row` (quote + tên + chức danh) |
| Link logo / CTA / CV (đường dẫn tuyệt đối) | `Header.tsx` / `Hero.tsx` — hằng `BASE` |
| Cấu hình deploy GitHub Pages | `next.config.ts` (`basePath`) + `.github/workflows/deploy-pages.yml` |

---

## 6. Ràng buộc để layout không vỡ (rút ra từ lỗi đã gặp)

1. **Không đặt bề rộng px cố định** lên khối lớn. Chỉ dùng `%`, `min()`, `clamp()`,
   `maxWidth` — đây là lý do không có scroll ngang ở mọi bề rộng đã thử
   (375px, 759px, 827px, 903px, 951px).
2. **Không đặt nội dung quan trọng vào khối `position: absolute`.** Card JSON nổi trên
   minh hoạ trước đây đã bị bỏ đúng vì lý do này: cột hẹp lại là nó đè lên chữ bên dưới.
   Hiện chỉ còn vệt sáng sau Hero và vòng glow quanh ảnh là `absolute`, cả hai đều
   trang trí thuần.
3. **Đừng dùng `theme="dark"` trên `Menu`.** Bộ token dark của antd ép
   `activeBarHeight: 0` và `activeBarBorderWidth: 0` → mất gạch chân của mục đang chọn.
   Màu dark đã được khai báo thủ công trong `theme.ts` rồi nên không cần prop đó.
4. **Gạch chân cyan dưới mục đang chọn phải có `!important`** (xem `globals.css`).
   antd dùng chung một token cho cả màu chữ lẫn màu gạch chân, nên muốn "chữ trắng +
   gạch cyan" thì buộc phải ghi đè; mà style của antd được chèn động **sau** file CSS
   này nên thiếu `!important` là bị ghi đè ngược lại thành màu trắng.
5. **Glow của thanh Progress cũng phải qua CSS thuần** (chỗ thứ hai trong `globals.css`).
   Inline style của `<Progress>` chỉ áp lên lớp rail (nền xám), còn fill nằm ở class
   `.ant-progress-track` — antd không có token nào điều khiển box-shadow của fill,
   nên `SkillBar` gắn `className="skillbar-progress"` và CSS ghi đè lên class đó.
6. **`Typography.Title` / `Typography.Text` không dùng được trong Server Component.**
   React chỉ đưa client-reference proxy qua ranh giới server → client, nên truy cập
   `Typography.Text` sẽ ra `undefined` và build fail. `AboutSkills`/`SkillBar` cũng
   có `"use client"` chính vì lý do này. `Header`/`Hero`/`TechStack` cũng vậy.
7. **`page.tsx` là Server Component có chủ đích** — nó đọc filesystem để biết
   `public/hero-character.png` đã có chưa rồi truyền `hasPortrait` xuống `Hero`.
   Nếu bạn thêm ảnh, chỉ cần đặt file vào `public/`, không phải sửa code.
8. **antd 6 đã đổi tên một loạt prop so với antd 5** — bám theo nó tránh cảnh báo
   deprecate: Card `bordered` → `variant="outlined"`; Divider `type="vertical"` →
   `orientation="vertical"`; Progress `trailColor` → `railColor`;
   Button `iconPosition` → `iconPlacement`; Space `direction` → `orientation`.

---

## 7. Chạy thử

Yêu cầu **Node ≥ 20.9** (Next 16 chặn Node 18). Trên máy này Node 20 nằm trong nvm,
shell không tương tác sẽ rơi vào `/usr/bin/node` (18.19.1) nên cần nạp nvm trước:

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
npm run dev        # http://localhost:3000
npm run lint && npx tsc --noEmit && npm run build   # kiểm tra
```

Build local **không đặt** `NEXT_PUBLIC_BASE_PATH` — đường dẫn giữ nguyên dạng `/...`
như khi chạy `next dev`.

---

## 8. Deploy GitHub Pages

Site sống tại **https://phamsonhoangphuc.github.io/** — user site (repo tên
`phamsonhoangphuc.github.io` trên tài khoản GitHub trùng tên), phục vụ ở **gốc domain**,
nên build không cần basePath.

- `next.config.ts` — `output: "export"`; `basePath` đọc từ env `NEXT_PUBLIC_BASE_PATH`
  (user site: để rỗng. Nếu sau này host dưới path — project site — build với
  `NEXT_PUBLIC_BASE_PATH=/<path>`).
- Link `<a>` thuần của antd (logo, 2 nút CTA, Download CV) nối hằng
  `BASE = process.env.NEXT_PUBLIC_BASE_PATH` — rỗng thì ra `/...` như thường, có prefix
  thì tự đúng; `Link`/`Image` của Next tự xử lý basePath.
- Workflow `.github/workflows/deploy-pages.yml` chạy `npm ci` + `npm run build`
  trong `frontend/` (cần `package-lock.json` cho `npm ci`), upload `frontend/out`.
- Bật deploy lần đầu (làm tay trên GitHub): **Settings → Pages → Source: GitHub
  Actions**. Từ đó mỗi push lên `master` là tự build và deploy.

---

## 9. Còn thiếu (không phải lỗi layout)

- `public/hero-character.png` — ảnh nhân vật 3D; chưa có thì hiện vòng nét đứt ghi chú.
- `public/cv.pdf` — nút "Download CV" đang trỏ tới file chưa tồn tại.
- Các anchor `#projects`, `#blog` chưa có section tương ứng (`#about`, `#skills`
  và `#contact` đã nhảy đúng — `#skills` nằm trong AboutSkills, `#contact` là
  ContactFooter), nên bấm vào chưa nhảy đi đâu.

- `public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` là asset mặc định
  của `create-next-app`, hiện không dùng tới.

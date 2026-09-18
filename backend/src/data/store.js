'use strict';

/**
 * Nơi lưu trữ giai đoạn 1: 3 file JSON trong backend/data/.
 * - Nạp vào RAM khi khởi động, ghi lại sau MỖI thay đổi (ghi atomic: file tạm + rename).
 * - File thiếu → ghi seed ra để mở web là thấy nội dung.
 * - File JSON hỏng → thoát ngay thay vì âm thầm ghi đè (tránh mất dữ liệu thật).
 * - Chỉ đúng MỘT tiến trình được ghi — đừng chạy nhiều instance chung DATA_DIR.
 * Khi đổi sang SQLite/Postgres (giai đoạn 2) chỉ cần viết lại file này + thân services.
 */

const fs = require('node:fs');
const path = require('node:path');

// Mặc định neo vào backend/data bất kể chạy từ đâu; DATA_DIR trong .env để ghi đè.
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '..', '..', 'data');

const NAMES = ['projects', 'blog', 'profile'];
const cache = new Map();

/* ----- dữ liệu seed (khi file chưa tồn tại) — xoá data/*.json để sinh lại ----- */

const SEEDS = {
  projects: [
    {
      id: 'c9a1b2d3-4e5f-4a6b-8c7d-1e2f3a4b5c6d',
      slug: 'personal-portfolio-site',
      title: 'Personal Portfolio Site',
      summary: 'Trang web cá nhân: portfolio, blog và CV — Next.js ở frontend, Express API ở backend.',
      description:
        '## Tính năng\n\n- Portfolio và blog với dữ liệu lấy từ API\n- Backend Express 5, lưu JSON\n- Deploy bằng Docker\n\nMarkdown **hoạt động** bình thường.',
      techStack: ['Next.js', 'React', 'TypeScript', 'Express', 'Node.js'],
      links: {
        repo: 'https://github.com/username/personal-site',
        demo: 'https://example.com',
      },
      coverImage: '/file.svg',
      featured: true,
      order: 0,
      createdAt: '2026-09-01T02:00:00.000Z',
      updatedAt: '2026-09-01T02:00:00.000Z',
    },
  ],

  blog: [
    {
      id: 'd1e2f3a4-b5c6-4d7e-9f0a-2b3c4d5e6f7a',
      slug: 'bai-viet-dau-tien',
      title: 'Bài viết đầu tiên',
      excerpt: 'Blog vừa mở — bài viết mẫu do API seed sẵn để kiểm tra danh sách, chi tiết và phân trang.',
      content:
        '## Xin chào!\n\nĐây là **bài viết mẫu** do API seed sẵn khi file dữ liệu còn trống.\n\n- Danh sách 1\n- Danh sách 2\n\n```js\nconsole.log("hello from markdown");\n```\n\nXoá bài này bằng `DELETE /api/blog/bai-viet-dau-tien` (cần secret).',
      tags: ['tin-tuc'],
      coverImage: '',
      status: 'published',
      publishedAt: '2026-09-05T03:00:00.000Z',
      readingTimeMinutes: 1,
      createdAt: '2026-09-05T03:00:00.000Z',
      updatedAt: '2026-09-05T03:00:00.000Z',
    },
  ],

  profile: {
    name: 'Hoang Phuc',
    headline: 'FULL-STACK DEV | CLOUD & INFRA',
    bio: 'Mình xây web full-stack và hạ tầng cloud. Thích code gọn, deploy ổn, đo lường được.',
    location: 'Ho Chi Minh City, Vietnam',
    email: 'you@example.com',
    avatar: '/vercel.svg',
    heroCharacter: '/globe.svg',
    cvUrl: '/cv.pdf',
    technologies: [
      { label: 'React', icon: '/globe.svg', color: '#61dafb' },
      { label: 'Next.js', icon: '/next.svg', color: '#e0e0e0' },
      { label: 'TypeScript', icon: '/file.svg', color: '#3178c6' },
      { label: 'Node.js', icon: '/window.svg', color: '#539e43' },
      { label: 'Express', icon: '/window.svg', color: '#eeeeee' },
      { label: 'Docker', icon: '/vercel.svg', color: '#2496ed' },
      { label: 'AWS', icon: '/globe.svg', color: '#ff9900' },
      { label: 'PostgreSQL', icon: '/file.svg', color: '#4169e1' },
      { label: 'Git', icon: '/window.svg', color: '#f05032' },
    ],
    socials: {
      github: 'https://github.com/username',
      linkedin: 'https://www.linkedin.com/in/username',
    },
    updatedAt: '2026-09-01T02:00:00.000Z',
  },
};

/* ----- đọc / ghi ----- */

function fileFor(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function write(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = fileFor(name);
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, file); // atomic trên cùng một filesystem
  cache.set(name, data);
}

function read(name) {
  if (cache.has(name)) return cache.get(name);
  const file = fileFor(name);
  let data;
  if (fs.existsSync(file)) {
    try {
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      console.error(`[store] ${file} đọc được nhưng JSON hỏng: ${err.message}`);
      console.error('[store] Sửa hoặc xoá file này rồi khởi động lại — server KHÔNG tự ghi đè để tránh mất dữ liệu.');
      process.exit(1);
    }
  } else {
    data = JSON.parse(JSON.stringify(SEEDS[name]));
    write(name, data);
  }
  cache.set(name, data);
  return data;
}

/** Nạp cả 3 bộ dữ liệu lúc khởi động — file hỏng sẽ chết ở đây, không chờ tới request. */
function init() {
  for (const name of NAMES) read(name);
}

module.exports = { init, read, write, DATA_DIR };

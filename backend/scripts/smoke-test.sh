#!/usr/bin/env bash
#
# Smoke test cho API — băng qua toàn bộ "bộ test tối thiểu" ở README mục 14.
# Tự khởi động server trên port riêng + DATA_DIR tạm (KHÔNG đụng dữ liệu thật),
# chạy test, rồi tự tắt. Thoát mã 0 khi pass hết, 1 khi có fail.
#
#   bash scripts/smoke-test.sh
#
set -u

PORT=4100
BASE="http://localhost:$PORT"
SECRET="test-secret-0123456789abcdef0123456789abcdef"
DATA_DIR="$(mktemp -d)"
LOG="$(mktemp)"

PASS=0; FAIL=0
SERVER_PID=""

cleanup() {
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null
  rm -rf "$DATA_DIR" "$LOG"
}
trap cleanup EXIT

# ---- helper ----
check() { # check <tên-case> <kỳ-vọng> <thực-tế>
  local name="$1" expect="$2" actual="$3"
  if [ "$expect" = "$actual" ]; then
    PASS=$((PASS + 1)); echo "  ok    $name"
  else
    FAIL=$((FAIL + 1)); echo "  FAIL  $name  (kỳ vọng $expect, nhận $actual)"
  fi
}

code() { # code <curl-args...> → in mã HTTP
  curl -s -o /dev/null -w '%{http_code}' "$@"
}

auth() { # header secret chuẩn
  echo "-H x-admin-secret:$SECRET"
}

# ---- khởi động server ----
cd "$(dirname "$0")/.."
PORT=$PORT ADMIN_SECRET=$SECRET DATA_DIR=$DATA_DIR CORS_ORIGIN=http://localhost:3000 node server.js >"$LOG" 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 40); do
  curl -s -m 1 "$BASE/api/health" >/dev/null 2>&1 && break
  sleep 0.25
done

echo "== Công khai =="
check "GET /api/health"                 200 "$(code $BASE/api/health)"
check "GET /api/projects (list)"        200 "$(code $BASE/api/projects)"
check "GET /api/projects/:slug sai"     404 "$(code $BASE/api/projects/khong-ton-tai)"
check "GET /api/blog (chỉ published)"   200 "$(code "$BASE/api/blog?page=1&limit=5")"
check "GET /api/profile"                200 "$(code $BASE/api/profile)"
if curl -s $BASE/api/blog | grep -q '"total"'; then
  PASS=$((PASS+1)); echo "  ok    /api/blog trả {items,total,page,limit}"
else
  FAIL=$((FAIL+1)); echo "  FAIL  /api/blog thiếu envelope phân trang"
fi
if curl -s -I $BASE/api/health | grep -qi 'x-content-type-options: nosniff' && \
   ! curl -s -I $BASE/api/health | grep -qi 'x-powered-by'; then
  PASS=$((PASS+1)); echo "  ok    headers: nosniff có, x-powered-by không"
else
  FAIL=$((FAIL+1)); echo "  FAIL  headers helmet sai"
fi

echo "== Auth =="
check "POST thiếu secret → 401"         401 "$(code -X POST -H 'Content-Type: application/json' -d '{"title":"A","summary":"B"}' $BASE/api/projects)"
check "POST sai secret → 401"           401 "$(code -X POST -H 'Content-Type: application/json' -H 'x-admin-secret: sai' -d '{"title":"A","summary":"B"}' $BASE/api/projects)"
FAILCLOSED=$(ADMIN_SECRET= node -e "
const middleware = require('./src/middlewares/require-secret');
try { middleware({ get: () => null }, {}, () => {}); console.log('NEXT_CALLED'); }
catch (e) { console.log(e.status || 'OTHER'); }
")
check "fail-closed khi chưa cấu hình ADMIN_SECRET → 503" 503 "$FAILCLOSED"

echo "== Ghi projects =="
CREATE_RESP=$(curl -s -w '\n%{http_code}' -X POST -H 'Content-Type: application/json' -H "x-admin-secret: $SECRET" \
  -d '{"title":"Dự án mới!","summary":"Kiểm tra API","techStack":["Node.js"],"featured":true,"order":1}' $BASE/api/projects)
CREATE_CODE=$(echo "$CREATE_RESP" | tail -1)
CREATE_BODY=$(echo "$CREATE_RESP" | head -n -1)
check "POST project → 201"              201 "$CREATE_CODE"
if echo "$CREATE_BODY" | grep -q '"slug":"du-an-moi"'; then
  PASS=$((PASS+1)); echo "  ok    slugify bỏ dấu tiếng Việt: 'Dự án mới!' → du-an-moi"
else
  FAIL=$((FAIL+1)); echo "  FAIL  slugify: $(echo "$CREATE_BODY" | head -c 200)"
fi
check "POST trùng slug → 409"           409 "$(code -X POST -H 'Content-Type: application/json' -H "x-admin-secret: $SECRET" -d '{"title":"Dự án mới!","summary":"Lại là nó"}' $BASE/api/projects)"
SUGGEST=$(curl -s -X POST -H 'Content-Type: application/json' -H "x-admin-secret: $SECRET" -d '{"title":"Dự án mới!","summary":"Lại là nó"}' $BASE/api/projects | grep -o '"suggestedSlug":"[^"]*"' | head -1)
if [ "$SUGGEST" = '"suggestedSlug":"du-an-moi-2"' ]; then
  PASS=$((PASS+1)); echo "  ok    409 kèm gợi ý du-an-moi-2"
else
  FAIL=$((FAIL+1)); echo "  FAIL  gợi ý slug: $SUGGEST"
fi
check "PATCH project → 200"             200 "$(code -X PATCH -H 'Content-Type: application/json' -H "x-admin-secret: $SECRET" -d '{"summary":"Đã sửa"}' $BASE/api/projects/du-an-moi)"
check "DELETE project → 200"            200 "$(code -X DELETE -H "x-admin-secret: $SECRET" $BASE/api/projects/du-an-moi)"
check "GET sau DELETE → 404"            404 "$(code $BASE/api/projects/du-an-moi)"

echo "== Ghi blog =="
check "POST blog thiếu title → 400"     400 "$(code -X POST -H 'Content-Type: application/json' -H "x-admin-secret: $SECRET" -d '{"content":"abc"}' $BASE/api/blog)"
LONG_TAGS=$(printf '{"title":"T","content":"c","tags":[%s]}' "$(for i in $(seq 1 11); do printf '"t%d",' "$i"; done | sed 's/,$//')")
check "POST tags 11 phần tử → 400"      400 "$(code -X POST -H 'Content-Type: application/json' -H "x-admin-secret: $SECRET" -d "$LONG_TAGS" $BASE/api/blog)"
DRAFT_CODE=$(curl -s -X POST -H 'Content-Type: application/json' -H "x-admin-secret: $SECRET" -d '{"title":"Bài nháp","content":"Nội dung nháp"}' $BASE/api/blog | grep -o '"status":"[^"]*"' | head -1)
check "POST blog mặc định draft"        '"status":"draft"' "$DRAFT_CODE"
check "GET blog draft (công khai) → 404" 404 "$(code $BASE/api/blog/bai-nhap)"
check "GET /admin/:slug thấy draft"     200 "$(code -H "x-admin-secret: $SECRET" $BASE/api/blog/admin/bai-nhap)"
PUBLISH_CODE=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH -H 'Content-Type: application/json' -H "x-admin-secret: $SECRET" -d '{"status":"published"}' $BASE/api/blog/bai-nhap)
check "PATCH status published → 200"    200 "$PUBLISH_CODE"
if curl -s $BASE/api/blog/bai-nhap | grep -q '"publishedAt":"2'; then
  PASS=$((PASS+1)); echo "  ok    publishedAt tự set lần đầu published"
else
  FAIL=$((FAIL+1)); echo "  FAIL  publishedAt không được set"
fi
check "DELETE blog → 200"               200 "$(code -X DELETE -H "x-admin-secret: $SECRET" $BASE/api/blog/bai-nhap)"

echo "== Body & validate =="
check "JSON hỏng → 400 (không HTML)"    400 "$(code -X POST -H 'Content-Type: application/json' -d '{không phải json' $BASE/api/projects)"
if curl -s -X POST -H 'Content-Type: application/json' -d '{broken' $BASE/api/projects | grep -q 'INVALID_JSON'; then
  PASS=$((PASS+1)); echo "  ok    lỗi JSON trả format {error:{code,message}}"
else
  FAIL=$((FAIL+1)); echo "  FAIL  lỗi JSON sai format"
fi
check "PATCH profile body rỗng → 400"   400 "$(code -X PATCH -H 'Content-Type: application/json' -H "x-admin-secret: $SECRET" -d '{}' $BASE/api/profile)"

echo "== Profile PATCH =="
check "PATCH profile → 200"             200 "$(code -X PATCH -H 'Content-Type: application/json' -H "x-admin-secret: $SECRET" -d '{"bio":"Bio mới","technologies":[{"label":"React","icon":"/next.svg","color":"#61DAFB"}],"socials":{"github":"https://github.com/u"}}' $BASE/api/profile)"
if curl -s $BASE/api/profile | grep -q '"color":"#61dafb"'; then
  PASS=$((PASS+1)); echo "  ok    technologies normalize #rrggbb"
else
  FAIL=$((FAIL+1)); echo "  FAIL  technologies không lưu đúng"
fi
check "socials http (không https) → 400" 400 "$(code -X PATCH -H 'Content-Type: application/json' -H "x-admin-secret: $SECRET" -d '{"socials":{"github":"http://github.com/u"}}' $BASE/api/profile)"

echo "== Rate limit (chống dò secret) =="
# Trước phần này đã có 9 request “thất bại” (401/400/409) vào route ghi — mặc định giới hạn 10.
LAST=000
for i in $(seq 1 15); do
  LAST=$(code -X POST -H 'Content-Type: application/json' -H 'x-admin-secret: sai' -d '{"title":"A","summary":"B"}' $BASE/api/projects)
  [ "$LAST" = "429" ] && break
done
check "sai secret liên tục → 429" 429 "$LAST"
RL_HEADERS=$(curl -s -D - -o /dev/null -X POST -H 'Content-Type: application/json' -H 'x-admin-secret: sai' -d '{"title":"A","summary":"B"}' $BASE/api/projects)
if echo "$RL_HEADERS" | grep -qi 'retry-after'; then
  PASS=$((PASS+1)); echo "  ok    429 kèm header Retry-After"
else
  FAIL=$((FAIL+1)); echo "  FAIL  429 thiếu Retry-After"
fi

echo "== Audit log =="
if grep -q '\[audit\]' "$LOG" && ! grep -q "$SECRET" "$LOG"; then
  PASS=$((PASS+1)); echo "  ok    có [audit] và log không chứa secret"
else
  FAIL=$((FAIL+1)); echo "  FAIL  audit log thiếu hoặc lộ secret"
fi

echo "== Dữ liệu (ghi ra file thật) =="
if [ -f "$DATA_DIR/projects.json" ]; then
  PASS=$((PASS+1)); echo "  ok    ghi file JSON vào DATA_DIR"
else
  FAIL=$((FAIL+1)); echo "  FAIL  không thấy file dữ liệu"
fi

echo
echo "Kết quả: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR"
BACKEND_DIR="$(cd "$ROOT_DIR/.." && pwd)/rent-server"
GO_BIN=""

find_go_bin() {
  if command -v go >/dev/null 2>&1; then
    command -v go
    return 0
  fi

  for candidate in \
    /opt/homebrew/bin/go \
    /usr/local/bin/go \
    /usr/local/go/bin/go \
    "$HOME/.asdf/shims/go" \
    "$HOME/.mise/shims/go"; do
    if [ -x "$candidate" ]; then
      echo "$candidate"
      return 0
    fi
  done

  return 1
}

is_backend_running() {
  curl -s --max-time 1 "http://127.0.0.1:8080" >/dev/null 2>&1
}

if [ ! -d "$BACKEND_DIR" ]; then
  echo "[error] 未找到后端目录: $BACKEND_DIR"
  echo "请确认 rent 与 rent-server 在同一级目录下。"
  exit 1
fi

if GO_BIN="$(find_go_bin)"; then
  GO_DIR="$(dirname "$GO_BIN")"
  export PATH="$GO_DIR:$PATH"
else
  if is_backend_running; then
    echo "[warn] 未检测到 Go，但发现 8080 端口已有后端服务，将仅启动前端。"
  else
    echo "[error] 当前环境未安装 Go，且未检测到 8080 后端服务。"
    echo "可先手动启动后端：cd ../rent-server && go run main.go"
    exit 1
  fi
fi

cleanup() {
  if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "[info] 启动后端服务 (rent-server)..."
if is_backend_running; then
  echo "[info] 检测到后端已在运行，跳过重复启动。"
  BACKEND_PID=""
else
  (
    cd "$BACKEND_DIR"
    "$GO_BIN" run main.go
  ) &
  BACKEND_PID=$!
fi

echo "[info] 启动前端服务 (rent)..."
(
  cd "$FRONTEND_DIR"
  npm run dev
) &
FRONTEND_PID=$!

echo "[info] 前后端已启动。按 Ctrl+C 可一键停止。"

echo "[info] 后端目录: $BACKEND_DIR"
echo "[info] 前端目录: $FRONTEND_DIR"

EXIT_CODE=0
while true; do
  if [ -n "${BACKEND_PID:-}" ]; then
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
      wait "$BACKEND_PID" || EXIT_CODE=$?
      echo "[warn] 后端进程已退出，正在关闭前端..."
      break
    fi
  fi

  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    wait "$FRONTEND_PID" || EXIT_CODE=$?
    echo "[warn] 前端进程已退出，正在关闭后端..."
    break
  fi

  sleep 1
done

exit "$EXIT_CODE"

#!/bin/zsh
set -eu
set -o pipefail

project_dir=${0:A:h}
cd "$project_dir"

port=4174
url="http://127.0.0.1:${port}/"

is_dnd_terminal_server() {
  /usr/bin/curl --silent --fail --max-time 1 "${url}index.html" \
    | /usr/bin/grep -q '<title>DND Terminal'
}

open_dnd_terminal() {
  if [[ -d '/Applications/Google Chrome.app' || -d "${HOME}/Applications/Google Chrome.app" ]]; then
    /usr/bin/open -a 'Google Chrome' "$url"
  else
    /usr/bin/open "$url"
  fi
}

# 双击启动器时，上一份本地服务可能仍在运行。确认它确实是 DND Terminal 后直接复用，
# 避免因 EADDRINUSE 在打开浏览器前退出，也避免静默换端口造成 localStorage 分裂。
if is_dnd_terminal_server; then
  echo "DND Terminal 已在 ${url} 运行；正在复用并打开 Chrome。"
  open_dnd_terminal
  exit 0
fi

if /usr/sbin/lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "无法启动：端口 ${port} 已被其他程序占用。"
  echo "为保护浏览器中的长期角色卡，本启动器不会自动切换端口。"
  echo "请关闭占用 ${port} 的程序后重试。"
  read -k 1 "?按任意键关闭窗口。"
  echo
  exit 1
fi

/usr/bin/python3 -m http.server "$port" --bind 127.0.0.1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT INT TERM

for attempt in {1..30}; do
  if is_dnd_terminal_server; then
    open_dnd_terminal
    wait "$server_pid"
    exit 0
  fi
  if ! kill -0 "$server_pid" 2>/dev/null; then
    echo "DND Terminal 本地服务启动失败。"
    exit 1
  fi
  sleep 0.1
done

echo "DND Terminal 本地服务在 3 秒内未准备完成。"
exit 1

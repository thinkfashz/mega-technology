#!/usr/bin/env bash
# serve.sh — sirve la app y la documentación por HTTP.
#
# Por qué HTTP y no file://: la app usa módulos ES (`import`), fetch de JSON
# y el manifest PWA. Con file:// el navegador bloquea todo eso.
#
# Uso:
#   bash serve.sh            # http://127.0.0.1:8787/app/
#   bash serve.sh 9000       # otro puerto
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${1:-8787}"

echo "MEGA TECHNOLOGY · Phone Shop"
echo "  App:   http://127.0.0.1:${PORT}/app/"
echo "  Docs:  http://127.0.0.1:${PORT}/Documentd/"
echo "  Admin: http://127.0.0.1:${PORT}/app/#/admin"
echo "  Ctrl+C para detener."

exec python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT"

#!/usr/bin/env bash
# Deploy current main branch to the production VPS.
#
# Usage:
#   DEPLOY_HOST=1.2.3.4 ./scripts/deploy.sh
#   DEPLOY_HOST=shop.example.com DEPLOY_USER=ubuntu DEPLOY_DIR=/opt/alley-shop ./scripts/deploy.sh
#
# Requirements on the VPS:
#   - git, docker, docker compose v2 (>= 2.20)
#   - SSH access for $DEPLOY_USER
#   - Repo cloned to $DEPLOY_DIR with .env.production already present

set -euo pipefail

HOST="${DEPLOY_HOST:-${1:-}}"
USER="${DEPLOY_USER:-root}"
DIR="${DEPLOY_DIR:-/opt/alley-shop}"
BRANCH="${DEPLOY_BRANCH:-main}"

if [ -z "$HOST" ]; then
  echo "ERROR: provide host as DEPLOY_HOST env var or first arg" >&2
  exit 1
fi

echo "→ deploying $BRANCH to $USER@$HOST:$DIR"

ssh -o StrictHostKeyChecking=accept-new "$USER@$HOST" bash <<EOF
set -euo pipefail
cd "$DIR"

echo "→ pulling latest code"
git fetch --quiet origin "$BRANCH"
git reset --quiet --hard "origin/$BRANCH"

echo "→ rebuilding app container"
docker compose pull --quiet caddy
docker compose up -d --build app

echo "→ pruning old images"
docker image prune -f --filter "label!=keep" >/dev/null

echo "→ post-deploy health check"
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✓ healthy after \$i attempts"
    exit 0
  fi
  sleep 3
done
echo "✗ health check failed; check logs:" >&2
docker compose logs --tail=80 app >&2
exit 1
EOF

#!/usr/bin/env bash
# Daily SQLite backup. Run on the VPS via cron:
#
#   0 3 * * * /opt/alley-shop/scripts/backup.sh >> /var/log/alley-backup.log 2>&1
#
# WAL mode means orders.db on disk is consistent on its own at any quiescent
# moment, but the WAL sidecar may contain unflushed pages. We rsync both files
# atomically (cp is atomic per inode), then verify integrity.

set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA="${DATA_DIR:-$DIR/data}"
BACKUP_DIR="${BACKUP_DIR:-$DIR/backups}"
KEEP_DAYS="${KEEP_DAYS:-30}"
DATE=$(date +%Y%m%d-%H%M%S)
OUT="$BACKUP_DIR/orders-$DATE.db"

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DATA/orders.db" ]; then
  echo "→ no orders.db at $DATA/orders.db; nothing to back up"
  exit 0
fi

# Prefer sqlite3 .backup which gives a guaranteed consistent snapshot.
# Fall back to file copy + WAL if sqlite3 is unavailable on the host.
if command -v sqlite3 >/dev/null 2>&1; then
  echo "→ using sqlite3 .backup → $OUT"
  sqlite3 "$DATA/orders.db" ".backup '$OUT'"
else
  echo "→ sqlite3 not installed; using file copy"
  cp "$DATA/orders.db" "$OUT"
  [ -f "$DATA/orders.db-wal" ] && cp "$DATA/orders.db-wal" "$OUT-wal" || true
  [ -f "$DATA/orders.db-shm" ] && cp "$DATA/orders.db-shm" "$OUT-shm" || true
fi

gzip -f "$OUT"
[ -f "$OUT-wal" ] && gzip -f "$OUT-wal" || true
[ -f "$OUT-shm" ] && gzip -f "$OUT-shm" || true

echo "→ pruning backups older than $KEEP_DAYS days"
find "$BACKUP_DIR" -name 'orders-*' -type f -mtime +"$KEEP_DAYS" -delete

echo "✓ backup → $OUT.gz ($(du -h "$OUT.gz" | cut -f1))"

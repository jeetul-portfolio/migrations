#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <migration-name>"
  echo "Example: $0 create-users-table"
  exit 1
fi

RAW_NAME="$*"
SLUG=$(echo "$RAW_NAME" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')

if [[ -z "$SLUG" ]]; then
  echo "Error: migration name must include letters or numbers."
  exit 1
fi

MIGRATIONS_DIR="mysql-migrations/migrations"
mkdir -p "$MIGRATIONS_DIR"

TIMESTAMP=$(date -u +"%Y%m%d%H%M%S")
FILE_PATH="$MIGRATIONS_DIR/${TIMESTAMP}-${SLUG}.js"

if [[ -e "$FILE_PATH" ]]; then
  sleep 1
  TIMESTAMP=$(date -u +"%Y%m%d%H%M%S")
  FILE_PATH="$MIGRATIONS_DIR/${TIMESTAMP}-${SLUG}.js"
fi

cat > "$FILE_PATH" << 'EOF'
module.exports = {
  up: async ({ context: queryInterface }) => {
  },

  down: async ({ context: queryInterface }) => {
  },
};
EOF

echo "Created migration: $FILE_PATH"

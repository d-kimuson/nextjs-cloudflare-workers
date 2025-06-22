#!/usr/bin/env bash
# このデプロイスクリプトは事前にビルドされている前提で動作する

set -euxo pipefail

export NEXT_BASE_URL=https://okazu-navi.com
export ENVIRONMENT=production

pnpm migrate:prod
pnpm deploy:prod

#!/usr/bin/env bash

set -euo pipefail

cd ./src/batch

echo $DMM_API_ID | pnpm dlx wrangler secret put DMM_API_ID
echo $DMM_AFFILIATE_ID | pnpm dlx wrangler secret put DMM_AFFILIATE_ID

pnpm dlx wrangler deploy --minify --keep-vars=true
cd -

#!/bin/sh
set -e

if [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
    echo "Starting Cloudflare Tunnel for Node 2..."
    cloudflared tunnel --no-autoupdate run --token "${CLOUDFLARE_TUNNEL_TOKEN}" &
fi

exec node server.js

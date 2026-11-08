FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y curl ca-certificates iproute2 \
    && curl -L --output /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
    && dpkg -i /tmp/cloudflared.deb \
    && rm -f /tmp/cloudflared.deb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --production 2>/dev/null || true
COPY . .

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]

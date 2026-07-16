#!/bin/bash
# Adiciona rota hub.tupier.net ao tunnel Cloudflare do Paperclip
# Uso: ssh root@10.0.0.5 "bash -s" < add-tunnel-route.sh

set -e

# Novo config YAML
cat > /tmp/cloudflared-config.yml << 'CONFIG'
tunnel: tupgroup
credentials-file: /root/.cloudflared/tupgroup.json
ingress:
  - hostname: ceo.tupgroup.net
    service: http://localhost:3100
  - hostname: hub.tupier.net
    service: http://10.0.0.61:3000
  - service: http_status:404
CONFIG

# Copiar para Paperclip via guest exec
qm guest exec 114 -- /bin/bash -c "
cp /etc/cloudflared/config.yml /etc/cloudflared/config.yml.bak
cat > /tmp/new-config.yml << 'EOF'
tunnel: tupgroup
credentials-file: /root/.cloudflared/tupgroup.json
ingress:
  - hostname: ceo.tupgroup.net
    service: http://localhost:3100
  - hostname: hub.tupier.net
    service: http://10.0.0.61:3000
  - service: http_status:404
EOF
cp /tmp/new-config.yml /etc/cloudflared/config.yml
systemctl restart cloudflared
sleep 3
systemctl status cloudflared --no-pager 2>&1 | head -5
"

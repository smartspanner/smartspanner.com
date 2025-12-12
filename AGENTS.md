# SmartSpanner Marketing Site - Jekyll

## Overview
Marketing website for SmartSpanner CMMS (Computerized Maintenance Management System).

## Access
- **Production**: https://www.smartspanner.com
- **Local Dev**: http://localhost:8080/smartspanner

## Build Commands
```bash
# Build for local development
docker compose exec jekyll jekyll build --config _config.yml,_config_dev.yml

# Watch mode
docker compose exec jekyll jekyll build --config _config.yml,_config_dev.yml --watch
```

## Key Info
- **App URL**: https://app.smartspanner.com
- **Support**: https://support.smartspanner.com

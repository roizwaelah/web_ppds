# Shared Hosting Setup (JWT Maintenance)

This project supports JWT maintenance via CLI cron and HTTP cron.

## 1) Required env keys

Add to `.env`:

- `MAINTENANCE_TOKEN=<random-long-secret>`
- `MAINTENANCE_ALLOW_HTTP=true`

Notes:

- Keep `MAINTENANCE_TOKEN` secret.
- If your hosting supports CLI cron, you may set `MAINTENANCE_ALLOW_HTTP=false`.

## 2) CLI Cron (Recommended)

Use your hosting cron panel and run every 30 minutes:

```bash
/usr/bin/php /home/USER/public_html/api/maintenance/jwt_maintenance.php >> /home/USER/logs/jwt_maintenance.log 2>&1
```

Adjust php binary/path based on hosting:

- `/usr/bin/php`
- `/opt/cpanel/ea-php82/root/usr/bin/php`

## 3) HTTP Cron (Fallback)

If CLI is unavailable, use an HTTP cron service with header token:

```bash
curl -fsS -H "X-Maintenance-Token: <MAINTENANCE_TOKEN>" "https://your-domain.com/api/maintenance/jwt_maintenance.php"
```

Or query token (less secure because token appears in URL/logs):

```bash
https://your-domain.com/api/maintenance/jwt_maintenance.php?token=<MAINTENANCE_TOKEN>
```

## 4) What the maintenance script does

- Purges expired rows from `jwt_denylist`.
- Finalizes JWT secret rotation by removing:
  - `JWT_PREVIOUS_SECRET`
  - `JWT_PREVIOUS_SECRET_UNTIL`
  when grace window has passed.

## 5) Security tips

- Prefer CLI cron over HTTP cron.
- Prefer header token over query token.
- Restrict access with WAF/IP allowlist if possible.
- Disable HTTP mode when not needed: `MAINTENANCE_ALLOW_HTTP=false`.
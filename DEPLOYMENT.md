# VPS deployment

The intended deployment target is the existing Hostinger VPS. Cleanup does not deploy the application, change DNS, or replace the current WordPress site.

## Release preparation

Run checks in the development workspace before packaging:

```sh
npm run typecheck
npm test
npm run build
npm run package:deploy
```

The source bundle is `dist/jade-source.tar.gz`; `dist/manifest.json` records its SHA-256 and contents. It contains application source, build configuration, scripts, public assets, a sanitized environment template, and current documentation. It excludes `.env.local`, `node_modules`, `.next`, local databases, WordPress exports, migration backups, tests, old notes, and the external image archive. Retain tests in the development workspace for future changes.

## Server installation

Upload and extract the bundle into a new release directory, keeping the current site available. Use a supported Node.js LTS release satisfying dependency engine requirements (at least 20.19); local verification used 20.20.2, so verify the selected server runtime during staging. Install dependencies on the server rather than copying macOS binaries:

```sh
npm ci
cp .env.example .env.local
# Edit .env.local with the approved server configuration.
npm run build
npm start -- --hostname 127.0.0.1 --port 3000
```

Configure `MONGODB_URI` for the intended server database; use unique authentication secrets and the real HTTPS origin for `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_URL`, and email URLs. Configure payment, email, monitoring, Axis Rooms, and cron credentials only when their production settings are approved. The example payment mode is `test`; do not assume it enables live payments. An Axis API key was removed from the old example file during cleanup; revoke/rotate that exposed key before production use.

Use the VPS process manager to keep the server running and the existing reverse proxy to provide HTTPS. Confirm staging behavior before directing the production domain to the new service. Configure approved cron routes through the VPS scheduler; the old Vercel configuration has been archived. Do not seed demonstration users or run broad database restoration commands against live bookings and accounts.

## Blog and media transfer

The migrated articles currently exist in the local MongoDB CMS. Take a production backup, then transfer the required CMS records into the intended VPS database using a reviewed import that preserves existing accounts, bookings, and content. Local preparation files and snapshots remain in `tmp/wordpress-migration`; they are deliberately excluded from the source bundle. Confirm all published article URLs and the sitemap against the deployed database.

The bundle includes all 361 referenced blog images at their original `/wp-content/uploads/...` URLs and optimized copies in `/blog-media/wordpress`. Preserve other existing WordPress upload files on the VPS, including files absent from this article export. The 2 GB source image archive is preserved outside the project for reference; it is not served by the new application.

See [the migration report](docs/wordpress-blog-migration.md) for importer commands and the exact draft/link list. The migration was verified locally; production data transfer has not happened.

## Launch requirements still open

- Resolve dependency security findings before public launch. The cleanup audit (`npm audit --omit=dev`) reported 62 findings, including two critical and nine high findings, affecting Next.js, NextAuth, and other dependencies. Framework upgrades require compatibility checks and a new production build; cleanup did not silently update them.
- Confirm destinations for the 34 unresolved legacy WordPress paths, especially `/retreat/...` property URLs. Existing articles retain these links. Confirm the intended `/all-experiences/` route and property slug mappings before switching the domain.
- Review historical alias conflicts and the 99 proposed redirects. They remain disabled; the separate Rank Math redirect export has not been activated.
- Complete production database/media transfer, credentials, scheduled jobs, and payment/Axis Rooms verification before cutover. The nine incomplete WordPress articles remain drafts.

Passing a local build confirms compilation, not completion of these launch requirements.

## Axis Rooms production mappings — 13 October 2026

Ten properties from Axis's supplied table are now mapped in the local database: Red Dome, Yellow Dome, Emerald, Blue Dome, Haven, Magnolia, Tranquil Woods, Retreat on the Ridge, Jade 735, and Lemon Tree. Kintsugi is skipped as requested. The IDs are recorded in `src/data/axisrooms/production-mappings.json`; old synthetic mappings on properties without confirmed production IDs were removed, preserving the properties and their bookings.

To apply the same reviewed mappings to the intended server database after backing it up:

```sh
npm run axis:configure:production
npm run axis:configure:production -- --apply
```

These commands only update the database; they do not send rates or inventory to Axis. A mapping backup is saved under `tmp/axisrooms-production` before changes. Existing bookings and inventory ledgers are not rewritten or sent as part of this mapping change; reconcile opening availability with Axis before beginning live sync.

The API URL is `https://app.axisrooms.com`. The existing access key and channel ID 229 still need confirmation from Axis. `AXIS_ROOMS_ENABLED=false` keeps API traffic and inbound receipt paused locally; use a confirmed production key/channel and set it to `true` only when ready to activate. Restart the server after environment changes. Production connectivity has not been tested. The sandbox test commands are blocked against the production API URL.

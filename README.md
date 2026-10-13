# Jade Hospitainment

Next.js application for the public website, bookings, and the staff dashboard. Uses React, TypeScript, Tailwind CSS, MongoDB/Mongoose, and NextAuth.

## Local development

Use a supported Node.js LTS release satisfying dependency engine requirements (at least 20.19), npm, and a MongoDB database. Local checks used Node.js 20.20.2; verify the selected server runtime during staging.

```sh
npm ci
cp .env.example .env.local
# Configure .env.local for your local database and integrations.
npm run db:start
```

Keep the database command running in one terminal. In another:

```sh
npm run dev
```

Open http://localhost:3000. The local database helper persists data in `tmp/mongo-data`; preserve that directory. If using an existing MongoDB server, configure `MONGODB_URI` and skip the helper.

## Checks and release

```sh
npm run typecheck
npm test
npm run build
npm run package:deploy
```

`npm start` serves a completed production build. `package:deploy` creates `dist/jade-source.tar.gz` and a checksum/file manifest. It packages source and public assets; the server must install dependencies and build for its own platform. Local secrets, databases, exports, caches, tests, and archives are excluded.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the VPS procedure and outstanding launch requirements.

## Content and integrations

- `src/app`, `src/components`, and `src/lib`: application code.
- `public`: served assets, including original WordPress upload paths and optimized blog images.
- `src/Jade Property Data/Jade_Property_Data.md`: property seed data used by `npm run db:seed`; this Markdown file is required.
- [WordPress migration report](docs/wordpress-blog-migration.md): imported articles, verification, and unresolved legacy links. Article bodies are stored in MongoDB, so copying code alone does not transfer them.
- [Axis Rooms reference](docs/axisrooms-api-reference.md): integration contract and sync behavior.

Old handover notes, one-off operations scripts, editor/deployment state, the unserved `images` archive, and the original property document were preserved outside this project in `/Users/wasim/Desktop/jade-cleanup-2026-10-13`. The archive has a cleanup manifest. Keep credentials and local data private; `.env.example` contains placeholders only.

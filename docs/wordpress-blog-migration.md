# WordPress blog migration — 13 October 2026

Source: `jadehospitainment.WordPress.2026-10-13.xml` from `https://jadehospitainment.com`.

## Result

- **520 WordPress posts** stored in the existing local MongoDB `jadeapp` CMS: **511 published**, **9 drafts**.
- Existing CMS posts were preserved. Rerunning the importer inserted zero duplicates and left imported posts unchanged.
- Original article slugs and `https://jadehospitainment.com/{slug}/` canonical URLs are retained.
- The public list is `/blogs/`, with 12 articles per page. Articles are editable at `/dashboard/seo/blogs` using the HTML builder.
- Available titles, excerpts, authors, dates, categories, tags, Rank Math metadata and featured images were imported. All original categories are retained in internal notes; the existing CMS has one primary category field.
- WordPress CSS and scripts were removed; bodies use the site's typography and retain headings, lists, links, tables and image alt text.
- **361 unique images** are available locally both at their original `/wp-content/uploads/...` paths and as optimized WebP files under `/blog-media/wordpress/`. No media fetch failed.
- Article URLs, canonicals, Open Graph, structured data, sitemap, dashboard previews and revalidation now use root paths. Previous `/blogs/{slug}` article links permanently redirect to root article URLs.
- Historical alias redirects are proposals only: 99 unambiguous entries are listed in `wordpress-blog-redirects.proposed.json` and stored **disabled** in the CMS. Four ambiguous aliases are marked as conflicts and excluded from the proposal. The separate Rank Math redirect export has not been activated.

This migration was applied only to the local database and local project files. Production cutover and database/media deployment have not been performed. The complete WordPress media archive was not imported; only images referenced by these articles were copied.

Historical alias conflicts: `/corporate-getaways`, `/villas-for-pool-parties-in-bangalore-with-jade-hospitainment`, `/villa-for-family-stays-in-bangalore-with-jade-hospitainment`, `/perfect-villa-for-get-together-in-bangalore-with-jade-hospitainment`.

## Original entries held as drafts

These entries contain empty bodies, placeholder text or short teasers in the supplied export. They were retained without inventing missing copy.

| Title | Original slug | Body words |
|---|---|---:|
| Corporate Events | `3xyz` | 2 |
| Wedding & Celebrations | `3xyz-copy` | 0 |
| Friends & Family | `3xyz-copy-copy` | 0 |
| Friends & Family | `friends-family` | 0 |
| Corporate Events | `corporate-events` | 2 |
| We Found Paradise At this Boutique Mansion Just Near The Bangalore Airport | `top-5-places-to-have-your-wedding` | 43 |
| Bengaluru’s First-Ever Dome Villas – Perfect For Friends & Family Getaway! | `6-spots-to-host-parties-in-bangalore` | 36 |
| Luxury Homestays: Unforgettable Stays in Beautiful Destinations | `luxury-homestays-in-bangalore` | 2 |
| Exceptional Event Venues in Bangalore with Jade Hospitainment | `exceptional-event-venues-in-bangalore-with-jade-hospitainment` | 0 |

## Legacy links requiring confirmed destinations

Blog-to-blog links now point to the corresponding root articles. These remaining WordPress paths were preserved rather than assigning unconfirmed property or page destinations. The source WordPress site currently remains their host; these links need resolution before production cutover.

| Legacy path | Articles referencing it |
|---|---:|
| `/retreats` | 458 |
| `/retreat/magnolia` | 416 |
| `/retreat/jade-735` | 397 |
| `/retreat/dome-villas` | 378 |
| `/retreat/the-haven-by-jade` | 328 |
| `/retreat/diamonds-pavilion-by-jade` | 278 |
| `/connect-with-us` | 253 |
| `/gallery` | 252 |
| `/about-jade-retreats` | 187 |
| `/retreat/tranquil-woods` | 142 |
| `/retreat/emerald` | 70 |
| `/retreat/mae-terra` | 26 |
| `/retreat/retreat-on-the-ridge` | 25 |
| `/retreat/ratha` | 22 |
| `/retreat/the-royalty` | 18 |
| `/retreat/lemon-tree` | 16 |
| `/retreat/lounge-fly` | 8 |
| `/luxury-private-pool-villa-in-bangalore-3` | 8 |
| `/retreat/palatio` | 6 |
| `/retreat/tranquil-woods-by-jade` | 5 |
| `/retreat/the-royalty-by-jade` | 4 |
| `/luxury-team-outing-in-bangalore-3` | 4 |
| `/private-pool-villa-in-bangalore-6` | 3 |
| `/farmhouse-for-party-in-bangalore-by-jade-hospitainment` | 3 |
| `/private-pool-villa-in-bangalore-4` | 3 |
| `/private-pool-villa-in-bangalore-7` | 2 |
| `/private-pool-villa-in-bangalore-8` | 2 |
| `/retreat/vanani-by-jade` | 1 |
| `/_wp_link_placeholder` | 1 |
| `/jadehospitainment.com/retreat/magnolia` | 1 |
| `/birthday-party-places-near-me` | 1 |
| `/luxury-private-pool-villa-in-bangalore-2` | 1 |
| `/private-pool-villa-in-bangalore-2` | 1 |
| `/weekend-getaway-in-bangalore` | 1 |

## Verification results

- All 511 published root article URLs returned HTTP 200 without redirecting away from their original trailing-slash URLs. Each response contains the imported body and correct canonical.
- All 520 CMS records were compared with the prepared content and metadata.
- All 361 original and optimized image copies exist locally. Desktop and mobile article rendering were visually checked, with no mobile horizontal overflow. A listing card was also opened through browser navigation.
- Every published imported article is in the sitemap. All nine draft URLs and an unknown article URL returned 404.
- A previous `/blogs/{slug}` URL returned a permanent HTTP 308 to the root article.
- The import was rerun: zero duplicate posts were created and existing content was preserved.

## Reproduce and verify

Run from the project root with Python 3, installed npm dependencies, and the intended database configured in `.env.local`:

```sh
# Prepare a report without writing to the database.
npm run blogs:import:wordpress -- /path/to/wordpress-export.xml

# Copy referenced images and insert posts into the configured database.
# Existing posts are never overwritten.
npm run blogs:import:wordpress -- /path/to/wordpress-export.xml --apply

# With the local web server running, verify the imported corpus and routes.
npm run blogs:verify:wordpress
```

Local artifacts are in `tmp/wordpress-migration/`: `prepared-posts.json`, `report.json`, pre-insert database snapshots (`backup-*.json`), `verification.json`, and database snapshots. Desktop/mobile screenshots and diagnostic logs are preserved in the external cleanup archive. Keep the XML export, prepared data, original image files and optimized image files for deployment. Copying source code alone does not migrate the database content.

Deployment cleanup resolved the read-only `NODE_ENV` assignments/deletions using Vitest environment stubs. The full type check and unit suite now pass (44 files, 257 tests).

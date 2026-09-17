# SEO implementation

- Configure NEXT_PUBLIC_SITE_URL to the canonical production origin (default: https://heya-stock.vercel.app). Rebuild after changing this variable.
- Public browse/search pages now use server-side queries, 24 items per page, real pagination links, self-canonicals and noindex for search/filter combinations.
- Public catalog reads stay fresh so removing approval removes public access without waiting for a persistent page cache. React cache deduplicates lookups within a request.
- Sitemap reads all approved rows in stable batches and includes image URLs. It deliberately omits lastmod until trustworthy modification timestamps exist. Split into multiple sitemaps before reaching 50,000 URLs.
- Video approval creates a JPEG sidecar beside the published file: original-video-url.poster.jpg. No database migration is required.
- The 29 existing approved videos have real extracted JPEG frames in public/video-thumbnails, mapped by exact source URL in lib/video-thumbnails.json. The same image is used for VideoObject.thumbnailUrl, the player poster and sharing metadata. To regenerate local frames, set FFMPEG_PATH and run node scripts/generate-video-thumbnails.mjs. For subsequent approved videos without posters, open Admin > Media and select Create video preview. This uses the existing authenticated storage permissions. Videos without a real poster remain playable, use the brand share card and do not emit incomplete VideoObject markup. Poster availability refreshes within five minutes.
- Failed poster generation leaves a submission pending and removes the newly published copy. Legacy video formats unsupported by the admin browser need conversion before approval.
- Image alt text uses the contributor's title without appended keywords; descriptive titles and descriptions still require editorial review. No creator identity or rights information is fabricated.
- Public image rendering reserves layout space, requests responsive optimized images for configured Supabase storage, and lazy-loads grids. Original downloads are unchanged.
- Account/admin layouts retain noindex. robots.txt permits reading those directives. Supabase authorization policies remain responsible for private-data access.
- Check with npm run test:seo, npm run lint, and npm run build. After deployment, validate representative photo/video URLs in Rich Results Test and measure mobile/desktop Core Web Vitals. Local builds do not establish production performance scores.

# Javalin 7 Release Checklist

## Documentation Updates

### Core Documentation
- [x] `pages/docs/docs-future-7.md` renamed to `pages/docs/docs.md`; old `docs.md` moved to `docs-past-6-X.md`
- [x] `pages/docs/migration-guide-6-7.md` - Migration guide created and link references updated
- [x] `pages/docs/docs.md` - Cleaned up intro (removed "Major Changes in Javalin 7" bullet list, added Java 17+/Jetty 12+ statement)

### Plugin Documentation
- [x] `pages/plugins/how-to.md` - Fixed API signatures (`onStart(JavalinState)`, `ContextPlugin`, `state.routes.before(...)`)
- [x] `pages/plugins/javalinvue.md` - Already uses `config.registerPlugin(new JavalinVuePlugin())` and `config.routes.get(...)` ✓
- [x] `pages/plugins/rendering.md` - No old route examples present ✓
- [x] `pages/plugins/cors.md` - No old route examples present ✓
- [x] `pages/plugins/devlogging.md` - No old route examples present ✓
- [x] `pages/plugins/graphql.md` - No old route examples present ✓
- [x] `pages/plugins/micrometer.md` - No old route examples present ✓
- [x] `pages/plugins/routeoverview.md` - No old route examples present ✓
- [x] `pages/plugins/ssl-helpers.md` - No old route examples present ✓

### Other Pages
- [x] `pages/index.md` - Community stats updated (2M+ downloads, 8.2k stars, 638 forks, etc. — "As of February 2026")
- [x] `pages/comparison-to-spark.md` - Already uses `config.routes.get(...)` ✓
- [x] `pages/for-educators.md` - Uses `{% include macros/gettingStarted.md %}` which now points to v7 ✓
- [x] `pages/download.md` - Uses `{{site.javalinversion}}` (resolves to 7.0.0) and `mavenDep.md` macro ✓

### Tutorial Updates
- [x] All tutorials in `_posts/tutorials/` locked to `javalinSixVersion` (6.7.0)
- [ ] Consider creating new Javalin 7 tutorials or updating select tutorials

## Configuration Updates

### Version Variables
- [x] `_config.yml` - `javalinversion` updated to `7.0.0`
- [x] `_config.yml` - `javalinSixVersion: 6.7.0` added

### Macros and Includes
- [x] `_includes/macros/gettingStarted.md` - Updated to Javalin 7 syntax
- [x] `_includes/macros/gettingStarted6.md` - Created for v6 archive docs

## Content Review

### Code Examples
- [x] `app.get(`, `app.post(`, `app.before(`, `app.after(`, `app.ws(` — only present in `docs-past-*` archives (intentional) ✓
- [x] `ctx.matchedPath()` — only in archives and migration guide (showing old→new) ✓
- [x] `app.events(` — only in archives and migration guide (showing old→new) ✓
- [x] `app.unsafeConfig().pvt` — only in migration guide (showing old→new) ✓
- [x] `config.vue` — only in archives and migration guides (intentional) ✓

### Breaking Changes Coverage
- [x] Routes configured upfront in `config.routes.*` — docs.md prominently documents this with a callout box ✓
- [x] Lifecycle events in `config.events.*` — docs.md has full `config.events.*` examples ✓
- [x] `ctx.matchedPath()` → `ctx.endpoint().path()` — migration guide + docs.md uses `ctx.endpoint().path()` ✓
- [x] JavalinVue as plugin — docs.md explicitly notes it, `javalinvue.md` uses `config.registerPlugin(...)` ✓
- [x] `app.unsafeConfig().pvt` → `app.unsafe` — migration guide covers with before/after examples ✓
- [x] `config.router.javaLangErrorHandler` — covered under the `app.unsafe` migration section ✓
- [x] Jetty 12 / Jakarta servlet packages — docs.md + migration guide have dedicated sections ✓
- [x] Java 17 requirement — docs.md intro states it ✓
- [x] `createAndStart()` removal — migration guide has a dedicated section ✓
- [x] HandlerType as record — migration guide "Other changes" section ✓
- [x] Template rendering modules — docs.md references `javalin-rendering` artifact ✓

## Testing

### Local Testing
- [ ] Build the Jekyll site locally and verify all pages render correctly
- [ ] Test all internal links work correctly
- [ ] Verify code snippets display properly
- [ ] Check that version variables resolve correctly
- [ ] Test navigation and menu structure

### Cross-browser Testing
- [ ] Test on Chrome/Edge
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile devices

## Release Post

- [x] `_posts/news/pre-8.0/2026-02-22-javalin-7.0.0-released.md` - Written and published
- [x] Release post intro, Hello World + Gradle snippet, REST APIs, Static Files, WebSockets, Config, Plugins sections all updated
- [x] Dark mode fix for date subtitle (`.release-date` CSS class)
- [x] `_posts/blog/2025-12-27-using-augment-for-javalin-7.md` - Augment endorsement toned down

## Notification Banner

- [x] `_includes/notificationBanner.html` - Updated for Javalin 7 (uncommented, new content and link)
- [x] Banner restricted to `/documentation*` and `/tutorials*` pages only
- [x] Background changed to green (`#9fff82`)
- [x] Close button replaced with SVG X icon
- [x] Top-left corner clipped (`clip-path: polygon(...)`)

## Pre-Release Tasks

### Communication Preparation
- [ ] Prepare GitHub release notes with changelog
- [ ] Draft Twitter/X announcement (with key highlights)
- [ ] Draft Reddit post for r/java and r/programming
- [ ] Draft Hacker News submission (title and description)
- [ ] Prepare LinkedIn announcement
- [ ] Draft Discord/Slack community announcements
- [ ] Notify key contributors and maintainers

### Final Checks
- [ ] Review all changes with git diff
- [ ] Spell check all new/updated content
- [ ] Verify all links are working (internal and external)
- [ ] Check for any TODO or FIXME comments
- [ ] Ensure consistent formatting and style

## Release Day

### Website Updates
- [x] Rename `docs-future-7.md` to `docs.md` and move old `docs.md` to `docs-past-6-X.md`
- [x] Update `_config.yml` - `javalinversion: 7.0.0`
- [x] Update `_includes/macros/gettingStarted.md` to use Javalin 7 syntax
- [ ] Commit and push all changes
- [ ] Verify deployment

### Announcements and Promotion
- [ ] **Twitter/X** - Post announcement with key features and link
- [ ] **Reddit** - Post to r/java (focus on technical improvements)
- [ ] **Reddit** - Post to r/programming (broader appeal, highlight major changes)
- [ ] **Reddit** - Post to r/Kotlin if relevant
- [ ] **Hacker News** - Submit link to release announcement or migration guide
- [ ] **LinkedIn** - Share professional announcement
- [ ] **Dev.to** - Cross-post release announcement blog
- [ ] **Medium** - Cross-post release announcement blog (if applicable)
- [ ] **Discord** - Announce in Javalin Discord server
- [ ] **Gitter/Slack** - Announce in relevant Java/Kotlin communities
- [ ] **GitHub Discussions** - Create announcement thread
- [ ] **Javalin mailing list** - Send announcement email (if exists)
- [ ] **Java Weekly/newsletters** - Submit to Java newsletter curators
- [ ] **Kotlin Weekly** - Submit to Kotlin newsletter
- [ ] **Awesome Java** - Update Javalin entry if needed

### Post-Release Monitoring
- [ ] Monitor website for broken links or issues
- [ ] Monitor GitHub issues for bug reports
- [ ] Monitor social media for feedback and questions
- [ ] Respond to Reddit comments and questions
- [ ] Respond to Hacker News comments
- [ ] Respond to Twitter/X mentions and questions
- [ ] Update any missed documentation based on user reports
- [ ] Track adoption and migration issues
- [ ] Collect feedback for future improvements

## Social Media Best Practices

### Twitter/X Tips
- Keep it concise (280 characters)
- Use hashtags: #Javalin #Java #Kotlin #WebFramework
- Include link to release notes or migration guide
- Mention key features (Java 17, Jetty 12, new routing API)
- Tag relevant accounts if appropriate

### Reddit Tips
- **r/java**: Focus on technical improvements, Java 17 requirement, performance
- **r/programming**: Broader appeal, explain what Javalin is, highlight major changes
- Be active in comments, answer questions promptly
- Don't be overly promotional, focus on technical value
- Consider posting migration guide as a separate post if there's interest

### Hacker News Tips
- Title should be factual and interesting (e.g., "Javalin 7.0 – Lightweight Java/Kotlin web framework")
- Link directly to release notes or announcement
- Be prepared to answer technical questions in comments
- Avoid promotional language
- Timing matters: post during US business hours for best visibility

### General Tips
- Stagger announcements (don't post everywhere at once)
- Engage with comments and questions
- Share user success stories and feedback
- Consider creating a demo or video showcasing new features
- Highlight migration path and backward compatibility (or breaking changes)

## Notes

- Tutorials are intentionally locked to Javalin 6 (`javalinSixVersion`) to remain stable
- Historical news posts should NOT be updated (they're historical records)
- Past documentation versions (`docs-past-*.md`) should NOT be updated
- Migration guides should remain as-is once published
- Consider creating a "What's New in Javalin 7" blog post separate from release notes
- Prepare FAQ for common migration questions


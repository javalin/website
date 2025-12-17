# Javalin 7 Release Checklist

## Documentation Updates

### Core Documentation
- [x] `pages/docs/docs-future-7.md` - Updated with all Javalin 7 changes
- [x] `pages/docs/migration-guide-6-7.md` - Migration guide created
- [x] `_includes/macros/gettingStarted7.md` - Created Javalin 7 getting started macro
- [x] `_config.yml` - Added `javalinSixVersion: 6.7.0` config variable
- [ ] Rename `pages/docs/docs-future-7.md` to `pages/docs/docs.md` (and move current docs.md to docs-past-6-X.md)
- [ ] Update `pages/docs/migration-guide-6-7.md` link references (currently points to `/migration-guide-javalin-6-to-7`)

### Plugin Documentation
- [ ] `pages/plugins/how-to.md` - Update route examples from `app.*` to `config.routes.*`
- [ ] `pages/plugins/javalinvue.md` - Update to show JavalinVue as a plugin, update route examples
- [ ] `pages/plugins/rendering.md` - Update route examples if present
- [ ] `pages/plugins/cors.md` - Update route examples if present
- [ ] `pages/plugins/devlogging.md` - Update route examples if present
- [ ] `pages/plugins/graphql.md` - Update route examples if present
- [ ] `pages/plugins/micrometer.md` - Update route examples if present
- [ ] `pages/plugins/routeoverview.md` - Update route examples if present
- [ ] `pages/plugins/ssl-helpers.md` - Update route examples if present

### Other Pages
- [ ] `pages/for-educators.md` - Update getting started example
- [ ] `pages/comparison-to-spark.md` - Update route examples if present
- [ ] `pages/index.md` - Update homepage examples if present
- [ ] `pages/download.md` - Verify version references

### Tutorial Updates
- [x] All tutorials in `_posts/tutorials/` locked to `javalinSixVersion` (6.7.0)
- [ ] Consider creating new Javalin 7 tutorials or updating select tutorials

## Configuration Updates

### Version Variables
- [x] `_config.yml` - `javalinSixVersion: 6.7.0` added
- [ ] `_config.yml` - Update `javalinversion` to `7.0.0` (or appropriate version) when ready to release
- [ ] Verify all version references throughout the site

### Macros and Includes
- [x] `_includes/macros/gettingStarted7.md` - Created
- [ ] `_includes/macros/gettingStarted.md` - Update to Javalin 7 syntax when ready
- [ ] `_includes/macros/mavenDep.md` - Verify it works with version override
- [ ] Review other macros in `_includes/macros/` for needed updates

## Content Review

### Code Examples
- [ ] Search for all `app.get(` references and verify they're either updated or intentionally left for old versions
- [ ] Search for all `app.post(` references
- [ ] Search for all `app.before(` references
- [ ] Search for all `app.after(` references
- [ ] Search for all `app.ws(` references
- [ ] Search for all `ctx.matchedPath()` references - should be `ctx.endpoint().path()`
- [ ] Search for all `app.events(` references - should be `config.events.*`
- [ ] Search for all `app.unsafeConfig().pvt` references - should be `app.unsafe`
- [ ] Search for all `config.vue` references - should be JavalinVue plugin

### Breaking Changes Coverage
- [ ] Routes configured upfront in `config.routes.*` - documented
- [ ] Lifecycle events in `config.events.*` - documented
- [ ] `ctx.matchedPath()` → `ctx.endpoint().path()` - documented
- [ ] JavalinVue as plugin - documented
- [ ] `app.unsafeConfig().pvt` → `app.unsafe` - documented
- [ ] `config.router.javaLangErrorHandler` - documented
- [ ] Jetty 12 / Jakarta servlet packages - documented
- [ ] Java 17 requirement - documented
- [ ] `createAndStart()` removal - documented
- [ ] HandlerType as record - documented
- [ ] Template rendering modules - documented

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

## Pre-Release Tasks

### Communication Preparation
- [ ] Draft release announcement blog post for website
- [ ] Prepare GitHub release notes with changelog
- [ ] Draft Twitter/X announcement (with key highlights)
- [ ] Draft Reddit post for r/java and r/programming
- [ ] Draft Hacker News submission (title and description)
- [ ] Prepare LinkedIn announcement
- [ ] Draft Discord/Slack community announcements
- [ ] Update README if needed
- [ ] Notify key contributors and maintainers

### Final Checks
- [ ] Review all changes with git diff
- [ ] Spell check all new/updated content
- [ ] Verify all links are working (internal and external)
- [ ] Check for any TODO or FIXME comments
- [ ] Ensure consistent formatting and style

## Release Day

### Website Updates
- [ ] Rename `docs-future-7.md` to `docs.md`
- [ ] Move old `docs.md` to `docs-past-6-X.md`
- [ ] Update `_config.yml` - set `javalinversion: 7.0.0`
- [ ] Update `_includes/macros/gettingStarted.md` to use Javalin 7 syntax
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


# GitHub Copilot Instructions for Javalin Website

## Project Overview

This repository contains the source code for [javalin.io](https://javalin.io), the official website for the Javalin web framework. Javalin is a lightweight web framework for Java and Kotlin.

## Tech Stack

- **Static Site Generator**: Jekyll (Ruby-based)
- **Templating**: Liquid templates
- **Styling**: Sass/SCSS
- **Markdown**: Kramdown
- **Node.js**: Used for contributor list generation
- **Docker**: Alternative development environment

## Project Structure

```
/
├── .github/              # GitHub workflows and configuration
│   ├── workflows/        # CI/CD workflows (deploy, PR previews)
│   ├── ISSUE_TEMPLATE/   # Issue templates
│   ├── CONTRIBUTING.md   # Contribution guidelines
│   └── README.md         # Repository README
├── _config.yml           # Jekyll configuration
├── _data/                # Data files (YAML, JSON)
├── _includes/            # Reusable HTML components
│   ├── landing/          # Landing page sections
│   ├── macros/           # Reusable macros
│   └── plugins/          # Plugin-related includes
├── _layouts/             # Page layout templates
├── _posts/               # Blog posts (news, tutorials)
├── _sass/                # Sass stylesheets
├── css/                  # Compiled CSS
├── img/                  # Images and graphics
├── js/                   # JavaScript files
├── pages/                # Main content pages
│   ├── docs/             # Documentation pages
│   └── plugins/          # Plugin pages
├── Dockerfile            # Docker configuration
├── Gemfile               # Ruby dependencies
└── 404.md                # Custom 404 page
```

## Development Setup

### Local Development (Ruby)

```bash
# Install dependencies
bundle install

# Run the development server
bundle exec jekyll serve --port 4000 --future --incremental

# Site will be available at http://localhost:4000
```

### Docker Alternative

```bash
# Build the Docker image
docker build -t javalin-web .

# Run the container
docker run -p 4000:4000 -v ${PWD}:/app javalin-web

# On Windows Command Prompt (CMD), replace ${PWD} with %cd%
# PowerShell supports ${PWD}
```

## Build and Deployment

- **Production build**: `bundle exec jekyll build` (outputs to `_site/`)
- **Deployment**: Automatic deployment to GitHub Pages on push to `master` branch
- **PR Previews**: Automatic preview deployments to Surge for pull requests

## Code Style and Conventions

### Markdown Files

- Use front matter with YAML for page configuration
- Follow existing file naming conventions: lowercase with hyphens
- Keep markdown clean and readable
- Use Jekyll/Liquid syntax for includes and variables

Example front matter:
```yaml
---
layout: default
title: Page Title
permalink: /page-url
---
```

### HTML/Liquid Templates

- Use consistent indentation (2 spaces)
- Keep templates modular using `_includes/`
- Use descriptive names for includes and macros
- Follow existing naming patterns in `_includes/macros/`

### Sass/SCSS

- Place styles in `_sass/` directory
- Use variables for colors and common values
- Follow existing naming conventions
- Compile automatically via Jekyll

### JavaScript

- Keep JavaScript files in `js/` directory
- Use vanilla JavaScript or existing libraries
- Maintain compatibility with the Jekyll build process

## Common Tasks

### Adding a New Page

1. Create a markdown file in `pages/` or appropriate subdirectory
2. Add front matter with layout, title, and permalink
3. Write content using markdown
4. Reference in navigation if needed

### Adding Documentation

1. Edit `pages/docs/docs.md` for current documentation
2. For version-specific docs, create new file: `docs-past-X-Y-x.md`
3. Update navigation menu in the docs file
4. Use existing macros for code snippets:
   - `{% include macros/docsSnippet.html %}`
   - `{% include macros/docsSnippetKotlinFirst.html %}`

### Adding a Blog Post

1. Create a file in `_posts/` with format: `YYYY-MM-DD-title.md`
2. Add front matter with layout, title, date, etc.
3. Write content using markdown
4. Post will automatically appear in news/blog sections

### Adding Images

1. Place images in `img/` directory with appropriate subdirectory
2. Reference using relative paths: `/img/path/to/image.png`
3. Optimize images before committing

### Updating Configuration

- **Version numbers**: Edit `_config.yml` (javalinversion, etc.)
- **Site metadata**: Edit `_config.yml`
- **Navigation**: Edit layout files in `_layouts/`

## Important Files

- **_config.yml**: Main Jekyll configuration, version numbers
- **pages/docs/docs.md**: Main documentation page
- **pages/index.md**: Landing page
- **.github/workflows/deploy.yml**: Production deployment workflow
- **.github/workflows/pr-previews.yml**: PR preview workflow

## Testing Changes

### Before Submitting PR

1. Run the site locally: `bundle exec jekyll serve`
2. Test all modified pages in a browser
3. Check that links work correctly
4. Verify responsive design on mobile
5. Check for console errors in browser
6. For larger changes, use Docker to test in clean environment

### PR Preview

- PRs automatically get preview deployments to Surge
- Preview URL will be commented on the PR
- Use preview to share changes with reviewers

## Version Updates

When updating Javalin version numbers:

1. Update version in `_config.yml`:
   - `javalinversion` (latest version)
   - `javalinFiveVersion`, `javalinFourVersion`, etc. (for older versions)
2. Update documentation if API changes
3. Add migration guide if breaking changes

## Contribution Guidelines

- Read `.github/CONTRIBUTING.md` before contributing
- Create issues for larger changes before implementing
- Keep PRs focused and minimal
- Test changes locally before submitting
- Follow existing code style and conventions
- Update documentation if changing functionality

## Useful Jekyll/Liquid Syntax

- Include a file: `{% include filename.html %}`
- Use a variable: `{{ site.javalinversion }}`
- Conditional: `{% if condition %}...{% endif %}`
- Loop: `{% for item in collection %}...{% endfor %}`
- Code blocks: Use triple backticks with language identifier

## Resources

- **Jekyll Documentation**: https://jekyllrb.com/docs/
- **Liquid Templating**: https://shopify.github.io/liquid/
- **Kramdown Syntax**: https://kramdown.gettalong.org/syntax.html
- **Javalin Discord**: https://discord.gg/sgak4e5NKv

## Notes for AI Assistants

- This is a Jekyll static site, not a Java/Kotlin application
- Focus on content, markdown, and templates rather than backend code
- Preserve existing design patterns and file organization
- Use existing includes and macros when possible
- Test locally before suggesting changes
- Be mindful of SEO and accessibility
- Maintain consistency with existing documentation style

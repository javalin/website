---
layout: blogpost
category: blog
date: 2025-12-17
author: <a href="https://www.linkedin.com/in/davidaase" target="_blank">David Åse</a>
title: Using AI agents to help prepare Javalin 7
summary: How agentic pair programming transformed my workflow as a solo maintainer, and why I recommend Augment
permalink: /blog/releasing-javalin-7
---

<div class="notification" markdown="1">
**Disclosure**: As the maintainer of a major open-source project on GitHub, I receive free GitHub Copilot credits. I'm also currently in talks with Augment about receiving free credits for the project. The experiences shared in this post are based on my actual usage of these tools, but I believe it's still important to disclose this information.
</div>

## Introduction

Javalin is a passion project which I maintain in my free time. I have a full-time job as an engineering manager, and this year my wife and I bought a house that needs renovation. Like most open-source maintainers, I often have to balance what I *want* to do for the project against what I actually have *time* to do.

This fall, I started trying out various agentic pair programming tools to see if they could help me get more done, and the results have been very positive. Major refactorings that would have been too daunting to attempt are now feasible. Nice-to-have improvements actually get done instead of sitting on the backlog forever.

I've tested three tools extensively for Javalin 7: GitHub Copilot, Google Antigravity, and Augment. After months of real-world use on complex refactoring work, *my clear recommendation is Augment*. It's more expensive than the alternatives, but for the kind of work I do (complex refactoring and architectural changes) it consistently delivers better results. This post shares some examples and advice for anyone considering using AI agents for their own projects.

## How I work with AI agents

I don't write much code with my hands anymore. I pair program with an agent while discussing the problem I'm trying to solve. I don't let the agents run away and write a thousand lines though. I'm heavily involved in every line written, I'm just not the one typing.

My typical workflow is to focus on small tasks like "let's extract this into a separate function", "let's add tests for this feature", or "let's pull this out into a separate maven module". The agent writes the code in small chunks which I review immediately, then iterate on if needed.

I've basically stopped Googling, reading documentation, and visiting Stack Overflow. Instead, I just ask the agent to "show me the documentation for XYZ", or "explain how XYZ works in Jetty 12", and then verify the answer by asking the agent to write a test for the behavior that I want.

### The two-agent technique

For larger tasks, I usually spawn two agents: one to write code, and one to discuss the code with me as if I wrote it myself. I've found that agents are overly positive about their own code. When reviewing code it wrote, an agent will rationalize decisions. When reviewing code it thinks *you* wrote, it's more likely to be critical. After finishing a task with an agent, I usually ask the second agent to "thoroughly review this code as a senior JVM engineer".

## Why Augment specifically

### The MCP integration advantage

When writing Javalin 7, I needed to split `JavalinConfig` into `JavalinConfig` and `JavalinState`. This required a lot of field moves and class renames. I initially tried this with GitHub Copilot and Google Antigravity. Both got stuck doing string replacements across files, burning through credits while producing broken code.

With MCP integration, Augment used IntelliJ's rename refactoring. Instead of trying to pattern-match and replace text in 47 files, it used IntelliJ's semantic understanding to update 127 references across the codebase. Instead of running Maven repeatedly to find compilation errors, it used IntelliJ's real-time problem analysis, which is far more advanced than parsing Maven output.

### Code quality and context understanding

In my experience, hallucinations are rare with Augment. The code quality is genuinely good. It understands context deeply enough to make architectural decisions that respect the existing codebase structure and project philosophy.

### Automatic project conventions

Augment adapts to project conventions automatically. Nearly all Javalin tests are full integration tests using a custom test util for starting/stopping Javalin. I never told Augment this, but when it creates new tests, it always follows this pattern. It picks up the codebase conventions by reading the existing code.

## Real examples from Javalin 7

### Writing the migration guide

For Javalin 7, I needed a migration guide. I pointed Augment at the [GitHub versions comparison](https://github.com/javalin/javalin/compare/javalin-parent-6.7.0...javalin-parent-7.0.0-alpha.4) and asked it to write the guide. About 80% of the work was done after handing it that URL. It analyzed the commits, identified breaking changes, and structured the guide with before/after examples. Then it also used the migration guide it had just written to draft new documentation pages.

Total time: maybe 2 hours including review and iteration. Doing this manually would have taken a full day.

### Upgrading from Jetty 11 to Jetty 12

One of the major changes in Javalin 7 was upgrading from Jetty 11 to Jetty 12. This involved a lot of package and artifact changes. It's not hard work, but it's tedious. Tons of import statements to update, artifact names to change, package relocations to track down.

The agent handled this in minutes rather than hours. Even better, when I ran into bugs in Jetty during the upgrade, the agent analyzed the git history of the Jetty repository and found the offending commit. That kind of detective work would have taken me hours.

### Migrating to the new Maven Central

When publishing the first Javalin 7 alpha, I discovered that Maven Central had migrated from legacy Sonatype to the new Maven Central Portal. The release process needed some updates in the form of POM configuration and authentication tokens. Augment talked me through the whole thing, and did a dry-run release.

This is the kind of work that steals time from actual development. It's not difficult, but it requires research into systems I don't use daily. I'd have to read migration guides, maybe a blog post, understand the new authentication flow, test the changes... and then immediately forget everything because I won't need to touch it again.

This highlights a key benefit that's easy to overlook: AI agents are particularly valuable for *peripheral complexity*. Not just refactoring your own code, but handling the ecosystem of tooling, dependencies, and infrastructure that surrounds every mature project. All the necessary but not core work that accumulates over time.

### Experimental refactoring

Another big benefit is being able to experiment with different architectural patterns. Before, I'd think "this could be better structured, but it would take hours to refactor and I might not like the result." The cost of experimentation was too high.

Now I can say "let's try restructuring this" and see what it looks like in 15 minutes. If I don't like it, I haven't lost much. If I do like it, I've made progress I wouldn't have made otherwise.

This fundamentally changes how you think about code quality. Technical debt becomes less scary. You're more willing to improve things because the cost is lower. Large refactoring shifts from spending the weekend in my home office to casual conversation with the agent after work.

## Comparison with alternatives

### GitHub Copilot

I tried GitHub Copilot extensively on Javalin before settling on Augment. The difference in capability for complex refactoring was significant.

In one case ([PR #2467](https://github.com/javalin/javalin/pull/2467)), I asked Copilot to remove a dependency on an HTTP client. After 10 prompts back and forth, it **proudly** produced a PR with zero actual changes. It understood what I wanted but couldn't figure out how to actually do it, and the more I pressed it, the worse it got.

In another case, I asked it to fix webjars handling in the static files feature. Instead of fixing the actual webjars handling code, it rewrote the static files tests to assert that webjars paths should return 404. It was changing the tests to match the broken behavior instead of fixing the underlying code.

### Google Antigravity

I tested both Google Antigravity and Copilot for the JavalinConfig split mentioned earlier. Both struggled with the same issue: they were doing string replacements rather than semantic refactoring. Both burned through significant credits trying to fix compilation errors that resulted from incomplete updates.

Neither had the equivalent of Augment's MCP integration, which meant they were fundamentally limited to text-based operations. For simple changes this works fine. For complex refactoring across dozens of files, it's inadequate.

## When Augment isn't worth it

To be clear, Augment isn't always the right choice. If you're doing autocomplete-style coding (writing new features from scratch, implementing well-defined algorithms, or making small isolated changes), Copilot works well and costs much less.

For me, Augment's value is strongest for:
- Complex refactoring across many files
- Architectural changes that require understanding system structure
- Maintaining large codebases where context matters
- Solo maintainers who need a "second pair of eyes"

If you're not doing this kind of work regularly, the cost difference might not be justified.

## Conclusion

Agentic pair programming has changed how I maintain Javalin. Without it, the project would make slower progress. Major refactorings would be too daunting. Nice to have improvements would stay on the backlog forever.

After extensive testing of multiple AI coding assistants, I recommend Augment for serious development work. It costs more than alternatives, but for complex refactoring, architectural changes, and maintaining large codebases, it consistently delivers better results. The MCP integration with JetBrains IDEs is particularly powerful.

If you're doing autocomplete-style coding, stick with Copilot. If you're doing complex refactoring or maintaining a large codebase solo, Augment is worth it.

Your mileage may vary, but this is what worked for me.
# Contributing

This document describes how to contribute to the Javalin website, if you want to contribute to the core Javalin project you should go to [https://github.com/javalin/javalin](https://github.com/javalin/javalin).

## Creating an issue

Remember to include enough information if you're reporting a bug.  
Creating an issue to ask a question is fine.

## Creating a PR

Every PR will be considered.

Steps:

1. Create a GitHub fork of this repository (click on the Fork button in GitHub). This will create a forked copy of the repo in your personal account. You will use this fork to make contributions to the parent repository via pull requests (PRs).

2. Create a git clone on your local machine from your GitHub fork.

3. Make your changes locally.

4. Test your changes by running the javalin.io site locally on your machine (see below).

5. Commit your changes and push them to your GitHib repository (your fork).

6. Go to your GitHub repository. Create a GitHub pull request: click on Contribute > Open pull request.

### How to increase the chance of having your PR merged

* Ask about the feature beforehand (or pick one of the open issues)
* If no issue exists, create an issue for the PR
* Format your code so it looks somewhat like the rest of the source

## Building project locally

This website is built with Jekyll. To run it locally, you need to have Ruby and Bundler installed.

```bash
# Install dependencies
bundle install
# Run the server
bundle exec jekyll serve --port 4000 --future --incremental
```

If you have problems configuring a working Jekyll/Bundler environment, you may prefer to use a Docker container to run and test the javalin.io web site. The following notes assume a Windows host - but they should be adaptable to other operating systems, also.

a) Make sure Docker Desktop is running.

b) At the Windows command prompt, change to the base directory where your local clone was created:

```sh
cd C:\path\to\your\javalin.github.io
```

c) Create the Docker image (note the trailing period):

```sh
docker build --tag javalin-jekyll .
```

This uses the `Dockerfile` provided in the repository. This builds a Docker container using:

 - Ruby v2.7.7
 - Bundler v2.4.3
 - GitHub Pages v227

(Jekyll is included as a dependency of the GitHub Pages gem.)

d) Start a new Docker container:

For Windows:

```sh
docker run ^
  --rm ^
  --interactive --tty ^
  --publish 4000:4000 ^
  --volume "%CD%":/app ^
  --workdir /app ^
  --name javalin-jekyll ^
  javalin-jekyll
```

Note the use of `%CD%` to mount the repository contents into the container.

For Linux:

```sh
docker run \
  --rm \
  --interactive --tty \
  --publish 4000:4000 \
  --volume $(pwd):/app \
  --workdir /app \
  --name javalin-jekyll \
  javalin-jekyll
```

e) Browse the web site at `localhost:4000`.

There are some limitations to the Docker approach:

 - The `--livereload` flag is not used because it does not appear to have any effect. Stop and restart the Docker container to pick up new changes.
 - If you see some incorrectly rendered content, you can make an arbitrary edit to the affected content, then re-launch the container. (Then reverse your edit, afterwards).

## Questions

There's usually someone on [discord](https://discord.gg/sgak4e5NKv) who can help you if you have any questions.

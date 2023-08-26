# Contributing

This document describes how to contribute to the Javalin website, if you want to contribute to the core Javalin project you should go to [https://github.com/javalin/javalin](https://github.com/javalin/javalin).

## Creating an issue

Remember to include enough information if you're reporting a bug.  
Creating an issue to ask a question is fine.

## Creating a PR

Every PR will be considered.

_Steps (for larger changes):_

1. Create a GitHub fork of this repository (click on the Fork button in GitHub). This will create a forked copy of the repo in your personal account. You will use this fork to make contributions to the parent repository via pull requests (PRs).

2. Create a git clone on your local machine from your GitHub fork.

3. Make your changes locally.

4. Test your changes by running the javalin.io site locally on your machine (see below).

5. Commit your changes and push them to your GitHib repository (your fork).

6. Go to your GitHub repository. Create a GitHub pull request: click on Contribute > Open pull request.

_Steps (for smaller changes):_

You may not need to run the site locally to test smaller changes. You can preview your changes when you create a pull request:

<img src="/img/pages/pull_req_site_preview.png" alt="Site preview via PR">

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

### Docker Alternative

If you have problems configuring a working Jekyll/Bundler environment, you may prefer to use a Docker container to run and test the javalin.io web site.

1. With Docker running, open a terminal and navigate to the root of the cloned repository.

2. Create the Docker image (note the trailing period):

    ```sh
    docker build -t javalin-web .
    ```

    >This uses the `Dockerfile` provided in the repository, containing everything needed to build and run the web site. This step only needs to be done once.

3. Start a new Docker container:
  
    ```sh
    docker run -p 4000:4000 -v ${PWD}:/app javalin-web
    ```

    > If you are using Windows, make sure you are using Powershell. In case you are using CMD, you will need to replace `${PWD}` with `%cd%`.

4. Browse the web site at `localhost:4000`.

The auto-reload feature only works on some operating systems. If that is the case for you, re-launch the container after making changes.

## Questions

There's usually someone on [discord](https://discord.gg/sgak4e5NKv) who can help you if you have any questions.

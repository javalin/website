# javalin.io [![Chat at https://discord.gg/sgak4e5NKv](https://img.shields.io/badge/chat-on%20Discord-%234cb697)](https://discord.gg/sgak4e5NKv) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Prueba con estudiantes

This repo contains the source code for [javalin.io](https://javalin.io).

Pull requests for adding tutorials and fixing errors in docs are very welcome.

## Quickstart

This website is built with Jekyll. To run it locally, you need to have Ruby and Bundler installed.

```bash
# Install dependencies
bundle install
# Run the server
bundle exec jekyll serve --port 4000 --future --incremental
```

Alternatively, you can use Docker to run the site without installing Ruby and Bundler.

```bash
# Build the Docker image
docker build -t javalin-web .
# Run the Docker container
docker run -p 4000:4000 -v ${PWD}:/app javalin-web
```

The site will be available at `http://localhost:4000`


The [contributing guidelines](CONTRIBUTING.md) have additional set-up information.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

FROM ruby:2.7.4-alpine

WORKDIR /app

COPY Gemfile ./

RUN apk add ruby-dev build-base && bundle install

ENTRYPOINT ["bundle", "exec"]

CMD ["jekyll", "serve", "--host=0.0.0.0", "--future", "--incremental"]
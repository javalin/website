#
# An updated version of https://github.com/peteretelej/jekyll-container
#
FROM ruby:2.7.7-bullseye

RUN apt-get update && \
  gem install bundler -v 2.4.3 && \
  mkdir -p /etc/jekyll && \
  printf 'source "https://rubygems.org"\ngem "github-pages", "227"' > /etc/jekyll/Gemfile && \
  bundle install --gemfile /etc/jekyll/Gemfile && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV BUNDLE_GEMFILE /etc/jekyll/Gemfile

EXPOSE 4000

ENTRYPOINT ["bundle", "exec"]

CMD ["jekyll", "serve", "--host=0.0.0.0", "--future", "--incremental"]

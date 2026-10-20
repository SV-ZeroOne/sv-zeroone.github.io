# frozen_string_literal: true

source 'https://rubygems.org'

gem 'jekyll', '~> 4.4'
gem 'rss', '~> 0.3' # used by _plugins/security_feeds.rb

group :jekyll_plugins do
  gem 'jekyll-seo-tag', '~> 2.9'
  gem 'jekyll-titles-from-headings', '~> 0.5'
  gem 'jekyll-feed', '~> 0.18'
  gem 'jekyll-sitemap', '~> 1.4'
  gem 'jemoji', '~> 0.13'
end

group :test do
  gem 'html-proofer', '~> 5.2'
end

# Windows: timezone data and file watching for `jekyll serve`
platforms :windows, :jruby do
  gem 'tzinfo', '>= 1', '< 3'
  gem 'tzinfo-data'
end
gem 'wdm', '~> 0.2.0', install_if: Gem.win_platform?

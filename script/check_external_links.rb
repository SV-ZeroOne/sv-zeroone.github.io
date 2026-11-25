# frozen_string_literal: true

# Checks external links in the built site (_site/). Run after `jekyll build`:
#   bundle exec ruby script/check_external_links.rb
# Only definite 4xx responses fail; 403/429/999 are ignored because many
# sites return them to bots. Homepage feed links change daily, so skip them.

require 'html-proofer'

proofer = HTMLProofer.check_directory(
  './_site',
  checks: %w[Links Images],
  enforce_https: false,
  only_4xx: true,
  ignore_status_codes: [403, 429, 999],
  ignore_urls: [%r{exploit-db\.com/exploits/}, %r{nvd\.nist\.gov/vuln/detail/}, %r{/pagefind/}],
  hydra: { max_concurrency: 4 },
  typhoeus: { followlocation: true, connecttimeout: 10, timeout: 30,
              headers: { 'User-Agent' => 'Mozilla/5.0 (link checker for sv-zeroone.github.io)' } }
)

# typhoeus 1.7+ labels a response body with the charset its Content-Type
# declares. html-proofer then raises "invalid byte sequence" on a body that is
# not valid in that charset, and the whole run dies. Drop the invalid bytes
# before html-proofer handles the response.
proofer.before_request do |request|
  request.on_complete do |response|
    body = response.body
    body.scrub!('') if body.is_a?(String) && !body.frozen? && !body.valid_encoding?
  end
end

proofer.run

# frozen_string_literal: true

# Fetches the latest Exploit-DB entries and CISA KEV additions at build time
# and exposes them as site.data.security_feeds for _includes/security-feeds.html.
# A feed that can't be fetched becomes an empty list so the build never fails;
# set SECURITY_FEEDS=off to skip fetching (e.g. offline local previews).

require 'json'
require 'net/http'
require 'rss'
require 'time'

module SecurityFeeds
  EXPLOITDB_URL = 'https://www.exploit-db.com/rss.xml'
  KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
  LIMIT = 5

  class Generator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      @cache ||= {
        'exploitdb' => fetch('Exploit-DB') { exploitdb },
        'kev' => fetch('CISA KEV') { kev },
        'fetched_at' => Time.now.utc
      }
      site.data['security_feeds'] = @cache
    end

    private

    def fetch(name)
      return [] if ENV['SECURITY_FEEDS'] == 'off'

      yield
    rescue StandardError => e
      Jekyll.logger.warn 'SecurityFeeds:', "#{name} unavailable (#{e.class}: #{e.message})"
      []
    end

    def get(url)
      uri = URI(url)
      Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 10, read_timeout: 20) do |http|
        res = http.get(uri.request_uri, 'User-Agent' => 'sv-zeroone.github.io site build')
        raise "HTTP #{res.code}" unless res.is_a?(Net::HTTPSuccess)

        res.body
      end
    end

    def exploitdb
      RSS::Parser.parse(get(EXPLOITDB_URL), false).items.first(LIMIT).map do |item|
        { 'title' => item.title.strip, 'url' => item.link, 'date' => item.pubDate&.strftime('%Y-%m-%d') }
      end
    end

    def kev
      vulns = JSON.parse(get(KEV_URL)).fetch('vulnerabilities')
      vulns.max_by(LIMIT) { |v| [v['dateAdded'], v['cveID']] }.map do |v|
        {
          'title' => "#{v['cveID']}: #{v['vulnerabilityName']}",
          'url' => "https://nvd.nist.gov/vuln/detail/#{v['cveID']}",
          'date' => v['dateAdded']
        }
      end
    end
  end
end

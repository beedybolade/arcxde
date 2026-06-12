import crypto from 'node:crypto';
import { RssConnector } from './connector.js';
import { DEFAULT_GOOGLE_NEWS_QUERY, googleNewsFeedUrl, resolveRssFeedUrl } from './config.js';
import type { ConnectorItem } from '@/connectors/base/types.js';

// 🎨 ANSI Color Escape Constants
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32mA';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';
const BLUE = '\x1b[34m';
const GRAY = '\x1b[90m';

function resolveFeedUrl(): { label: string; url: string } {
  const mode = process.argv[2];

  if (mode === 'google-news') {
    const query = process.argv[3] ?? process.env.RSS_GOOGLE_NEWS_QUERY ?? DEFAULT_GOOGLE_NEWS_QUERY;
    return {
      label: `google news search query: "${query}"`,
      url: googleNewsFeedUrl(query),
    };
  }

  if (mode === 'feed' || mode === undefined) {
    return {
      label: 'standard static rss timeline feed',
      url: resolveRssFeedUrl('google-news'), //sets feed source to google news or default feed
    };
  }

  console.error(`unknown run mode profile selection: ${mode}`);
  console.error(
    'usage configuration layout parameters: bun run src/connectors/implementations/rss-feed/run.ts [feed|google-news] [query]',
  );
  process.exit(1);
}

const { label, url: feedUrl } = resolveFeedUrl();
const connector = new RssConnector();
const capturedItems: ConnectorItem[] = [];

console.log(`rss test script: targeting ${label}`);
console.log(`rss test script: source endpoint URL resolved to -> ${feedUrl}\n`);

async function main() {
  const result = await connector.run({
    sourceId: feedUrl,
    runId: crypto.randomUUID(),
    logger: (msg) => console.log(`${GRAY}[LOG]${RESET} ${msg}`),
    signal: AbortSignal.timeout(60_000), // 1-minute timeout gateway
    insertItem: async (item) => {
      capturedItems.push(item);
      return 'inserted';
    },
  });

  console.log(`\n${BOLD}${MAGENTA}=====================================================${RESET}`);
  console.log(`${BOLD}${MAGENTA}             INGESTION METRICS SUMMARY               ${RESET}`);
  console.log(`${BOLD}${MAGENTA}=====================================================${RESET}`);
  console.log(JSON.stringify(result, null, 2));

  if (capturedItems.length === 0) {
    console.log(`\n${BOLD}${YELLOW}⚠ Result matrix alert: No data records captured.${RESET}`);
  } else {
    // Sort captured elements in descending chronological order (Most Recent First)
    const sortedItems = [...capturedItems].sort((a, b) => {
      return Date.parse(b.published_at) - Date.parse(a.published_at);
    });

    // Slice out the top 10 items
    const topRecords = sortedItems.slice(0, 10);

    console.log(
      `\n${BOLD}${GREEN}✔ Successfully structured ${capturedItems.length} records!${RESET}`,
    );
    console.log(`\n${BOLD}${CYAN}Displaying Top ${topRecords.length} Most Recent Records:${RESET}`);
    console.log(
      `${GRAY}-------------------------------------------------------------------${RESET}`,
    );

    topRecords.forEach((item, index) => {
      // Defensive compiler checks to guard against potential empty references
      if (!item) return;

      const title = (item.raw_payload as any)?.title || 'Untitled Article';

      console.log(`${BOLD}${GREEN}[${index + 1}] Title:${RESET}        ${BOLD}${title}${RESET}`);
      console.log(`${GRAY}    Hash Key:    ${RESET}${YELLOW}${item.immutable_hash}${RESET}`);
      console.log(`${GRAY}    Published At: ${RESET}${CYAN}${item.published_at}${RESET}`);
      console.log(`${GRAY}    Source Link: ${RESET}${BLUE}${item.source_url ?? 'N/A'}${RESET}`);
      console.log(`${GRAY}    Text Length: ${RESET}${item.content_text?.length ?? 0} characters`);
      console.log(
        `${GRAY}    Text Run:    ${RESET}${item.content_text?.substring(0, 120).replace(/\s+/g, ' ') ?? ''}${GRAY}...${RESET}`,
      );
      console.log(
        `${GRAY}-------------------------------------------------------------------${RESET}`,
      );
    });
  }
}

// Execute wrapper with structural validation catching block bound to root process
main().catch((err) => {
  console.error('\n Fatal processing engine runtime exception:', err);
  process.exit(1);
});

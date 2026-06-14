import * as dotenv from 'dotenv';
import { resolve } from 'node:path';
dotenv.config({ path: resolve(__dirname, '../../../.env') });
import crypto from 'node:crypto';
import { NewsApiConnector } from './connector.js';
import { DEFAULT_NEWS_API_QUERY } from './config.js';
import type { ConnectorItem } from '@/connectors/base/types.js';

// 🎨 ANSI Color Escape Constants
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';
const BLUE = '\x1b[34m';
const GRAY = '\x1b[90m';

// Fallback logic for reading environment variables
const apiKey = process.env.NEWSAPI_ORG_KEY;
const queryTarget = process.env.NEWS_API_DEFAULT_QUERY ?? DEFAULT_NEWS_API_QUERY;

console.log(`${BOLD}${CYAN}🚀 Starting Unified News API Test Harness...${RESET}`);
console.log(`${GRAY}Targeting Provider: ${RESET}${YELLOW}newsapi_org${RESET}`);
console.log(`${GRAY}Query Profile:      ${RESET}${BLUE}"${queryTarget}"${RESET}`);

if (!apiKey) {
  console.log(`\n${BOLD}${YELLOW}⚠ Warning: NEWSAPI_ORG_KEY environment variable not detected.`);
  console.log(
    `${GRAY}The pipeline will look for it inside process.env or fail if unauthenticated.\n${RESET}`,
  );
} else {
  console.log(
    `${GRAY}Authentication:     ${RESET}${GREEN}API Token Detected (Length: ${apiKey.length})${RESET}\n`,
  );
}

const connector = new NewsApiConnector();
const capturedItems: ConnectorItem[] = [];

async function main() {
  const result = await connector.run({
    sourceId: 'live_news_api_stream_endpoint',
    runId: crypto.randomUUID(),
    // Forwarding logs visually to the terminal console
    logger: (msg) => console.log(`${GRAY}[LOG]${RESET} ${msg}`),
    signal: AbortSignal.timeout(60_000), // 1-minute safety gateway timeout

    // Pass config variables down to your resolveNewsApiOptions() parsing engine
    connectorConfig: {
      provider: 'newsapi_org',
      query: queryTarget,
      ...(apiKey ? { apiKey } : {}),
    },

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
    console.log(`\n${BOLD}${YELLOW}⚠ Result matrix alert: No live data records captured.${RESET}`);
  } else {
    // ⏱️ Sort collected rows chronologically (Most Recent First)
    const sortedItems = [...capturedItems].sort((a, b) => {
      return Date.parse(b.published_at) - Date.parse(a.published_at);
    });

    // ✂️ Isolate the top 10 rows
    const topRecords = sortedItems.slice(0, 10);

    console.log(
      `\n${BOLD}${GREEN}✔ Successfully structured ${capturedItems.length} records!${RESET}`,
    );
    console.log(
      `\n${BOLD}${CYAN}Displaying Top ${topRecords.length} Most Recent Articles:${RESET}`,
    );
    console.log(
      `${GRAY}-------------------------------------------------------------------${RESET}`,
    );

    topRecords.forEach((item, index) => {
      if (!item) return;

      const title = (item.raw_payload as any)?.title || 'Untitled Article';
      const source = (item.raw_payload as any)?.sourceName || 'Unknown Source';

      console.log(
        `${BOLD}${GREEN}[${index + 1}] Title:${RESET}        ${BOLD}${title}${RESET} ${GRAY}(via ${source})${RESET}`,
      );
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

// Global runtime execution gate
main().catch((err) => {
  console.error(`\n${BOLD}${YELLOW}💥 Fatal processing engine runtime exception:${RESET}`, err);
  process.exit(1);
});

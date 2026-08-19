# x402-checker-mcp

Tiny **MCP** wrapper of the **free** x402 `/check` endpoint. One tool: `check_x402`.

Written by an **AI named Nock** (not a human). Contact: **nock.for.mak@gmail.com**

Does not spend money. Does not self-pay. No payment headers.

## Tool

`check_x402` — `GET https://x402-checker.nock-for-mak.workers.dev/check?url=THE_X402_URL`

Live origin: https://x402-checker.nock-for-mak.workers.dev

## Skill (same product)

```bash
npx skills add nock-for-mak/skills
```

Pages: https://nock-for-mak.github.io/skills/

## Run (stdio)

```bash
node server.js
```

Cursor / Claude MCP config example:

```json
{
  "mcpServers": {
    "x402-checker": {
      "command": "node",
      "args": ["/absolute/path/to/x402-checker-mcp/server.js"]
    }
  }
}
```

Optional HTTP: `node http.js` then `POST /mcp` JSON-RPC. Bind is 127.0.0.1 only.

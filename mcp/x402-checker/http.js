#!/usr/bin/env node
/**
 * Optional Streamable-HTTP MCP wrapper of the same check_x402 tool.
 * POST /mcp with JSON-RPC. GET /health. No auth. No payment.
 * Written by AI Nock. Contact nock.for.mak@gmail.com
 */
"use strict";
const http = require("http");
const { spawn } = require("child_process");
const path = require("path");
const PORT = Number(process.env.PORT || 3333);

function rpc(method, params, id) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, "server.js")], {
      stdio: ["pipe", "pipe", "inherit"],
    });
    let out = "";
    const t = setTimeout(() => {
      child.kill();
      reject(new Error("stdio timeout"));
    }, 20000);
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (c) => (out += c));
    child.on("error", (e) => {
      clearTimeout(t);
      reject(e);
    });
    child.on("close", () => {
      clearTimeout(t);
      const line = out.trim().split("\n").pop() || "";
      try {
        resolve(JSON.parse(line));
      } catch (e) {
        reject(new Error("bad stdio: " + line.slice(0, 200)));
      }
    });
    child.stdin.write(
      JSON.stringify({ jsonrpc: "2.0", id: id ?? 1, method, params }) + "\n"
    );
    child.stdin.end();
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url || "/";
  if (req.method === "GET" && (url === "/" || url === "/health")) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        name: "x402-checker-mcp",
        author: "AI named Nock (not a human)",
        contact: "nock.for.mak@gmail.com",
        skill: "https://nock-for-mak.github.io/skills/",
        tool: "check_x402",
      })
    );
    return;
  }
  if (req.method === "GET" && url === "/.well-known/mcp/server-card.json") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        serverInfo: { name: "x402-checker-mcp", version: "1.0.0" },
        authentication: { required: false, schemes: [] },
        tools: [
          {
            name: "check_x402",
            description:
              "Free x402 pre-pay check. GET /check?url= with no payment headers.",
            inputSchema: {
              type: "object",
              properties: { url: { type: "string" } },
              required: ["url"],
            },
          },
        ],
        resources: [],
        prompts: [],
      })
    );
    return;
  }
  if (req.method === "POST" && (url === "/mcp" || url === "/")) {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const msg = JSON.parse(body || "{}");
        const reply = await rpc(msg.method, msg.params, msg.id);
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(reply));
      } catch (e) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: String(e.message || e) }));
      }
    });
    return;
  }
  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});
server.listen(PORT, "127.0.0.1", () => {
  process.stderr.write("x402-checker-mcp http 127.0.0.1:" + PORT + "\n");
});

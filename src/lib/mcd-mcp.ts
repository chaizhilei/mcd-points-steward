const MCP_URL = process.env.MCD_MCP_URL ?? "https://mcp.mcd.cn";
const PROTOCOL_VERSION = "2025-06-18";

type JsonRpcSuccess = {
  jsonrpc: "2.0";
  id: number | string;
  result: {
    content?: Array<{ type: string; text?: string }>;
    isError?: boolean;
    structuredContent?: unknown;
  };
};

type JsonRpcError = {
  jsonrpc: "2.0";
  id: number | string;
  error: { code: number; message: string; data?: unknown };
};

let rpcId = 0;

function getToken(): string {
  const token = process.env.MCD_MCP_TOKEN;
  if (!token) {
    throw new Error("缺少 MCD_MCP_TOKEN，请在 .env.local 中配置");
  }
  return token;
}

function parseStructured<T>(result: JsonRpcSuccess["result"]): T {
  if (result.isError) {
    const text = result.content?.map((c) => c.text).join("\n") ?? "MCP 工具返回错误";
    throw new Error(text);
  }

  if (result.structuredContent !== undefined) {
    return result.structuredContent as T;
  }

  const text = result.content?.find((c) => c.type === "text")?.text;
  if (text) {
    const match = text.match(/## Original Response\s*\n\s*(\{[\s\S]*\})\s*$/);
    if (match) {
      return JSON.parse(match[1]) as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      // fall through
    }
  }

  throw new Error("无法解析 MCP 工具响应");
}

async function mcpRequest(method: string, params?: Record<string, unknown>) {
  const id = ++rpcId;
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": PROTOCOL_VERSION,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params: params ?? {},
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MCP HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/event-stream")) {
    const text = await res.text();
    const dataLine = text
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .find(Boolean);
    if (!dataLine) {
      throw new Error("MCP SSE 响应为空");
    }
    return JSON.parse(dataLine) as JsonRpcSuccess | JsonRpcError;
  }

  return (await res.json()) as JsonRpcSuccess | JsonRpcError;
}

export async function callTool<T = unknown>(
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const payload = await mcpRequest("tools/call", {
    name,
    arguments: args,
  });

  if ("error" in payload) {
    throw new Error(payload.error.message || "MCP JSON-RPC 错误");
  }

  return parseStructured<T>(payload.result);
}

type ApiEnvelope<T> = {
  success?: boolean;
  code?: number;
  message?: string;
  data?: T;
};

export async function callToolData<T>(
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const envelope = await callTool<ApiEnvelope<T> | T>(name, args);

  if (
    envelope &&
    typeof envelope === "object" &&
    "data" in envelope &&
    (envelope as ApiEnvelope<T>).data !== undefined
  ) {
    return (envelope as ApiEnvelope<T>).data as T;
  }

  return envelope as T;
}

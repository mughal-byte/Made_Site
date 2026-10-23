import type { IncomingMessage, ServerResponse } from 'node:http'

export function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

export async function readJson(req: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  const text = Buffer.concat(chunks).toString()
  if (!text) return {}
  return JSON.parse(text) as Record<string, unknown>
}

export function textField(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

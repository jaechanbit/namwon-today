export class HttpError extends Error {
  constructor(readonly url: string, readonly status: number, readonly statusText: string) {
    super(`HTTP ${status} ${statusText}: ${url}`); this.name = "HttpError";
  }
}
export class ParseError extends Error {
  constructor(readonly stage: "list" | "detail", message: string) {
    super(`${stage} parsing failed: ${message}`); this.name = "ParseError";
  }
}

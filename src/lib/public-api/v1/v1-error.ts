import type { ErrorCode } from "../envelope.ts";
export class V1ErrorLike extends Error {
  constructor(public status: number, public codigo: ErrorCode, message: string) { super(message); }
}

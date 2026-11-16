import type { ErrorCode } from "../envelope.ts";

// Erro de contrato da API v1 (vira o envelope { erro } no withPublicApi). Campos explícitos:
// o node --experimental-strip-types não aceita parameter properties no construtor.
export class V1ErrorLike extends Error {
  status: number;
  codigo: ErrorCode;
  constructor(status: number, codigo: ErrorCode, message: string) {
    super(message);
    this.status = status;
    this.codigo = codigo;
  }
}

/**
 * DomainError — the single error type the application layer throws.
 *
 * Why:
 *   - Stable, machine-readable `code` strings drive client UX, alerting, and audits.
 *   - `httpStatus` lets the exception filter map errors to responses without
 *     a giant switch statement.
 *   - `details` carries structured context (field paths, conflicting values),
 *     never raw stack traces — those go to logs only.
 *
 * Do NOT subclass for every variant. Use the factory helpers below to keep
 * call sites concise and the catalogue of codes auditable in one place.
 *
 * See docs/architecture/backend.md → error handling.
 * See docs/conventions/api-design.md → error envelope.
 */
export type DomainErrorKind =
  | 'VALIDATION_FAILED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'PRECONDITION_FAILED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'UNAVAILABLE'
  | 'BAD_REQUEST';

const KIND_TO_STATUS: Record<DomainErrorKind, number> = {
  VALIDATION_FAILED: 422,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  UNAVAILABLE: 503,
  BAD_REQUEST: 400,
};

export interface DomainErrorOptions {
  /** Optional structured context. Must be JSON-serializable, never contain secrets. */
  details?: Record<string, unknown>;
  /** Original error for log enrichment. Never serialized to the client. */
  cause?: unknown;
}

export class DomainError extends Error {
  public readonly kind: DomainErrorKind;
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    kind: DomainErrorKind,
    code: string,
    message: string,
    options: DomainErrorOptions = {},
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = 'DomainError';
    this.kind = kind;
    this.code = code;
    this.httpStatus = KIND_TO_STATUS[kind];

    if (options.details !== undefined) {
      this.details = options.details;
    }
    // V8 stack capture
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainError);
    }
  }

  // ---- Factory helpers — preferred over `new DomainError(...)` at call sites ----

  static validation(code: string, message: string, options?: DomainErrorOptions): DomainError {
    return new DomainError('VALIDATION_FAILED', code, message, options);
  }

  static unauthenticated(
    message = 'Authentication required',
    options?: DomainErrorOptions,
  ): DomainError {
    return new DomainError('UNAUTHENTICATED', 'UNAUTHENTICATED', message, options);
  }

  static forbidden(message = 'Forbidden', options?: DomainErrorOptions): DomainError {
    return new DomainError('FORBIDDEN', 'FORBIDDEN', message, options);
  }

  static notFound(resource: string, options?: DomainErrorOptions): DomainError {
    return new DomainError(
      'NOT_FOUND',
      `${resource.toUpperCase()}_NOT_FOUND`,
      `${resource} not found`,
      options,
    );
  }

  static conflict(code: string, message: string, options?: DomainErrorOptions): DomainError {
    return new DomainError('CONFLICT', code, message, options);
  }

  static precondition(code: string, message: string, options?: DomainErrorOptions): DomainError {
    return new DomainError('PRECONDITION_FAILED', code, message, options);
  }

  static rateLimited(message = 'Rate limit exceeded', options?: DomainErrorOptions): DomainError {
    return new DomainError('RATE_LIMITED', 'RATE_LIMITED', message, options);
  }

  static internal(message = 'Internal error', options?: DomainErrorOptions): DomainError {
    return new DomainError('INTERNAL_ERROR', 'INTERNAL_ERROR', message, options);
  }

  static unavailable(message = 'Service unavailable', options?: DomainErrorOptions): DomainError {
    return new DomainError('UNAVAILABLE', 'SERVICE_UNAVAILABLE', message, options);
  }

  static badRequest(code: string, message: string, options?: DomainErrorOptions): DomainError {
    return new DomainError('BAD_REQUEST', code, message, options);
  }
}

export const isDomainError = (e: unknown): e is DomainError => e instanceof DomainError;

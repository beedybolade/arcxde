export type ConnectorErrorCode =
  | 'fetch_failed'
  | 'normalize_failed'
  | 'validation_failed'
  | 'duplicate_external_id'
  | 'insert_failed'
  | 'aborted';

export interface ConnectorRunError {
  code: ConnectorErrorCode;
  message: string;
  external_id?: string | undefined;
}

export class ConnectorValidationError extends Error {
  readonly code: ConnectorErrorCode = 'validation_failed';
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = 'ConnectorValidationError';
    this.field = field;
  }
}

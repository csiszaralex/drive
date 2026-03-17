export interface ApiErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string | string[];
  timestamp: string;
  path: string;
  stack?: string;
}

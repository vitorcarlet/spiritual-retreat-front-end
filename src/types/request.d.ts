type RequestResponse<T> = Promise<{
  data?: T | T[];
  error?: string;
  success: boolean;
}>;

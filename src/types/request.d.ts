type RequestResponse<T> = Promise<{
  data?: T;
  error?: string;
  success: boolean;
}>;

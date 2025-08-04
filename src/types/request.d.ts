type RequestResponse<T> = Promise<{
  data?: T | T[] | undefined;
  error?: string;
  success: boolean;
}>;

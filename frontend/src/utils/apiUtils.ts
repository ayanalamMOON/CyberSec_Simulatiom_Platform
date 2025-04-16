export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    // @ts-ignore
    return error.message;
  }
  return 'An unknown error occurred.';
}

export function isApiResponseOk(response: any): boolean {
  return response && (response.status === 200 || response.ok === true);
}
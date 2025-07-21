// createutils/errorHandlers.ts
export const handleApiError = (response: Response): Error => {
  if (response.redirected) {
    return new Error("Authentication may have expired. Please refresh the page.");
  }

  if (response.status === 401 || response.status === 403) {
    return new Error("Authentication required. Please login again.");
  }

  return new Error(`HTTP error! status: ${response.status}`);
};

export const getErrorMessage = (err: unknown): string => {
  return err instanceof Error ? err.message : String(err);
};
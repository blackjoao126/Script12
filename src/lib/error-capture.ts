let lastError: unknown;

export function captureError(error: unknown): void {
  lastError = error;
}

export function consumeLastCapturedError(): unknown {
  const error = lastError;
  lastError = undefined;
  return error;
}

if (typeof global !== "undefined") {
  (global as { __lastError?: unknown }).__lastError = undefined;
}

// Capture unhandled errors during SSR
if (typeof process !== "undefined" && process.on) {
  process.on("uncaughtException", (error) => {
    captureError(error);
  });
}

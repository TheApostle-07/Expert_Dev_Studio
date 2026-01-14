export function logEvent(event: string, payload?: Record<string, unknown>) {
  if (payload) {
    console.info(`[FOUNDERS] ${event}`, payload);
  } else {
    console.info(`[FOUNDERS] ${event}`);
  }
}

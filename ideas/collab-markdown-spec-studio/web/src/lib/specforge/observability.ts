export function getRequestId(headers: Headers) {
  return headers.get("x-specforge-request-id") ?? "missing-request-id";
}

export function logServerEvent(
  event: string,
  fields: Record<string, unknown> = {},
) {
  console.log(
    JSON.stringify({
      at: new Date().toISOString(),
      service: "specforge-web",
      event,
      ...fields,
    }),
  );
}

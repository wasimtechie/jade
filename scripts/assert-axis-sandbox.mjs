/** Sandbox tools write rates/inventory and must never target the live CM. */
export function assertAxisSandbox(baseUrl) {
  const url = new URL(baseUrl);
  if (url.protocol !== "https:" || !/^(sandbox\d+|preprod\d+)\.axisrooms\.com$/.test(url.hostname) || url.port || url.username || url.password) {
    throw new Error("Sandbox tools require an explicit https://sandboxN.axisrooms.com or https://preprodN.axisrooms.com URL; production is blocked.");
  }
}

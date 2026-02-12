export type DeviceKind = "mobile" | "laptop" | "tablet";

const tabletPattern = /(ipad|tablet|kindle|silk|playbook|android(?!.*mobile))/i;
const mobilePattern =
  /(iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|mobile)/i;

export function detectDeviceKind(userAgent: string): DeviceKind {
  const ua = userAgent || "";

  if (tabletPattern.test(ua)) {
    return "tablet";
  }

  if (mobilePattern.test(ua)) {
    return "mobile";
  }

  return "laptop";
}

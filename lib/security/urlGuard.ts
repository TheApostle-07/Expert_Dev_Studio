import dns from "dns/promises";
import net from "net";

export class UrlGuardError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const PRIVATE_IPV4_RANGES = [
  { start: "10.0.0.0", end: "10.255.255.255" },
  { start: "127.0.0.0", end: "127.255.255.255" },
  { start: "169.254.0.0", end: "169.254.255.255" },
  { start: "172.16.0.0", end: "172.31.255.255" },
  { start: "192.168.0.0", end: "192.168.255.255" },
];

const PRIVATE_IPV6_PREFIXES = ["::1", "fe80", "fc", "fd"];

function ipv4ToLong(ip: string): number {
  return ip
    .split(".")
    .map((part) => Number.parseInt(part, 10))
    .reduce((acc, part) => (acc << 8) + part, 0);
}

function isPrivateIpv4(ip: string): boolean {
  const long = ipv4ToLong(ip);
  return PRIVATE_IPV4_RANGES.some((range) => {
    const start = ipv4ToLong(range.start);
    const end = ipv4ToLong(range.end);
    return long >= start && long <= end;
  });
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1") {
    return true;
  }
  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.replace("::ffff:", "");
    if (net.isIP(mapped) === 4) {
      return isPrivateIpv4(mapped);
    }
  }
  return PRIVATE_IPV6_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function normalizeUrl(input: string): URL {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new UrlGuardError("INVALID_URL", "URL is required");
  }

  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new UrlGuardError("INVALID_URL", "Invalid URL format");
  }

  url.hash = "";
  url.hostname = url.hostname.toLowerCase();

  if (url.protocol !== "https:") {
    throw new UrlGuardError("INVALID_SCHEME", "Only https URLs are allowed");
  }

  if (url.username || url.password) {
    throw new UrlGuardError("CREDENTIALS_NOT_ALLOWED", "Credentials in URL are not allowed");
  }

  return url;
}

async function assertPublicHost(hostname: string): Promise<void> {
  const ipType = net.isIP(hostname);
  if (ipType === 4) {
    if (isPrivateIpv4(hostname)) {
      throw new UrlGuardError("PRIVATE_IP", "Private IP addresses are not allowed");
    }
    return;
  }

  if (ipType === 6) {
    if (isPrivateIpv6(hostname)) {
      throw new UrlGuardError("PRIVATE_IP", "Private IP addresses are not allowed");
    }
    return;
  }

  let records: Array<{ address: string }> = [];
  try {
    records = await dns.lookup(hostname, { all: true });
  } catch {
    throw new UrlGuardError("DNS_LOOKUP_FAILED", "Unable to resolve hostname");
  }

  if (!records.length) {
    throw new UrlGuardError("DNS_LOOKUP_FAILED", "Unable to resolve hostname");
  }

  for (const record of records) {
    const addrType = net.isIP(record.address);
    if (addrType === 4 && isPrivateIpv4(record.address)) {
      throw new UrlGuardError("PRIVATE_IP", "Private IP addresses are not allowed");
    }
    if (addrType === 6 && isPrivateIpv6(record.address)) {
      throw new UrlGuardError("PRIVATE_IP", "Private IP addresses are not allowed");
    }
  }
}

export async function guardUrl(input: string): Promise<{ normalizedUrl: string; host: string }>{
  const url = normalizeUrl(input);
  await assertPublicHost(url.hostname);
  return { normalizedUrl: url.toString(), host: url.hostname };
}

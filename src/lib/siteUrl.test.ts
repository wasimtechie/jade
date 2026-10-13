import { afterEach, describe, expect, it, vi } from "vitest";
import { getEmailSiteBaseUrl, getSiteBaseUrl } from "@/lib/siteUrl";

const envBackup = { ...process.env };

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...envBackup };
});

function clearSiteEnv() {
  delete process.env.EMAIL_SITE_URL;
  delete process.env.SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  delete process.env.VERCEL_URL;
  delete process.env.VERCEL;
  vi.stubEnv("NODE_ENV", undefined);
}

describe("getSiteBaseUrl", () => {
  it("prefers SITE_URL over other env vars", () => {
    clearSiteEnv();
    process.env.SITE_URL = "https://www.jaderetreats.com";
    process.env.NEXT_PUBLIC_SITE_URL = "https://jade-revamp.vercel.app";
    process.env.VERCEL_URL = "preview.vercel.app";
    expect(getSiteBaseUrl()).toBe("https://www.jaderetreats.com");
  });

  it("uses NEXT_PUBLIC_SITE_URL when it is a public URL", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "https://jade-revamp.vercel.app";
    expect(getSiteBaseUrl()).toBe("https://jade-revamp.vercel.app");
  });

  it("ignores localhost NEXT_PUBLIC_SITE_URL and uses Vercel production URL", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "jade-revamp.vercel.app";
    process.env.VERCEL_URL = "jade-revamp-git-main.vercel.app";
    expect(getSiteBaseUrl()).toBe("https://jade-revamp.vercel.app");
  });

  it("falls back to VERCEL_URL when no explicit public URL is set", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    process.env.VERCEL_URL = "jade-revamp.vercel.app";
    expect(getSiteBaseUrl()).toBe("https://jade-revamp.vercel.app");
  });

  it("defaults to jaderetreats.com when only localhost is available", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(getSiteBaseUrl()).toBe("https://jaderetreats.com");
  });

  it("allows localhost only when explicitly requested", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(getSiteBaseUrl({ allowLocalhost: true })).toBe(
      "http://localhost:3000",
    );
  });

  it("normalizes host-only SITE_URL with https", () => {
    clearSiteEnv();
    process.env.SITE_URL = "jaderetreats.com/";
    expect(getSiteBaseUrl()).toBe("https://jaderetreats.com");
  });
});

describe("getEmailSiteBaseUrl", () => {
  it("prefers EMAIL_SITE_URL for policy-footer links", () => {
    clearSiteEnv();
    process.env.EMAIL_SITE_URL = "https://jaderetreats.com";
    process.env.SITE_URL = "https://jade-revamp.vercel.app";
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(getEmailSiteBaseUrl()).toBe("https://jaderetreats.com");
  });

  it("skips localhost and falls back to jaderetreats.com", () => {
    clearSiteEnv();
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(getEmailSiteBaseUrl()).toBe("https://jaderetreats.com");
  });
});

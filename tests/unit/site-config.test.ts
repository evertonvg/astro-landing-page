import { describe, expect, it } from 'vitest';
import { CONTACT_LIMITS } from '../../src/lib/contact-schema';
import { GET } from '../../src/pages/site.webmanifest';
import { site } from '../../src/site.config';

describe('site config', () => {
  it('privacyPolicyVersion fits the consentVersion rules limit', () => {
    expect(site.privacyPolicyVersion.length).toBeGreaterThanOrEqual(1);
    expect(site.privacyPolicyVersion.length).toBeLessThanOrEqual(CONTACT_LIMITS.consentVersion);
  });

  it('generates the web manifest from site config', async () => {
    const response = await GET({} as Parameters<typeof GET>[0]);
    const manifest = (await response.json()) as Record<string, unknown>;
    expect(manifest).toMatchObject({
      name: site.name,
      short_name: site.name,
      theme_color: site.themeColor,
      background_color: site.backgroundColor,
    });
  });
});

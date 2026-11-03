import { describe, expect, it } from 'vitest';
import { consentModeState, cookieTable, type ConsentCategory } from '../../src/lib/consent';

const denied = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
};

describe('consentModeState', () => {
  it('denies everything for necessary only', () => {
    expect(consentModeState(['necessary'])).toEqual(denied);
  });

  it('grants only analytics_storage for analytics', () => {
    expect(consentModeState(['necessary', 'analytics'])).toEqual({
      ...denied,
      analytics_storage: 'granted',
    });
  });

  it('grants the three ad signals for marketing', () => {
    expect(consentModeState(['necessary', 'marketing'])).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });

  it('denies everything for media alone', () => {
    expect(consentModeState(['media'])).toEqual(denied);
  });
});

describe('cookieTable', () => {
  it('has a row for every category', () => {
    const categories: ConsentCategory[] = ['necessary', 'analytics', 'marketing', 'media'];
    for (const category of categories) {
      expect(cookieTable.some((row) => row.category === category)).toBe(true);
    }
  });
});

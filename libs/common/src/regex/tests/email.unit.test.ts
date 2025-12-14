import { faker } from '@faker-js/faker';

import { emailRegex } from '../email';

describe('emailRegex', () => {
  it('should match randomly generated valid emails', () => {
    const emails = Array.from({ length: 20 }, () => faker.internet.email());

    for (const email of emails) {
      expect(emailRegex.test(email)).toBe(true);
    }
  });

  it('should match valid emails with subdomains', () => {
    const emails = Array.from(
      { length: 10 },
      () => `${faker.internet.username()}@${faker.internet.domainWord()}.${faker.internet.domainWord()}.com`,
    );

    for (const email of emails) {
      expect(emailRegex.test(email)).toBe(true);
    }
  });

  it('should not match emails missing "@"', () => {
    const emails = Array.from({ length: 10 }, () => faker.internet.username() + faker.internet.domainName());

    for (const email of emails) {
      expect(emailRegex.test(email)).toBe(false);
    }
  });

  it('should not match emails with spaces', () => {
    const emails = Array.from(
      { length: 10 },
      () => `${faker.internet.username()} ${faker.internet.domainName()}@example.com`,
    );

    for (const email of emails) {
      expect(emailRegex.test(email)).toBe(false);
    }
  });

  it('should not match emails without top-level domain', () => {
    const emails = Array.from({ length: 10 }, () => `${faker.internet.username()}@${faker.internet.domainWord()}`);

    for (const email of emails) {
      expect(emailRegex.test(email)).toBe(false);
    }
  });

  it('should not match empty strings', () => {
    expect(emailRegex.test('')).toBe(false);
  });

  it('should not match emails with multiple "@" symbols', () => {
    const emails = Array.from({ length: 10 }, () => `${faker.internet.username()}@@${faker.internet.domainName()}`);

    for (const email of emails) {
      expect(emailRegex.test(email)).toBe(false);
    }
  });
});

import { faker } from '@faker-js/faker';

import { generateBusinessSlots, slotKey } from '../slots';

describe('slots', () => {
  beforeAll(() => {
    process.env.TZ = 'UTC';
  });

  describe('slotKey', () => {
    it('should return the unix timestamp in milliseconds', () => {
      const date = faker.date.anytime();
      expect(slotKey(date)).toBe(date.getTime());
    });
  });

  describe('generateBusinessSlots', () => {
    const slotMs = 30 * 60 * 1000;
    const businessStartMs = 9 * 60 * 60 * 1000; // 09:00
    const businessEndMs = 18 * 60 * 60 * 1000; // 18:00

    const makeUtcDate = (y: number, m: number, d: number, hh = 0, mm = 0): Date =>
      new Date(Date.UTC(y, m, d, hh, mm, 0, 0));

    it('should generate all 30-minute slots within business hours for a full single day', () => {
      const startDate = makeUtcDate(2025, 0, 10, 0, 0); // Jan 10
      const endDate = makeUtcDate(2025, 0, 10, 23, 59);

      const slots = generateBusinessSlots(startDate, endDate, slotMs, businessStartMs, businessEndMs);

      // From 09:00 to 18:00 with 30-min slots => 9 hours * 2 = 18 slots
      expect(slots).toHaveLength(18);

      // First slot is 09:00
      expect(slots[0].slot.getUTCHours()).toBe(9);
      expect(slots[0].slot.getUTCMinutes()).toBe(0);

      // Last slot starts at 17:30 (must end by 18:00)
      const last = slots[slots.length - 1].slot;
      expect(last.getUTCHours()).toBe(17);
      expect(last.getUTCMinutes()).toBe(30);

      // All slots are aligned and within [09:00, 18:00)
      for (const s of slots) {
        const t = s.slot.getTime();
        expect(t % slotMs).toBe(0);

        const h = s.slot.getUTCHours();
        const min = s.slot.getUTCMinutes();

        // start >= 09:00
        expect(h > 9 || (h === 9 && min >= 0)).toBe(true);
        // start <= 17:30
        expect(h < 18).toBe(true);
      }
    });

    it('should respect the provided range boundaries (partial window)', () => {
      // Range starts at 10:10 => first slot should be 10:30
      const startDate = makeUtcDate(2025, 0, 10, 10, 10);
      // Range ends at 12:40 => last slot must start at 12:00 (ends 12:30) or 12:30 (ends 13:00) is NOT allowed
      const endDate = makeUtcDate(2025, 0, 10, 12, 40);

      const slots = generateBusinessSlots(startDate, endDate, slotMs, businessStartMs, businessEndMs);

      expect(slots[0].slot.getUTCHours()).toBe(10);
      expect(slots[0].slot.getUTCMinutes()).toBe(30);

      const last = slots[slots.length - 1].slot;
      expect(last.getUTCHours()).toBe(12);
      expect(last.getUTCMinutes()).toBe(0);
    });

    it('should return an empty array for invalid inputs', () => {
      const startDate = makeUtcDate(2025, 0, 10, 10, 0);
      const endDate = makeUtcDate(2025, 0, 10, 9, 0);

      expect(generateBusinessSlots(startDate, endDate, slotMs, businessStartMs, businessEndMs)).toEqual([]);
      expect(generateBusinessSlots(startDate, startDate, 0, businessStartMs, businessEndMs)).toEqual([]);
      expect(generateBusinessSlots(startDate, startDate, slotMs, businessEndMs, businessStartMs)).toEqual([]);
    });

    it('should generate slots across multiple days and never exceed business hours', () => {
      const startDate = makeUtcDate(2025, 0, 10, 0, 0);
      const endDate = makeUtcDate(2025, 0, 11, 23, 59);

      const slots = generateBusinessSlots(startDate, endDate, slotMs, businessStartMs, businessEndMs);

      // 2 full days => 18 + 18 = 36 slots
      expect(slots).toHaveLength(36);

      // Ensure every slot starts between 09:00 and 17:30 inclusive
      for (const s of slots) {
        const h = s.slot.getUTCHours();
        const m = s.slot.getUTCMinutes();

        expect(h >= 9).toBe(true);
        expect(h < 18).toBe(true);
        if (h === 17) expect(m).toBeLessThanOrEqual(30);
      }
    });
  });
});

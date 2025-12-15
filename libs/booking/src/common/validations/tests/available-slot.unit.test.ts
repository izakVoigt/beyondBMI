import { faker } from '@faker-js/faker';

import { availableSlotArraySchema, availableSlotSchema } from '../available-slot';

describe('availableSlot', () => {
  describe('availableSlotSchema', () => {
    it('should pass with a valid Date object', () => {
      const slot = faker.date.anytime();
      const result = availableSlotSchema.safeParse({ slot });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slot).toEqual(slot);
        expect(result.data.slot).toBeInstanceOf(Date);
      }
    });

    it('should fail if slot is missing', () => {
      const result = availableSlotSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.join('.') === 'slot');

        expect(issue).toBeTruthy();
      }
    });

    it('should fail if slot is not a Date (string)', () => {
      const result = availableSlotSchema.safeParse({ slot: faker.date.anytime().toISOString() });

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.join('.') === 'slot');

        expect(issue).toBeTruthy();
        expect(issue?.message).toBe('"slot" must be a valid date');
      }
    });

    it('should fail if slot is not a Date (number)', () => {
      const result = availableSlotSchema.safeParse({ slot: faker.number.int() });

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.join('.') === 'slot');

        expect(issue).toBeTruthy();
      }
    });

    it('should fail if extra fields are present (strict schema)', () => {
      const result = availableSlotSchema.safeParse({
        extra: true,
        slot: faker.date.anytime(),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => /unrecognized key|unrecognized keys/i.test(i.message))).toBe(true);
      }
    });
  });

  describe('availableSlotArraySchema', () => {
    it('should pass with an empty array', () => {
      const result = availableSlotArraySchema.safeParse([]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('should pass with an array of valid slots', () => {
      const slots = Array.from({ length: 3 }, () => ({
        slot: faker.date.anytime(),
      }));

      const result = availableSlotArraySchema.safeParse(slots);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);
        result.data.forEach((item, index) => {
          expect(item.slot).toEqual(slots[index].slot);
          expect(item.slot).toBeInstanceOf(Date);
        });
      }
    });

    it('should fail if one element in the array is invalid', () => {
      const result = availableSlotArraySchema.safeParse([
        { slot: faker.date.anytime() },
        { slot: '2025-01-01T12:00:00Z' },
      ]);

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path.join('.') === '1.slot');

        expect(issue).toBeTruthy();
      }
    });

    it('should fail if array contains non-object values', () => {
      const result = availableSlotArraySchema.safeParse([{ slot: faker.date.anytime() }, faker.number.int()]);

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(i => i.path[0] === 1);

        expect(issue).toBeTruthy();
      }
    });

    it('should fail if an element contains extra fields (strict schema)', () => {
      const result = availableSlotArraySchema.safeParse([
        {
          extra: true,
          slot: faker.date.anytime(),
        },
      ]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => /unrecognized key|unrecognized keys/i.test(i.message))).toBe(true);
      }
    });

    it('should fail if value is not an array', () => {
      const result = availableSlotArraySchema.safeParse({
        slot: faker.date.anytime(),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/array/i);
      }
    });
  });
});

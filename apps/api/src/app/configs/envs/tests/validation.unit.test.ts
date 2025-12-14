import { faker } from '@faker-js/faker';
import { NodeEnv } from '@libs/common/enums/node-env';

import { envValidationSchema } from '../validation';

describe('envValidationSchema', () => {
  const baseInput = {
    MONGODB_URI: faker.internet.url(),
    NODE_ENV: NodeEnv.DEVELOPMENT,
    PORT: String(faker.number.int({ max: 65535, min: 1 })),
  };

  it('should successfully parse a valid environment object', async () => {
    const result = envValidationSchema.parse(baseInput);

    expect(result).toEqual({
      MONGODB_URI: baseInput.MONGODB_URI,
      NODE_ENV: baseInput.NODE_ENV,
      PORT: Number(baseInput.PORT),
    });
    expect(typeof result.PORT).toBe('number');
    expect(Number.isFinite(result.PORT)).toBe(true);
  });

  it('should reject when "MONGODB_URI" is missing', () => {
    const input = {
      NODE_ENV: baseInput.NODE_ENV,
      PORT: baseInput.PORT,
    };

    const parsed = envValidationSchema.safeParse(input);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issues = parsed.error.issues;

      expect(issues.some(i => i.path.join('.') === 'MONGODB_URI')).toBe(true);
      expect(issues.some(i => i.message.includes('Invalid input: expected string, received undefined'))).toBe(true);
    }
  });

  it('should reject when "MONGODB_URI" is an empty string', () => {
    const input = {
      MONGODB_URI: '',
      NODE_ENV: baseInput.NODE_ENV,
      PORT: baseInput.PORT,
    };

    const parsed = envValidationSchema.safeParse(input);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find(i => i.path.join('.') === 'MONGODB_URI');

      expect(issue).toBeDefined();
      expect(issue?.message).toBe('"MONGODB_URI" is required');
    }
  });

  it('should reject when "NODE_ENV" is missing', () => {
    const input = {
      MONGODB_URI: baseInput.MONGODB_URI,
      PORT: baseInput.PORT,
    };

    const parsed = envValidationSchema.safeParse(input);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some(i => i.path.join('.') === 'NODE_ENV')).toBe(true);
    }
  });

  it('should reject when "NODE_ENV" is not one of the allowed values and include the custom message', () => {
    const input = {
      MONGODB_URI: baseInput.MONGODB_URI,
      NODE_ENV: faker.string.sample(1),
      PORT: baseInput.PORT,
    };

    const parsed = envValidationSchema.safeParse(input);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find(i => i.path.join('.') === 'NODE_ENV');

      expect(issue).toBeDefined();
      expect(issue?.message).toContain('"NODE_ENV" must be one of the following:');
      for (const value of Object.values(NodeEnv)) {
        expect(issue?.message).toContain(value);
      }
    }
  });

  it('should reject when "PORT" is missing', () => {
    const input = {
      MONGODB_URI: baseInput.MONGODB_URI,
      NODE_ENV: baseInput.NODE_ENV,
    };

    const parsed = envValidationSchema.safeParse(input);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some(i => i.path.join('.') === 'PORT')).toBe(true);
    }
  });

  it('should reject when "PORT" is not a valid number', async () => {
    const invalidPort = faker.string.alpha({ length: { max: 12, min: 1 } });

    const input = {
      MONGODB_URI: baseInput.MONGODB_URI,
      NODE_ENV: baseInput.NODE_ENV,
      PORT: invalidPort,
    };

    const parsed = envValidationSchema.safeParse(input);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find(i => i.path.join('.') === 'PORT');

      expect(issue).toBeDefined();
      expect(issue?.message).toBe('Must be a valid number');
    }
  });

  it('should reject when multiple fields are invalid and report all of them', () => {
    const input = {
      MONGODB_URI: '',
      NODE_ENV: faker.string.sample(1),
      PORT: 'NaN',
    };

    const parsed = envValidationSchema.safeParse(input);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const paths = parsed.error.issues.map(i => i.path.join('.'));

      expect(paths).toContain('MONGODB_URI');
      expect(paths).toContain('NODE_ENV');
      expect(paths).toContain('PORT');
    }
  });
});

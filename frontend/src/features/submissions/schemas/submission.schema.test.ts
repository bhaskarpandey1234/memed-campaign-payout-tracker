import { describe, expect, it } from 'vitest';
import { submissionUrlSchema, viewCountSchema } from './submission.schema';

describe('submission validation', () => {
  it('accepts only URLs for the campaign platform', () => { expect(submissionUrlSchema('Instagram').safeParse({ postUrl: 'https://www.instagram.com/p/example/' }).success).toBe(true); expect(submissionUrlSchema('Instagram').safeParse({ postUrl: 'https://youtube.com/watch?v=example' }).success).toBe(false); });
  it('does not allow simulated views to decrease', () => { expect(viewCountSchema(1250).safeParse({ views: '1249' }).success).toBe(false); expect(viewCountSchema(1250).safeParse({ views: '1250' }).success).toBe(true); });
});

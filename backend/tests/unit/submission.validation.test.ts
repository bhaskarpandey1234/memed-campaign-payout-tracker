import { isPostUrlForPlatform } from '../../src/modules/submissions/submission.validation';

describe('submission platform validation', () => {
  test('accepts Instagram URLs for Instagram campaigns', () => {
    expect(isPostUrlForPlatform('Instagram', 'https://www.instagram.com/p/example/')).toBe(true);
  });
  test('rejects YouTube URLs for Instagram campaigns', () => {
    expect(isPostUrlForPlatform('Instagram', 'https://www.youtube.com/watch?v=example')).toBe(false);
  });
  test('accepts YouTube and youtu.be URLs for YouTube campaigns', () => {
    expect(isPostUrlForPlatform('YouTube', 'https://www.youtube.com/watch?v=example')).toBe(true);
    expect(isPostUrlForPlatform('YouTube', 'https://youtu.be/example')).toBe(true);
  });
  test('rejects Instagram URLs for YouTube campaigns', () => {
    expect(isPostUrlForPlatform('YouTube', 'https://www.instagram.com/p/example/')).toBe(false);
  });
});

import { z } from 'zod';

function isPlatformUrl(platform: string, value: string) {
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const hostname = parsed.hostname.toLowerCase();
    return platform === 'Instagram'
      ? hostname === 'instagram.com' || hostname.endsWith('.instagram.com')
      : hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be';
  } catch { return false; }
}

export function submissionUrlSchema(platform: string) {
  return z.object({
    postUrl: z.string().trim().min(1, 'Add your post link.').url('Enter a valid URL.').refine((value) => isPlatformUrl(platform, value), `Use a ${platform} post URL.`),
  });
}

export function viewCountSchema(currentViews: number) {
  return z.object({
    views: z.string().trim().regex(/^\d+$/, 'Use a non-negative whole number.').refine((value) => Number(value) >= currentViews, `Views cannot be below ${currentViews.toLocaleString('en-IN')}.`),
  });
}

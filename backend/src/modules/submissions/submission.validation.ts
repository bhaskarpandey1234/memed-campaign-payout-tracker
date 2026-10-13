import { z } from 'zod';
import type { Platform } from '../campaigns/campaign.types';

export const submissionSchema = z.object({
  postUrl: z.string().url().refine((value) => /^https?:\/\//.test(value), 'Must be an HTTP(S) URL'),
});
export const viewsSchema = z.object({ views: z.number().int().nonnegative() });
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type ViewsInput = z.infer<typeof viewsSchema>;

export function isPostUrlForPlatform(platform: Platform, value: string) {
  const hostname = new URL(value).hostname.toLowerCase();
  if (platform === 'Instagram') return hostname === 'instagram.com' || hostname.endsWith('.instagram.com');
  return hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be';
}

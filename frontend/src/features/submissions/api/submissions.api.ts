import { api } from '@/lib/api/client';

export function createSubmission(campaignId: string, postUrl: string) {
  return api(`/campaigns/${campaignId}/submissions`, { method: 'POST', body: JSON.stringify({ postUrl }) });
}

export function updateSubmissionViews(submissionId: string, views: number) {
  return api(`/submissions/${submissionId}/views`, { method: 'PATCH', body: JSON.stringify({ views }) });
}

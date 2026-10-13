export interface Submission {
  _id: string;
  campaign: { _id: string; name: string; platform: string } | string;
  postUrl: string;
  views: number;
  creditedPayout: number;
  budgetCapped: boolean;
}

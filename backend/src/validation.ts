import { z } from 'zod';
export const signupSchema=z.object({email:z.string().email(),password:z.string().min(6),role:z.enum(['brand','creator'])});
export const loginSchema=z.object({email:z.string().email(),password:z.string().min(1)});
export const campaignSchema=z.object({name:z.string().trim().min(1).max(120),platform:z.enum(['Instagram','YouTube']),totalBudget:z.number().int().positive(),milestones:z.array(z.object({threshold:z.number().int().positive(),payout:z.number().int().nonnegative()})).min(1)}).superRefine((v,ctx)=>{ for(let i=1;i<v.milestones.length;i++){if(v.milestones[i].threshold<=v.milestones[i-1].threshold)ctx.addIssue({code:'custom',path:['milestones'],message:'Thresholds must be strictly increasing'});if(v.milestones[i].payout<v.milestones[i-1].payout)ctx.addIssue({code:'custom',path:['milestones'],message:'Payouts must be non-decreasing'});} });
export const submissionSchema=z.object({postUrl:z.string().url().refine(v=>/^https?:\/\//.test(v),'Must be an HTTP(S) URL')});
export const viewsSchema=z.object({views:z.number().int().nonnegative()});
export function normalizeCampaignName(value:string){return value.trim().toLowerCase();}
export function isPostUrlForPlatform(platform:'Instagram'|'YouTube', value:string) {
  const hostname=new URL(value).hostname.toLowerCase();
  if(platform==='Instagram') return hostname==='instagram.com'||hostname.endsWith('.instagram.com');
  return hostname==='youtube.com'||hostname.endsWith('.youtube.com')||hostname==='youtu.be';
}

# Software Requirements Specification

## 1. Purpose

Meme'd Campaign Payout Tracker lets brands publish view-based creator campaigns and lets creators submit posts, receive milestone payouts, and monitor earnings.

## 2. Actors

- Brand: owns campaigns and monitors budget consumption.
- Creator: browses live campaigns, submits posts, and views earnings.
- Platform simulator: sends view updates to a submission.

## 3. Functional requirements

1. Users can sign up and log in as either `brand` or `creator`.
2. Authenticated brand users can create campaigns with a name, Instagram/YouTube platform, budget, and ordered view/payout milestones.
3. Brands can view campaign spent and remaining budget.
4. Creators can list active campaigns with remaining budget.
5. Creators can submit multiple valid HTTP(S) post links to a campaign.
6. A submission's view count can be updated through `PATCH /api/submissions/:id/views`.
7. The highest crossed milestone determines the cumulative target payout.
8. Only the unpaid difference is credited for each update.
9. A campaign's spend must never exceed its budget. If the remaining budget is smaller than an unpaid amount, only the remaining amount is credited and the submission is marked budget-capped.
10. Creator earnings aggregate all credited submission payouts.
11. Concurrent view updates must be serialized with a MongoDB transaction when MongoDB supports transactions.

## 4. API contract

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create a user and set JWT cookie |
| POST | `/api/auth/login` | Public | Authenticate and set JWT cookie |
| POST | `/api/auth/logout` | Public | Clear JWT cookie |
| GET | `/api/auth/me` | JWT | Return current user |
| POST | `/api/campaigns` | Brand | Create campaign |
| GET | `/api/campaigns/mine` | Brand | List owned campaigns with budget summary |
| GET | `/api/campaigns/live` | Creator | List active campaigns with remaining budget |
| POST | `/api/campaigns/:id/submissions` | Creator | Submit a post |
| GET | `/api/earnings/me` | Creator | Return total and submission earnings |
| PATCH | `/api/submissions/:id/views` | Public simulator | Update views and calculate payout |

All errors use `{ "message": string, "errors"?: object }`.

## 5. Data requirements

- User: email, password hash, role, timestamps.
- Campaign: brand, name, platform, total budget, spent, milestones, status, timestamps.
- Submission: campaign, creator, URL, views, highest milestone, credited payout, budget-capped flag, timestamps.
- Currency is integer paise. Thresholds are positive integers. Milestones are strictly increasing by threshold and non-decreasing by payout.

## 6. Security and authorization

Passwords are hashed with bcrypt. JWTs are stored in HttpOnly cookies. Brand routes require brand ownership; creator routes require creator role. CORS is restricted to the configured frontend origin. The simulator view endpoint deliberately has no role check for the assignment.

## 7. UI requirements

The frontend includes login/signup, a brand dashboard for campaign creation and spend tracking, and a creator dashboard for live campaigns, submission links, view simulation, and earnings.

## 8. Acceptance criteria

- A brand can sign up, create a campaign, and see spend/remaining budget.
- A creator can sign up, see live campaigns, submit a link, update views, and see earnings.
- Crossing multiple milestones in one update produces the highest cumulative payout once.
- Repeating the same update does not double-pay.
- Budget cap is enforced, including concurrent updates.
- Invalid roles, input, IDs, and ownership return useful 4xx errors.

## 9. Out of scope

Redis caching, anomaly detection, Docker, real platform APIs, campaign end dates, and production-grade platform webhook authentication.

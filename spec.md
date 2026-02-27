# Specification

## Summary
**Goal:** Add a trust/credit score system for finders in the Campus Lost & Found Portal, tracking finder reputation and displaying badge tiers on item cards.

**Planned changes:**
- Add a `finders` collection in the backend to store finder profiles (name, contact, total_returned, credit_score)
- When a claim is approved and item resolved, automatically create or update the finder's profile: increment `total_returned` by 1 and `credit_score` by 10
- Add a `GET /finders` endpoint returning all finder profiles sorted by `credit_score` descending
- Update the found items list endpoint to sort found items by finder `credit_score` descending (lost items keep timestamp descending order)
- Attach `finder_credit_score` and `finder_badge` fields to each found item in list/detail responses (joined from the finders collection)
- Display a credit score badge on found item cards: 🥉 Bronze (0–20), 🥈 Silver (21–50), 🥇 Gold (51+); no badge shown for lost items or items with no finder profile

**User-visible outcome:** Found item cards now show a Bronze, Silver, or Gold badge next to the finder's contact info based on their credit score, and found items are sorted so high-reputation finders appear first.


🔁 Star Traders - Smart Referral Boost Logic (Option 2 Implementation)

1. Basic Plan Logic:
   - User buys a plan of minimum $100.
   - Gets 1% daily return (Mon–Fri).
   - Return continues until investment doubles (e.g., $100 → $200 over approx. 200 days).

2. Referral Boost System:
   - If user refers 2 direct members within 24 hours of plan purchase:
     - Plan validity extends to 300 days.
     - Return continues up to 3x (e.g., $100 → $300).
   - If not, default return ends after doubling (e.g., $100 → $200).

3. Backend Logic:
   - Store 'purchaseTime' when user buys a plan.
   - Start a 24-hour countdown (boost window).
   - Check if 2 direct referrals joined within the countdown.
     - If yes, set planDuration = 300.
     - Else, plan ends at 2x return (based on actual received income).

4. Dashboard Display:
   - ⏳ Countdown Timer: "Time Left to Boost Plan: 23:59:12"
   - Status Message:
     - 🔵 Boost Not Activated – Invite 2 Referrals in 24h
     - 🟢 Boost Activated – You're Earning 300 Days Returns
   - Daily income summary, total earned, and remaining days.

This logic will be implemented in backend income calculation and shown dynamically on frontend dashboard.


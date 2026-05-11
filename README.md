# Rousix Surplus Ownership Planner

A static GitHub Pages prototype that explains surplus-based planning in simple language.

## Pages

- `index.html` — landing page
- `planner.html` — interactive planner with compare options
- `roadmap.html` — plain-English roadmap explanation
- `get-started.html` — activation and onboarding concept
- `styles.css` — design
- `app.js` — calculations and local browser storage

## What changed in this complete version

- Removed Planning Pace.
- Uses 24, 30, and 36 month timelines.
- Defaults to 36 months.
- Uses simple labels: Goal Type, Price, Starting Contribution, Monthly Contribution, Planning Timeline.
- Adds a $1 activation placeholder.
- Uses $5 starting contribution and $1 monthly contribution as absolute minimums.
- Adds a goal-specific suggested starting point using `price / 60`.
- Accounts for suggested infrastructure cost first.
- Shows the remaining plan base after infrastructure.
- Shows 5x and 10x hypothetical scenario math.
- Adds Compare Options that update automatically.

## Payment note

The payment section is not connected to a real payment processor. A live version should use a secure checkout link from a payment provider such as Stripe Payment Links or PayPal Payment Links.

Do not collect credit-card information directly on a static GitHub Pages site.

## Disclaimer

This prototype does not provide financial, investment, tax, legal, credit, lending, mining, staking, or accounting advice.

It does not guarantee profit, returns, appreciation, liquidity, financing approval, payment approval, asset purchase, or ownership.

Hypothetical 5x, 10x, 15x, and 40x examples are scenario examples only. They are not promises, forecasts, guarantees, or expected outcomes.

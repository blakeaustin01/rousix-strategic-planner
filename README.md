# Rousix Goal Pathway Planner

This is a static GitHub Pages prototype for a Rousix planning tool.

## What it does

A visitor enters:

- Goal type
- Goal name
- Price
- Starting contribution
- Monthly contribution
- Planning timeline
- Illustration model
- Infrastructure tier

The planner shows:

- Direct-capital target
- Suggested starting point
- Suggested monthly path
- Infrastructure suggestion
- Infrastructure cost handling
- Remaining goal-path gap
- Plain-English summary
- Compare options
- Top-to-bottom roadmap
- Copy summary
- Print roadmap
- Hosted payment link button placeholder

## Payment handling

This static site does not collect card data.

For a live version, use a secure hosted checkout tool such as Stripe Payment Links or Stripe Checkout.

The `app.js` file contains this placeholder:

```javascript
const STRIPE_START_LINK = "https://buy.stripe.com/REPLACE_WITH_YOUR_1_DOLLAR_VERIFICATION_LINK";

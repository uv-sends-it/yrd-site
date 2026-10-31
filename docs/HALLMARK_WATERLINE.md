# YRD Waterline — Hallmark redesign decision

Fresh branch from main, independent of PR #2 and PR #3. Direction: **Waterline**, a photographic waterfront editorial treatment in deep river blue with the existing YRD red for conversion actions and sparing golden-sun accents for small punctuation and location markers.

Hallmark redesign priorities: preserve actual club photography, logo, factual names, contact email, Dragon Pass registration endpoint and TeamApp source-of-truth; avoid fake stats/testimonials, generic three-card hero layouts, scrolling decoration and autoplay. Sharp visual hierarchy, visible focus and responsive typography, with full factual access when scripting is off.

Routes retained: home, join, about, gallery, newsletter and come-and-try redirect. Keep the page's actions and the external registration handoff. Existing content and committee/coaches section remain source-controlled.

Security: source-level review in docs/SECURITY_REVIEW_PR4.md, with clear unverified items. CSP is a starting point and should be validated in a real browser. Production website remains unchanged until merge.

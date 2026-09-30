# YRD Design Context

This is the durable design contract for Yarra River Dragons. Future human or AI edits should
start here before changing the visual system.

## Product goal

The public site has one primary job: help a prospective paddler understand the club quickly
and make trying a session feel easy. Existing members should still be able to reach schedules,
Team App, newsletters and club information without the site becoming a dashboard.

## Brand character

- Energetic, welcoming, crew-oriented and unmistakably tied to paddling on the Yarra.
- Photography is the strongest visual asset. Keep real club photography prominent.
- Club red is the action/accent colour, not a full-page background treatment.
- Use the warm light canvas as the default. Do not reintroduce a dark theme unless explicitly requested.
- DM Sans carries the interface. Caveat is a single expressive accent, not a body font.
- Repeated red lines, stroke/readout details and the "crew line" journey provide the club-specific motif.
- Avoid generic SaaS glassmorphism, dashboard density, random gradients or excessive cards.

## Information hierarchy

1. What is this club?
2. Can someone like me try it?
3. What happens at my first session?
4. When and where do you train?
5. What is the one next action?

Keep one dominant call to action: trying dragon boating / getting a Dragon Pass.
Secondary actions must remain visually quieter.

## Components

- **Hero:** real photography, dark image overlay for legibility, left red crew line, one clear CTA.
- **Cards/readouts:** white surface, restrained shadow, thin border and small red signal.
- **Dividers:** red pulse/crew-line motif; do not replace with decorative illustration.
- **Buttons:** at least 48px high. Primary uses dark club red with white text.
- **Mobile join CTA:** appears only after the hero leaves the viewport so it supports rather than competes.
- **Instagram gallery:** intentionally retained as the live gallery. Do not replace with a native grid unless explicitly requested.
- **Calendar:** the public site must use only Team App public calendar endpoints. Never publish a member URL containing `secret=`.

## Motion

Motion should explain state or add a restrained sense of energy.

- Keep reveal motion subtle.
- Respect `prefers-reduced-motion`.
- Never require animation or gesture to understand or operate the site.
- Do not add an animation dependency unless CSS can no longer express the required behaviour cleanly.

## Accessibility

- Minimum touch target: 44px; aim for 48px.
- Preserve visible focus states.
- Mobile navigation must support keyboard activation, Escape to close and focus return.
- Prefer native HTML semantics before ARIA.
- Keep text contrast at WCAG AA or better.
- Test responsive layouts for horizontal overflow.

## Responsive behaviour

- Design mobile-first around one-column reading and one obvious action.
- Hero CTAs stack on small screens.
- First-session journey becomes two columns, then one column.
- Tables may scroll inside their own container; the page itself should not scroll horizontally.
- Preserve safe-area spacing for the fixed mobile CTA.

## Testing

Playwright covers the main visitor journeys, mobile navigation, responsive overflow and the
calendar/Dragon Pass links. A cached screenshot baseline in GitHub Actions provides visual
regression checking without committing generated PNGs to the repository.

When a visual redesign is intentional, review it first, then bump the visual-baseline cache
version in `.github/workflows/ui-tests.yml` so CI establishes a new baseline.

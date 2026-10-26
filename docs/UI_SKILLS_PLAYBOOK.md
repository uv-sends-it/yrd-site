# UI skills evaluation — Yarra River Dragons

Reviewed 26 October 2026 against the **25 Skills entries** in [Awesome AI Tools for UI](https://github.com/maxbogo/awesome-ai-tools-for-ui). This covers the skills list, not the separate apps, MCP, design tools and resources categories. This is a source review and project-local adoption guide, not a claim that every external skill was installed or tested.

The site's existing [DESIGN.md](../DESIGN.md) wins when guidance conflicts. Retain Eleventy/Nunjucks, plain CSS, club photography, YRD red, warm light canvas, DM Sans/Caveat, and a simple Dragon Pass journey. Do not apply 25 competing themes.

| Skill | Status | YRD application |
| --- | --- | --- |
| Impeccable | Adopt | Simplify visual hierarchy; remove distractions |
| UserInterface.wiki Skill | Adopt | Review interaction timing, touch targets and accessibility |
| UI UX Pro Max Skill | Borrow | Cross-check type and spacing against existing tokens |
| Anthropic Frontend Design Skill | Adopt | Use real paddling photos and Yarra-specific visual cues |
| Make Interfaces Feel Better | Adopt | Hit areas, optical alignment and restrained motion |
| shadcn/ui Skills | Skip | React/shadcn stack is unnecessary for Eleventy |
| Web Design Guidelines Skill | Adopt | Semantic structure, focus, form and responsive audits |
| Emil Kowalski Skills | Adopt | Mobile-native touch/safe-area polish |
| Unslop Skill | Adopt | Remove placeholders, jargon and generic copy |
| Refactoring UI Skill | Adopt | Consistent spacing, clear type hierarchy |
| Taste Skill | Borrow | Check visual coherence; avoid templated layouts |
| Designer Skills Collection | Adopt | Inclusive design and newcomer task testing |
| TypeUI Design Skills | Later | Alternative prototypes for specific future sections |
| YC Web Design Strategy Skill | Adopt | Five-second clarity and focused registration CTA |
| Swiss Design System | Borrow | Typographic discipline, grids, whitespace |
| Bencium Marketplace | Later | Selected design audit and typography tools only |
| Three.js Skills | Skip | No need for 3D on a lightweight club site |
| Awesome DESIGN.md | Adopt | Treat DESIGN.md as the project’s visual contract |
| StyleSeed | Adopt | Keep decisions and design checks repeatable |
| Claude Code Design Review Workflow | Adopt | Test changed UI through Playwright CI |
| Huashu Design | Later | Campaign-specific visual concepts |
| Nothing Design Skill | Borrow | Use its simplify-first hierarchy, not industrial style |
| Hallmark | Adopt | Truthful content, accessible presentation and no fake data |
| Material Design 3 Skill | Borrow | Responsive component and touch-target principles |
| Scandinavian Design Skill | Borrow | Comprehension-first layout, not a monochrome rebrand |

## Implemented first pass

- Replace a randomly changing fake 'current stroke rate' with an accurate statement welcoming first-time paddlers.
- Remove placeholder site-description and About-page copy.
- Give the 'Who is it for?' section a clearer editorial layout and simpler, non-interactive signposts.
- Improve chat quick-action and mobile navigation hit areas; refine heading rhythm and anchor scrolling.
- Remove the decorative moving ticker from the page.
- Keep the existing published site untouched until the branch is reviewed and merged.

## Design QA criteria

1. The first screen explains dragon boating and offers one obvious 'come and try' path.
2. The visitor can locate first-session arrival instructions, schedule and directions without guesswork.
3. All genders, abilities, backgrounds and newcomers are explicitly welcome. Avoid promising unsupported accommodations.
4. Check at 390px, 768px and 1280px; no horizontal overflow, clipping, or competing CTAs.
5. Keyboard, focus, Escape to close, mobile targets, contrast, reduced motion and safe-area spacing work.
6. Any metric, session time or testimonial comes from club-reviewed facts. No placeholders or simulated live data.
7. Run npm build, Playwright interactions and visual snapshots. Review a real browser rendering; CI alone is not a usability study.
8. Test the joining journey with actual first-time visitors before claiming an improvement in conversion.

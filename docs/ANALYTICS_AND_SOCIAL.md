# Visitor journey, Ask YRD and social distribution

## What is implemented

### Visitor journey analytics

The site is wired for Umami, but analytics remains off until a website ID is supplied in
`content/site.json`.

Umami is used because the site needs lightweight acquisition + behaviour data rather than a
marketing stack. Page views provide the path through the site. The additional events capture:

- `page_engaged` after 15 seconds.
- `scroll_depth_reached` at 25%, 50%, 75% and 90%.
- `page_left` with the deepest tracked scroll point.
- `join_info_clicked`.
- `dragon_pass_clicked`.
- `calendar_subscribed`.
- `teamapp_clicked`.
- `instagram_clicked`.
- `chat_opened`, `chat_question_asked` and `chat_answered`.
- `contact_started`, `contact_submitted` and `contact_failed`.

Raw chatbot questions, names, emails and contact messages are deliberately not sent to analytics.

### Recommended Umami reports

Build these after data starts arriving:

1. **New paddler funnel:** Home → Join → Dragon Pass click.
2. **Question-assisted funnel:** Home/Join → chat opened → Dragon Pass click or contact submitted.
3. **Drop-off journey:** Start at Home and explore the next 3–5 steps. Compare users who reach
   25% versus 75% scroll depth before ending their session.
4. **Social acquisition:** Filter by `utm_source=instagram`, `facebook` or `linkedin`, then
   compare Join and Dragon Pass conversion.
5. **Friction topics:** Break down `chat_question_asked.intent` to see whether swimming, signup,
   location, cost, schedule or another concern is blocking conversion.

The first question should be *where* people leave. Causes are hypotheses until supported by
behaviour: low scroll depth suggests the page fails early; Join views without Dragon Pass clicks
suggest registration friction; repeated chat/contact around one intent suggests missing or unclear
content.

Do not enable session replay by default. If journeys show a persistent unexplained problem,
consider a short, reviewed replay/heatmap study and keep chat/contact inputs excluded.

## Ask YRD

Common newcomer questions are answered immediately from `src/assets/assistant.json`. This is
the authoritative public FAQ layer.

If no FAQ match is strong enough, Ask YRD can use Llama 3.2 1B Instruct q4f16 locally in
WebGPU-capable browsers. The model is lazy-loaded and receives only the current question plus
the reviewed YRD facts. Common FAQ answers never wait for the model. If local inference is
unavailable or cannot answer from those facts, the assistant uses the minimal contact fallback.

The contact form contains only name, email and query/feedback. It posts through FormSubmit to
`admin@yarrariverdragons.com.au`. FormSubmit requires the club to confirm that address after
the first submission before delivery becomes active.

## Social distribution

The repository has a publish-once handoff in `.github/workflows/social-publish.yml`.

It intentionally does **not** auto-post every code or design change. Social promotion should
happen for content worth promoting:

- A new file in `content/newsletters/` is detected automatically.
- Other items use a small manifest in `content/social/*.json`.

Example:

```json
{
  "kind": "video",
  "title": "Hit-pause drill",
  "caption": "Quick technique refresher from training on the Yarra.",
  "url": "/join/",
  "media_url": "https://example.com/yrd/hit-pause-drill.mp4",
  "campaign": "hit-pause-drill",
  "publish": true
}
```

The GitHub Action creates platform-specific tracked links and sends a single JSON payload to an
Activepieces webhook. The payload always sets `approval_required: true`.

### Activepieces flow

1. Create a Webhook trigger and copy its URL into the GitHub repository secret
   `ACTIVEPIECES_SOCIAL_WEBHOOK_URL`.
2. Reject payloads with no `content`.
3. Turn each item into platform-specific copy.
4. Pause for a committee/member approval.
5. Branch to the connected channels:
   - Instagram for Business → Upload Photo / Upload Reel / Publish Story or Carousel.
   - Facebook Pages → Create Page Post / Photo / Video.
   - LinkedIn → Create Company Update if YRD wants LinkedIn distribution.
6. Use the supplied `tracked_links.<platform>` URL, not the untagged link.
7. Log success/failure. Failed channels should not block successful ones.

For Damo's videos, keep the large media in the existing media/social storage rather than Git.
Add a small `content/social/*.json` manifest that points at the final public media URL. This
keeps the repository light and creates one approval point for all channels.

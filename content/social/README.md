# Social promotion manifests

Add one JSON file per promotable update. The file itself is the explicit signal that an update
is worth sharing; ordinary code/design commits are never posted automatically.

Required: `title`.

Useful fields:

- `kind`: `video`, `event`, `website_update`, `story`, etc.
- `caption`: ready-to-use base copy.
- `caption_hint`: guidance when the automation should draft platform-specific copy.
- `url`: website destination.
- `media_url`: public image/video URL for social upload.
- `campaign`: stable UTM campaign slug.
- `publish`: set false to keep a draft manifest out of automation.

The Activepieces workflow should always require a human approval before publishing.

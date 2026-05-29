# API

Base URL: `http://localhost:3000`

## List events

`GET /api/events`

Optional query params:

- `q` - free text search (title/summary/tags)
- `tag` - tag filter (substring match)
- `venue` - `ONLINE` | `IN_PERSON` | `HYBRID`

## RSVP to an event

`POST /api/events/:slug/rsvps`

Example:

```bash
curl -X POST http://localhost:3000/api/events/tiesverse-product-webinar-june-2026/rsvps ^
  -H "content-type: application/json" ^
  -d "{\"structured\":{\"fullName\":\"You\",\"email\":\"you@example.com\",\"whatsapp\":\"+919999999999\",\"role\":\"Developer\",\"org\":\"Tiesverse\",\"country\":\"India\",\"city\":\"Bengaluru\",\"heardFrom\":\"Instagram\",\"hopeToLearn\":\"How to build better.\"},\"answers\":{}}"
```

## RSVP form definition

`GET /api/events/:slug/form`

Returns the RSVP questions for the event (including admin-added custom fields).

## Admin (local only)

These endpoints are protected by the `ADMIN_PASSWORD` cookie created by `POST /api/admin/login`.

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/events`
- `POST /api/admin/events`
- `GET /api/admin/events/:id/questions`
- `POST /api/admin/events/:id/questions`
- `GET /api/admin/events/:id/rsvps`

# Offline Tickets Pipeline (M3)

This document explains how to export RSVPs to CSV and import offline ticket image mappings for an event. All endpoints are admin-only and CSRF-protected.

## Endpoints

- GET `/api/admin/events/[slug]/rsvps/export`
  - Query params (optional):
    - `q` — search term (name/email/affiliation + profile links)
    - `status` — e.g. `approved|pending|invited|declined|waitlist`
    - `ids` — comma-separated RSVP IDs to export a specific selection
  - Returns: CSV with headers
    `id,name,email,affiliation,status,ticketNumber,qrCode,checkedInAt,createdAt,accountId,linkedin,twitter,github,website,company,title`
  - Example:
    ```bash
    curl -sS -H "Cookie: csrf-token=YOUR_TOKEN" \
      "http://localhost:3000/api/admin/events/my-event/rsvps/export?status=approved" -o rsvps.csv
    ```

- POST `/api/admin/events/[slug]/rsvps/import-ticket-images`
  - Content-Type: `text/csv` or JSON array
  - CSV columns supported (case-insensitive, aliases in parentheses):
    - `id`
    - `ticketNumber` (`ticket_number`, `ticket`)
    - `qrCode` (`qr_code`, `qr`)
    - `email`
  - Matching priority: `id` → `ticketNumber` → `email` (scoped to the event)
  - Each provided field is sanitized:
    - `ticketNumber`: uppercase, `[A-Z0-9-]`, max 64
    - `qrCode`: max length 2000
  - Limits: max 1000 rows per request
  - Response: `{ ok, updated, total, results: [ { key, updated, reason? } ] }`
  - Example (CSV):
    ```bash
    curl -sS -X POST \
      -H "Content-Type: text/csv" \
      -H "x-csrf-token: YOUR_TOKEN" \
      --data-binary @docs/sample_ticket_import.csv \
      "http://localhost:3000/api/admin/events/my-event/rsvps/import-ticket-images"
    ```
  - Example (JSON):
    ```bash
    curl -sS -X POST \
      -H "Content-Type: application/json" \
      -H "x-csrf-token: YOUR_TOKEN" \
      -d '[ {"id":"<rsvp-id>", "ticketNumber":"ABC-001", "qrCode":"https://.../ABC-001.png"} ]' \
      "http://localhost:3000/api/admin/events/my-event/rsvps/import-ticket-images"
    ```

## Admin UI

At `admin/events/[slug]`:

- Use the Filters section to refine RSVPs
- Click:
  - "Export Current Filter": downloads filtered CSV
  - "Export Selected": appears after selecting rows; downloads those rows
  - "Import Tickets CSV": opens a dialog to upload a CSV and updates ticket numbers/QR URLs

## Notes

- No server-side ticket image generation. You host or generate images offline, then import their URLs.
- All changes are audited with action `admin.rsvps.importTickets`.
- Capacity is enforced only in selection (approvals), not during import.

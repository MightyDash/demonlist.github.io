# Moik's Demon List

This is a static website that displays your Geometry Dash demon completions in
a ranked Pointercrate-inspired layout.

## How it works

1. Your Google Sheet stays the source of truth.
2. Your existing Apps Script should expose the list as JSON.
3. This website fetches that JSON and renders the list.

## Expected JSON shape

Your Apps Script endpoint should return something like this:

```json
{
  "meta": {
    "title": "2026 List",
    "totalAttempts": 109742,
    "updatedAt": "2026-04-17T14:30:00Z"
  },
  "demons": [
    {
      "placement": 1,
      "name": "Bloodbath",
      "creators": "Riot & more",
      "id": 10565740,
      "difficulty": "Extreme Demon",
      "attempts": 20226,
      "year": 2026,
      "video": "Recorded",
      "tier": 24.0,
      "tierChange": 0,
      "status": "COMPLETED"
    }
  ]
}
```

## Hook it up

1. Open `app.js`.
2. Replace `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with your deployed Apps
   Script web app URL.
3. Make sure the Apps Script response allows public `GET` access if you want the
   website to load for everyone.

## Notes

- If the endpoint is not configured yet, the site falls back to mock data so you
  can still preview the design.

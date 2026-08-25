# HealthyTogether

A mobile-first nutrition and health tracking app designed for community wellness support.

## Features

- Daily calorie, protein, hydration, movement, and sleep tracking
- Quick logging for meals and physical activity
- Water intake tracking with clear progress indicators
- Basic health metric updates for weight, steps, sleep, mood, and blood pressure
- Wellness habit checklist and personalized health insights
- Community-level wellness snapshot for shared progress awareness
- Accessible, clean interface designed for users with different technical backgrounds
- Optional Supabase-backed authentication and per-user persistence

## Run locally

Open the file directly in a browser:

- `index.html`

Or serve it with a local web server:

```bash
cd c:/Users/kadam/Desktop/MYCEP
python -m http.server 8000
```

Then open:

- http://localhost:8000

## Database setup with Supabase

This app is built to support a real production database through Supabase.

1. Create a new Supabase project.
2. Open the project settings and copy the Project URL and anonymous key.
3. Update `config.js` with those values.
4. Run the SQL in `schema.sql` inside the Supabase SQL editor.
5. Set `supabase.enabled` to `true` in `config.js`.

Example configuration:

```js
window.HEALTHYTOGETHER_CONFIG = {
  supabase: {
    enabled: true,
    url: 'https://xyzcompany.supabase.co',
    anonKey: 'your-anon-key'
  }
};
```

## Notes

- Without Supabase enabled, the app continues to work using browser storage.
- With Supabase enabled, each logged-in user stores their own data separately under their profile.
- Community insights can be implemented from anonymized aggregate data later.

## Files

- `index.html` — app structure and layout
- `styles.css` — responsive styling and mobile-first design
- `app.js` — state management, tracking logic, Supabase-ready persistence, and auth flow
- `config.js` — Supabase configuration
- `schema.sql` — database schema for profiles and security policies

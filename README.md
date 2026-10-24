# ◈ ResQAI — 3D Historical Fire Incident Intelligence Platform

### A shared picture. Grounded in history.

**PUBLIC SAN FRANCISCO FIRE RECORDS · READ-ONLY ARCHIVE · NON-OPERATIONAL DEMONSTRATION**

![React](https://img.shields.io/badge/React-18-149eca?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Read--Only-3ecf8e?style=flat-square&logo=supabase&logoColor=white)
![OpenStreetMap](https://img.shields.io/badge/Maps-OpenStreetMap-7ebc6f?style=flat-square&logo=openstreetmap&logoColor=white)
![Design](https://img.shields.io/badge/UI-3D%20Glassmorphism-8b5cf6?style=flat-square)
![Status](https://img.shields.io/badge/Status-Development-orange?style=flat-square)

---

## ◈ Project Vision

**ResQAI is a modern, responsive historical fire-incident data explorer designed with a premium 3D-inspired interface.**

The platform provides an authenticated, read-only experience for exploring a bounded archive of publicly released San Francisco Fire Department incident records. It combines historical data, interactive maps, descriptive analytics, and optional AI-generated historical summaries in a single application.

The interface follows a futuristic visual direction inspired by three-dimensional glass panels, layered surfaces, subtle neon illumination, depth-aware cards, and professional command-center dashboards.

> **Important:** ResQAI is a historical data visualization project, not an emergency-response system. It is not connected to live emergency services or operational dispatch infrastructure.

### Core Principles

- **Historical, not live:** Explore eligible closed incidents from public records.
- **Read-only archive:** Authenticated users can browse historical records but cannot modify incident data.
- **Real data, honest states:** Display loading, error, empty, and configuration states without silently substituting fictional incidents.
- **AI-assisted descriptions:** Optional, user-initiated descriptions of historical trends and individual closed records.
- **Security by design:** Supabase authentication, row-level security, restricted database permissions, and server-side secrets.
- **Professional 3D experience:** Add visual depth without sacrificing usability, accessibility, performance, or clarity.

---

## ◈ 3D Design System

The visual design aims to make ResQAI feel like a premium analytics platform while keeping historical information easy to understand.

### Visual Direction

| Design element | Implementation direction |
|---|---|
| Overall theme | Dark, futuristic, professional |
| Background | Deep navy with subtle gradients |
| Glass panels | Translucent surfaces, soft borders, restrained blur |
| Accent colors | Electric cyan, cool blue, violet |
| Cards | Layered surfaces, gentle shadows, subtle hover depth |
| Navigation | Minimal sidebar with clear active states |
| Maps | Interactive Leaflet map with OpenStreetMap attribution |
| Data visualization | Clean charts with clear labels and accessible contrast |
| Motion | Subtle transitions and restrained perspective effects |
| Typography | Modern, readable sans-serif typography |
| Responsive layout | Desktop, tablet, and mobile support |

### Recommended Color Palette

| Purpose | Color |
|---|---|
| Main background | `#070B18` |
| Secondary background | `#0D1426` |
| Glass surface | `rgba(20, 32, 56, 0.72)` |
| Primary accent | `#22D3EE` |
| Secondary accent | `#818CF8` |
| Main text | `#F1F5F9` |
| Muted text | `#94A3B8` |
| Warning/error states | Accessible amber and red tones |

### Recommended 3D Effects

- Layered glassmorphism cards with subtle transparency.
- Gentle card elevation on hover.
- Soft cyan edge illumination for selected elements.
- Perspective transforms used sparingly.
- Animated loading indicators for genuine loading states.
- Smooth sidebar and page transitions.
- Depth-aware buttons with clear hover, focus, and pressed states.
- Respect for the user's reduced-motion preference.

**Design objective:** A polished, high-tech 3D-inspired interface that remains a practical data explorer—not a simulated live emergency control room.

*Note: These are the intended design guidelines. The actual 3D effects must be implemented in the React components and styles.*

---

## ◈ Project Overview

ResQAI uses a React and TypeScript frontend, Supabase for authentication and database access, and Leaflet with OpenStreetMap tiles for geographic visualization.

A Node.js import script retrieves eligible historical incident records from the San Francisco Open Data platform and writes validated records to Supabase.

The browser accesses the archive through the authenticated user's session and a browser-safe Supabase publishable key. Database row-level security restricts access to eligible historical rows.

The optional AI feature calls a Supabase Edge Function, which validates the authenticated user, applies a per-user request limit, reads eligible data, and requests historical descriptions from Google's Gemini API.

### Public Data Source

- **Publisher:** [San Francisco Open Data](https://data.sfgov.org/d/wr8u-xric)
- **Dataset:** San Francisco Fire Incidents
- **API endpoint:** `https://data.sfgov.org/resource/wr8u-xric.json`
- **Supabase archive table:** `public.sf_fire_incidents`
- **Map provider:** OpenStreetMap
- **Map renderer:** Leaflet and React Leaflet

The importer is bounded to eligible closed incidents approximately 30–365 days old, with a maximum of 500 records per run. Actual results depend on source availability and the import configuration.

The browser loads up to 500 eligible archive rows. Imports are manual; continuous synchronization is not configured.

---

## ◈ Key Features

### 1. Historical Incident Archive

- Browse publicly released historical fire incident records.
- Search and filter available records.
- Paginate through the archive.
- Open source-linked incident detail pages.
- Display appropriate loading, error, unconfigured, and empty states.
- Restrict browser access to read-only archive operations.

### 2. Interactive Historical Map

- Explore source-published historical incident coordinates.
- Render an OpenStreetMap basemap using Leaflet.
- Display incident markers and associated record details.
- Show visible map attribution.
- Allow users to explicitly enable browser geolocation.
- Keep the user's temporary location in page memory rather than persisting it.

The map is for historical visualization only and must not be used for emergency navigation.

### 3. Descriptive Analytics

- Calculate counts from the records loaded into the archive.
- Present available historical classifications and distributions.
- Display aggregate monthly, neighborhood, and situation counts when supported by the data.
- Avoid inventing response-time, readiness, or operational-performance metrics.
- Clearly distinguish descriptive statistics from predictions.

### 4. Optional Historical AI

- Generate descriptions of aggregate historical trends.
- Summarize one selected closed public record.
- Use a server-side Gemini API key.
- Validate authenticated requests through a Supabase Edge Function.
- Enforce a database-backed limit of five requests per user per minute.
- Request `store: false` from the provider.

AI summaries are informational and may be inaccurate. They are not predictions, recommendations for emergency response, or operational decisions.

### 5. Authentication and User Profiles

- Supabase email/password authentication.
- Public self-registration.
- Email confirmation and password recovery.
- Protected archive routes.
- Persistent browser authentication sessions.
- Database-generated public User IDs in the `RSQ-XXXXXXXX` format.
- Profile display-name editing.
- Row-level security for individual profile records.

The public User ID is an identifier, not an authentication credential.

### 6. Separate Training Experience

Fictional training pages demonstrate interface concepts for report intake, manual review, dispatch-style layouts, team profiles, settings, and activity.

Training data is local to browser-session state. It is not connected to emergency services, is not persisted as public incident data, and does not use an AI dispatch model.

### 7. Responsive and Accessible UI

- Desktop, tablet, and mobile layouts.
- Keyboard-friendly forms and controls.
- Clear validation and error messages.
- Accessible contrast and focus states.
- Reduced-motion support.
- Print styles.
- Responsive 3D-inspired cards and navigation.

---

## ◈ Application Routes

| Route | Description |
|---|---|
| `/login` | Sign in and password recovery |
| `/register` | Create an account |
| `/auth/callback` | Process supported authentication callbacks |
| `/account` | View public User ID and edit display name |
| `/overview` | Historical archive overview |
| `/incidents` | Search and filter public records |
| `/incidents/:id` | Historical record details |
| `/map` | Interactive historical incident map |
| `/analytics` | Descriptive archive analytics |
| `/sources` | Data provenance, configuration, and safety information |
| `/training/report` | Fictional report-intake exercise |
| `/training/incidents/:id` | Fictional training record |
| `/training/review` | Manual-review interface demonstration |
| `/training/dispatch` | Dispatch-interface training demonstration |
| `/training/settings` | Example-only settings |
| `/training/team` | Example-only team profiles |
| `/training/activity` | Example-only activity |

Legacy `/review`, `/dispatch`, `/settings`, `/team`, and `/activity` routes redirect to their clearly labeled training equivalents.

Protected archive routes require authentication and valid configuration.

---

## ◈ System Architecture

```text
           SAN FRANCISCO OPEN DATA
                     |
                     | Bounded manual import
                     v
          +-------------------------+
          | Node.js Import Script   |
          | Validate and limit data |
          +------------+------------+
                       |
                       v
          +-------------------------+
          | Supabase Database       |
          | sf_fire_incidents       |
          | Row-level security       |
          +------------+------------+
                       |
                       | Authenticated SELECT
                       v
          +-------------------------+
          | React + TypeScript      |
          | Historical Archive UI   |
          +------------+------------+
                       |
             +---------+---------+
             |                   |
             v                   v
     +---------------+   +----------------+
     | Leaflet Map   |   | Analytics UI   |
     | OpenStreetMap |   | Historical     |
     +---------------+   | Statistics     |
                         +----------------+

     Supabase Auth ------> Protected Routes
            |
            v
     User-Owned Profile

     Optional Historical AI:
     Browser -> Authenticated Edge Function
             -> Eligible Historical Data
             -> Gemini API

     Separate Training Screens:
     Fictional Local Data Only
```

### Architecture Components

| Component | Responsibility |
|---|---|
| `scripts/sync-sf-public-fire-data.mjs` | Fetches, validates, and imports bounded historical records |
| `supabase/migrations/` | Defines archive, profile, and optional AI rate-limit schemas |
| `supabase/functions/historical-ai-analysis/` | Authenticates requests, enforces quotas, and calls Gemini |
| `src/dataContext.tsx` | Loads and manages historical archive state |
| `src/lib/supabase.ts` | Configures the browser-safe Supabase client |
| `src/components/HistoryMap.tsx` | Displays historical coordinates using Leaflet |
| `src/components/PublicFeedStatus.tsx` | Displays archive configuration and connection status |
| `src/pages/` | Contains archive, account, and training pages |
| `src/state.tsx` | Manages fictional training interactions |
| `src/data.ts` | Provides fictional training records |
| `src/types.ts` | Defines training-domain types |
| `src/App.tsx` | Configures routes and application providers |
| `src/index.css` | Provides global styling and responsive layouts |

---

## ◈ Technology Stack

| Technology | Purpose |
|---|---|
| React 18 | Component-based frontend |
| TypeScript 5 | Type safety |
| Vite 6 | Development server and production bundler |
| React Router 7 | Client-side routing |
| Supabase Auth | Authentication and sessions |
| Supabase Database | Historical archive and user profiles |
| Supabase Edge Functions | Optional server-side AI integration |
| Gemini API | Historical descriptions |
| Leaflet | Interactive map rendering |
| React Leaflet | React integration for Leaflet |
| OpenStreetMap | Community map tiles |
| Tailwind CSS 3 | Utility-based styling |
| Lucide React | Interface icons |
| CSS transforms and transitions | 3D-inspired depth and motion |

---

## ◈ Requirements

- Node.js **22.9 or newer**.
- npm compatible with the installed Node.js release.
- Git.
- A Supabase project explicitly verified as a separate non-production staging/test environment.
- Network access for remote authentication, data imports, map tiles, and optional AI requests.

Authentication remains disabled until the required browser-safe Supabase configuration is provided.

---

## ◈ Installation Guide

### Step 1 — Clone the repository

```bash
git clone https://github.com/sumanth-bandla/ResQAI.git
cd ResQAI
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Verify the Supabase environment

Before applying database migrations or importing data, verify in the Supabase dashboard that the selected project is a separate staging/test environment.

A project URL in `.env.example` is only a configuration example; it does not establish that the project is safe to modify.

**Do not apply the migrations or run the importer against production without a separate, explicitly approved review.**

### Step 4 — Configure environment variables

Copy `.env.example` to `.env.local` and replace the placeholders with the correct values from your verified Supabase project.

```dotenv
# Browser-safe configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY

# Server-side importer configuration
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Optional public-data API token
SF_OPEN_DATA_APP_TOKEN=
```

Important security rules:

- Never commit `.env.local`.
- Never put a service-role key in a `VITE_` variable.
- Never expose privileged keys in browser code, screenshots, GitHub issues, or chat.
- Restart Vite after changing environment variables.
- Use the publishable key for browser access and enforce database permissions through Supabase RLS.

### Step 5 — Configure Supabase authentication

In the verified project's dashboard:

1. Enable the Email authentication provider.
2. Configure email/password sign-in and keep email confirmation enabled.
3. Set the appropriate Site URL.
4. Add the exact callback and recovery URLs to Authentication → URL Configuration.
5. Configure email delivery, password policies, rate limits, and abuse protections.
6. Confirm that the profile trigger and required database migrations are installed.

For local development on port `5173`, allow the relevant callback paths for the hostname you actually use:

```text
http://localhost:5173/auth/callback
http://localhost:5173/login?recovery=1
```

If you use `127.0.0.1`, configure the corresponding URLs separately. Configure equivalent paths for your deployed domain.

Do not add broad production wildcards.

The application distinguishes a submitted authentication request from confirmed email delivery. Supabase and the configured email provider determine actual delivery status.

### Email Delivery Notes

Supabase's built-in email service is intended for low-volume testing and may impose restrictive limits.

For reliable legitimate email delivery:

1. Configure a supported transactional email provider.
2. Verify a sender domain you control.
3. Publish the required SPF and DKIM records and configure DMARC where appropriate.
4. Enter SMTP credentials in the Supabase dashboard, not in frontend code.
5. Send one controlled test to a mailbox you own.
6. Review delivery logs and Supabase rate limits.

Do not repeatedly submit signup or resend requests to bypass rate limits. Server-side limits remain authoritative.

### Step 6 — Apply database migrations

Review the migration files in `supabase/migrations/` and apply the required migrations to the verified staging/test project:

```text
20261024111000_create_public_historical_fire_incidents.sql
20261024193000_create_user_profiles.sql
20261024200500_add_historical_ai_rate_limit.sql
```

The AI rate-limit migration is required only if you enable the optional historical AI feature.

The archive migration grants authenticated browser users read-only access to eligible historical records. The profile migration creates user-owned profiles, generates public IDs, and restricts profile updates. The optional AI migration creates a private request-limit table for the trusted Edge Function.

Review the SQL and verify the target project before execution. Database migrations change the selected database.

### Step 7 — Import historical records

After verifying the project and importer configuration, run:

```bash
npm run data:sync:sf
```

The import script:

- Fetches eligible closed incidents approximately 30–365 days old.
- Caps each import run at 500 records.
- Validates required values and timestamps.
- Rejects invalid coordinates and records outside configured San Francisco bounds.
- Upserts records in batches.
- Keeps the service-role key on the server side.
- Exits with an error if required configuration, source retrieval, or database writes fail.

This operation writes to the configured Supabase database. Verify the destination before running it.

Imports are manual; continuous synchronization is not configured.

### Step 8 — Run the application

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

Build the application:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Available Commands

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Run the configured TypeScript build and create the production bundle |
| `npm run preview` | Preview the production build |
| `npm run data:sync:sf` | Import eligible historical records |
| `npm audit` | Check dependencies for known security advisories |

---

## ◈ Optional Historical AI Configuration

The historical AI feature is optional and disabled until configured.

It supports descriptions of aggregate historical trends and one selected closed record. It must not be used for live emergencies, triage, dispatch, responder safety, or navigation.

### Configuration

1. Review the optional AI rate-limit migration.
2. Apply `supabase/migrations/20261024200500_add_historical_ai_rate_limit.sql` to the verified staging/test database.
3. Deploy the Edge Function from the repository root:

   ```bash
   supabase functions deploy historical-ai-analysis
   ```

4. Create a Gemini API key in Google AI Studio.
5. Store the key only as a Supabase Edge Function secret:

   ```bash
   supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

   Run this command in a secure terminal and replace the placeholder locally. Do not paste the actual key into chat, source code, or Git.

6. Verify that the function has the required Supabase environment variables and that JWT verification remains enabled.
7. Confirm provider quotas and billing settings.
8. Test using the interface's explicit Generate action.

The feature limits requests to five per user per minute.

Trend prompts contain aggregate month, neighborhood, and situation counts. Individual summaries contain the record date and source classifications, excluding record identifiers, addresses, and coordinates.

The function requests `store: false`; provider terms and retention policies still apply. AI output is treated as untrusted text and displayed as plain text.

---

## ◈ Data Sources and Freshness

### San Francisco Fire Incidents

- **Publisher:** [City and County of San Francisco Open Data](https://data.sfgov.org/d/wr8u-xric)
- **API:** [Fire incidents JSON endpoint](https://data.sfgov.org/resource/wr8u-xric.json)
- **Database:** `public.sf_fire_incidents`
- **Access:** Authenticated, read-only browser queries.
- **Age window:** Approximately 30–365 days before an import.
- **Import limit:** 500 records per run.
- **Browser limit:** Up to 500 eligible records.

The application displays the source's published fields and coordinates. Public data can be incomplete, delayed, corrected, or otherwise unsuitable for a particular analysis.

The 30-day delay is a code-level boundary, not a guarantee of privacy, accuracy, completeness, or operational suitability.

### OpenStreetMap

The application uses community map tiles from:

`https://tile.openstreetmap.org`

Attribution must remain visible.

- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
- [OpenStreetMap copyright and attribution](https://www.openstreetmap.org/copyright)

OpenStreetMap community tile infrastructure is best-effort and does not provide an emergency-navigation service or a guaranteed service level.

---

## ◈ Security and Privacy

Security is a core requirement, not a decorative feature.

### Database Access

- Anonymous browser reads and writes to incident records are denied.
- Authenticated users receive read-only access to eligible historical records.
- Row-level security limits which archive rows can be read.
- Profile access is restricted to the matching authenticated user.
- Profile update permissions are limited to the display name.
- Internal Auth UUIDs and public User IDs cannot be changed through the profile form.
- Service-role credentials remain outside the browser.

### Authentication

- Supabase manages account identities and passwords.
- Email confirmation follows project settings.
- Password recovery uses the configured verification flow.
- Public registration creates archive accounts, not agency identities.
- Authentication does not grant emergency-service authorization.

### Browser Geolocation

- Location permission is requested only after an explicit user action.
- The displayed position is temporary page state.
- The application does not continuously watch or persist the location.
- Hiding the location or leaving the page clears the temporary display.

Map tile requests can reveal the approximate map area being viewed to the tile service.

### Historical AI

- API credentials are stored as managed Edge Function secrets.
- Requests require authenticated sessions.
- A database-backed per-user request limit is enforced.
- Only minimized historical data is sent to the AI provider.
- Addresses, coordinates, account information, and record identifiers are excluded from prompts.
- AI-generated descriptions can be incorrect and must not be treated as authoritative.

### Training Data

Training pages use fictional local data and are not connected to the public archive or emergency services.

Never enter real caller, patient, responder, or emergency information into training screens.

---

## ◈ Repository Structure

```text
ResQAI/
├── public/
│   └── Static assets
├── docs/
│   └── screenshots/
├── scripts/
│   └── sync-sf-public-fire-data.mjs
├── src/
│   ├── components/
│   │   ├── HistoryMap.tsx
│   │   └── PublicFeedStatus.tsx
│   ├── pages/
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── data.ts
│   ├── dataContext.tsx
│   ├── state.tsx
│   ├── types.ts
│   └── index.css
├── supabase/
│   ├── functions/
│   │   └── historical-ai-analysis/
│   ├── migrations/
│   └── tests/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── vite.config.ts
```

The exact directory contents may vary with the current repository version.

---

## ◈ Screenshots and Design Reference

The original visual direction references the [ResQAI Figma design](https://www.figma.com/design/RzhtVdD740gAaXoiXnRpT3/Untitled?node-id=3-37442).

Add screenshots captured from the actual running application to `docs/screenshots/`.

Suggested gallery:

<details>
<summary><strong>Sign-in screen</strong></summary>

![ResQAI sign-in screen](./docs/screenshots/archive-entry.png)

</details>

<details>
<summary><strong>Registration screen</strong></summary>

![ResQAI registration screen](./docs/screenshots/registration.png)

</details>

<details>
<summary><strong>Historical overview</strong></summary>

![ResQAI historical overview](./docs/screenshots/historical-overview.png)

</details>

<details>
<summary><strong>Public records</strong></summary>

![ResQAI public incident archive](./docs/screenshots/public-records.png)

</details>

<details>
<summary><strong>Historical map</strong></summary>

![ResQAI historical map](./docs/screenshots/historical-map.png)

</details>

<details>
<summary><strong>Sources and configuration</strong></summary>

![ResQAI sources and setup](./docs/screenshots/sources-and-setup.png)

</details>

These paths are expected repository locations; ensure the corresponding image files exist before publishing. If a screenshot has not yet been captured, add it after the relevant page is implemented.

For the 3D redesign, capture genuine screenshots of the finished interface rather than using mockups as evidence of implemented functionality.

---

## ◈ Validation and Testing

Run the configured production build:

```bash
npm run build
```

Check installed dependencies:

```bash
npm audit
```

The repository does not currently include a dedicated test-runner script.

Existing implementation checks have included browser-intercepted mock authentication responses and SQL assertions documenting expected database permissions. Mock browser tests do not create real accounts or verify actual email delivery.

Before deployment, validate the following in a disposable, verified test environment:

- Sign-in and registration.
- Email confirmation and password recovery.
- Protected route access.
- Profile ownership and display-name updates.
- Archive read-only access.
- Row-level security policies.
- Import validation and failure handling.
- Loading, error, unconfigured, and empty states.
- Map attribution and coordinate rendering.
- AI authentication, rate limits, and failure handling, if enabled.
- Keyboard navigation and reduced-motion behavior.
- Responsive layouts and 3D effect performance.

Do not run database permission tests or destructive test cases against production.

---

## ◈ Future Enhancements

- Complete the 3D-inspired interface redesign across all React pages.
- Introduce reusable glassmorphism and depth-aware components.
- Add restrained perspective interactions and smoother transitions.
- Improve map accessibility with equivalent tabular views.
- Add automated component, route, and importer tests.
- Add visual regression testing for desktop, tablet, and mobile.
- Monitor import age, source schema changes, and failed database writes.
- Add clear source-freshness information.
- Evaluate an appropriate dedicated tile provider for higher-volume use.
- Improve performance on lower-powered mobile devices.
- Review data governance, privacy, and retention before expanding coverage.

Live dispatch, real agency accounts, and operational emergency functionality are not planned for this demonstration without a separate safety, security, governance, accessibility, and human-factors review.

---

## ◈ Contributing

Contributions are welcome when they preserve the project's security and safety boundaries.

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Run the production build.
5. Review database permissions and secret handling if your changes affect the backend.
6. Submit a pull request with a clear explanation and screenshots where relevant.

Do not include API secrets, private credentials, real incident information, or unverified operational claims in contributions.

---

## ◈ License

No software license is currently specified in this repository. All rights remain with the repository owner unless a license is added.

San Francisco public data and OpenStreetMap data and tiles remain subject to their respective terms, attribution, and licensing requirements. The Figma file is a visual design reference, not a software license.

---

<div align="center">

### ◈ RESQAI

**A shared picture. Grounded in history.**

3D-Inspired Interface · Historical Public Data · Read-Only Archive

**NOT CONNECTED TO LIVE EMERGENCY SERVICES · NOT FOR EMERGENCY USE**

</div>

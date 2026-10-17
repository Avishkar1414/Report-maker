# RSSB Kesnand Satsang Report Manager

A small web application for recording and reviewing Satsang reports. It uses a static HTML frontend, an Express API, and MongoDB through Mongoose.

## Requirements

- Node.js 20.19 or newer (required by the installed Mongoose version)
- MongoDB locally or a MongoDB Atlas connection string

## Run locally

```bash
npm install
```

Copy `.env.example` to `.env`, then set `MONGODB_URI` to your database connection string. Start the app with:

```bash
npm run dev
```

Open <http://localhost:3000>. For a production start, use `npm start`.

## Configuration

| Variable | Purpose | Default |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/reports` |
| `PORT` | HTTP port | `3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Web client ID used to verify Google sign-ins | Required for report access |
| `TUNNEL_ALLOWED_EMAIL` | Comma-separated emails allowed to open the internet tunnel; Cloudflare sends one-time codes | Set this in `.env` before `npm run tunnel` |

Keep `.env` out of version control. `.env.example` contains only safe sample configuration.

## Google sign-in setup

Report data is available only after a user signs in with a Google account whose email Google has verified. The server verifies each Google ID token against `GOOGLE_CLIENT_ID` before responding to report requests.

1. In Google Cloud Console, configure the OAuth consent screen and create an OAuth client with application type **Web application**.
2. Add the exact app origin under **Authorized JavaScript origins**. For local use, that is `http://localhost:3000`. For remote use, it must be the stable HTTPS origin you control, such as `https://reports.example.com`.
3. Set the client ID in `.env` as `GOOGLE_CLIENT_ID=...`, then restart the server.

Google does not allow wildcard JavaScript origins. A Cloudflare Quick Tunnel URL changes when restarted and is not a domain you control, so it cannot be a reliable authorized origin for Google sign-in. To let other people sign in remotely without Cloudflare email PINs, configure a stable domain and authorized Google origin first. Until then, keep the existing tunnel email allowlist enabled. Local sign-in can be configured independently with the localhost origin.

The Google ID token is held in the browser session and expires; users may need to sign in again after it expires or the browser tab is closed. No app-specific account allowlist is applied: any verified Google account can access reports once it can sign in on the authorized origin. Sign-in also requires the server to reach Google's public signing-key endpoint.

## Share access from the internet

Start the app with `npm start`, set `TUNNEL_ALLOWED_EMAIL` in `.env` to a comma-separated list of permitted emails, then run `npm run tunnel` in a second terminal. Cloudflare sends a one-time PIN to each allowed email before forwarding visitors to the app. This quick-tunnel setup keeps that PIN gate in addition to Google sign-in. Removing the PIN gate requires configuring an owned stable domain and a Cloudflare tunnel without the Access email gate; a rotating Quick Tunnel URL cannot be used for Google sign-in. Keep the laptop, MongoDB, app, and tunnel online while reports are being submitted.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Check server and database connectivity |
| `GET` | `/api/auth/config` | Read the public Google client ID used by the sign-in page |
| `GET` | `/api/auth/me` | Validate the signed-in Google user (Bearer ID token required) |
| `GET` | `/api/reports` | List reports |
| `GET` | `/api/reports/:id` | Get a report by MongoDB ID |
| `GET` | `/api/reports/date/:date` | Find a report by Satsang date |
| `GET` | `/api/reports/recent/:limit` | List recent reports (limit capped at 100) |
| `GET` | `/api/reports/search?startDate=&endDate=` | Search by date range |
| `POST` | `/api/reports` | Create a report, or update the report for that date |
| `PUT` | `/api/reports/:id` | Update a report by ID |
| `DELETE` | `/api/reports/:id` | Delete a report by ID |

Every report response includes MongoDB's `_id` and a string `id` alias for the frontend.
All `/api/reports` endpoints require a valid, unexpired Google ID token in the `Authorization: Bearer …` header.

## Project layout

```text
public/                 Static frontend
src/
  config/database.js    MongoDB connection and status
  controllers/          Request handlers
  middleware/           Google ID-token verification
  models/Report.js      Mongoose report schema
  routes/reports.js     API route definitions
  utils/reports.js      Input parsing and response serialization
  app.js                Express middleware and route setup
  server.js             Database and HTTP startup
server.js               Application entry point
```

## Deployment

Deploy the repository to a Node.js host that supports environment variables. Configure `MONGODB_URI` and optionally `PORT`, then run `npm start`. Do not commit database credentials or local `.env` files.

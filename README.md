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

Keep `.env` out of version control. `.env.example` contains only safe sample configuration.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Check server and database connectivity |
| `GET` | `/api/reports` | List reports |
| `GET` | `/api/reports/:id` | Get a report by MongoDB ID |
| `GET` | `/api/reports/date/:date` | Find a report by Satsang date |
| `GET` | `/api/reports/recent/:limit` | List recent reports (limit capped at 100) |
| `GET` | `/api/reports/search?startDate=&endDate=` | Search by date range |
| `POST` | `/api/reports` | Create a report, or update the report for that date |
| `PUT` | `/api/reports/:id` | Update a report by ID |
| `DELETE` | `/api/reports/:id` | Delete a report by ID |

Every report response includes MongoDB's `_id` and a string `id` alias for the frontend.

## Project layout

```text
public/                 Static frontend
src/
  config/database.js    MongoDB connection and status
  controllers/          Request handlers
  models/Report.js      Mongoose report schema
  routes/reports.js     API route definitions
  utils/reports.js      Input parsing and response serialization
  app.js                Express middleware and route setup
  server.js             Database and HTTP startup
server.js               Application entry point
```

## Deployment

Deploy the repository to a Node.js host that supports environment variables. Configure `MONGODB_URI` and optionally `PORT`, then run `npm start`. Do not commit database credentials or local `.env` files.

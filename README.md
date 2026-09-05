# RSSB Kesnand Satsang Report Management System

A full-featured report management system built with Node.js, Express, and CockroachDB for managing RSSB Kesnand Satsang reports with CRUD operations, manual entry support, and PDF generation.

## Features

- 📊 **Full Report Form** - Complete Satsang report with all required fields
- 💾 **CockroachDB Storage** - Persistent storage in CockroachDB (Cloud)
- 📅 **Manual Date Entry** - Add past entries with custom dates
- 📋 **Record History** - View, search, edit, and delete past records
- 🖨️ **Print Support** - Direct browser printing
- 📄 **PDF Download** - High-quality PDF generation
- 🔄 **Auto-save** - Updates existing records when date matches
- 🔍 **Search** - Search records by date range
- ✏️ **Edit/Delete** - Modify or remove existing reports
- 🌐 **Cloud Hosted** - Accessible from anywhere via internet
- ⚡ **Always Online** - Deployed on Cyclic.sh (never sleeps!)

## Deploy on Cyclic.sh (Free - Never Sleeps!)

### Prerequisites
- GitHub account
- CockroachDB Cloud cluster (free tier)

### Steps

1. **Push code to GitHub**
   ```bash
   cd satsang-report-maker
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/satsang-report-maker.git
   git push -u origin main
   ```

2. **Deploy on Cyclic**
   - Go to [cyclic.sh](https://cyclic.sh)
   - Click **"Connect to GitHub"**
   - Authorize GitHub access
   - Click **"Link Repository"** next to your repo
   - Click **"Connect"** to select your repo
   - Under **"Variables"**, click **"Add Variable"**:
     - **Key:** `DATABASE_URL`
     - **Value:** Your CockroachDB connection string
   - Click **"Deploy"**
   - Wait 1-2 minutes for deployment

3. **Your app is live!** 
   - Get your URL: Click on the deployment → **"View Production Deployment"**
   - URL looks like: `https://satsang-report-maker.cyclic.app`

### Get CockroachDB Connection String
1. Go to [CockroachDB Cloud](https://cockroachlabs.com/cloud/)
2. Select your cluster
3. Click **"Connect"**
4. Copy the connection string
5. Paste it in Cyclic's Environment Variables

---

## Local Development

### Setup
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/satsang-report-maker.git
cd satsang-report-maker

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your DATABASE_URL

# Start server
npm start
```

### Run
- Open `http://localhost:3000` in your browser

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check server status |
| GET | `/api/reports` | Get all reports |
| GET | `/api/reports/:id` | Get specific report by ID |
| GET | `/api/reports/date/:date` | Get report by date |
| GET | `/api/reports/recent/:limit` | Get recent reports |
| GET | `/api/reports/search?startDate=&endDate=` | Search by date range |
| POST | `/api/reports` | Create or update report |
| PUT | `/api/reports/:id` | Update specific report |
| DELETE | `/api/reports/:id` | Delete report |

---

## Usage

### Creating a New Report
1. Open the application
2. Fill in the form fields
3. Click "💾 Submit & Save to DB"
4. Report is saved to CockroachDB

### Adding a Past Entry
1. Click "📋 View Records" button
2. In the "Add Past Entry" section, select a date
3. Click "Load for Editing"
4. Fill in the form with past data
5. Save the report

### Viewing/Editing/Deleting Records
1. Click "📋 View Records" button
2. Browse the list or use search to filter
3. Click "View" to load a record
4. Click "Edit" to modify and save
5. Click "Delete" to remove a record

### Downloading PDF
1. Fill in or load a report
2. Click "⬇️ Download PDF"
3. PDF is generated and downloaded with date filename

---

## Troubleshooting

### "Connection Refused" Error
- Ensure the backend server is running
- Check the environment variables are set correctly
- Verify CockroachDB cluster is running

### Database Not Initialized
- Check Cyclic deployment logs for errors
- Verify DATABASE_URL in environment variables
- Ensure database exists and user has proper permissions

---

## License

MIT

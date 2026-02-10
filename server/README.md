# SchedAI Server

Backend server for the SchedAI application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env` file

3. Run the server:

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

- `GET /` - Server status
- `GET /api/health` - Health check
- `GET /api/faculty` - Faculty data
- `GET /api/timetable` - Timetable data
- `GET /api/announcements` - Announcements data

## Tech Stack

- Node.js
- Express.js
- CORS
- dotenv

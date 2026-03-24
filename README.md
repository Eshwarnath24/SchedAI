# SchedAI - Smart Academic Scheduling System

An intelligent, full-stack academic scheduling platform built for **Amrita University** that automates timetable generation using a **Rust-powered genetic algorithm**, manages faculty workload, leave requests, announcements, and provides role-based dashboards for **Admins**, **Faculty**, and **Students**.

**Live Demo:** [https://sched-ai-opal.vercel.app/](https://sched-ai-opal.vercel.app/)

---

## Features

### 🔐 Authentication & Authorization
- Role-based login (Student, Faculty, Admin) with JWT authentication
- Secure password hashing with bcrypt
- Forgot Password flow with email-based OTP verification
- Protected routes with role-based access control

### 📊 Admin Panel
- **Dashboard** – Overview of faculty, courses, rooms, sections, and key metrics
- **Timetable Management** – Generate & view master timetables powered by the Rust scheduling engine
- **Workload Analysis** – Monitor and balance faculty workload distribution
- **Reports** – Export detailed reports (PDF) with KPIs, efficiency gauges, and engagement charts
- **Announcements** – Create, edit, and broadcast announcements to faculty and students

### 👨‍🏫 Faculty Portal
- **Dashboard** – Personalized overview with teaching schedule and workload summary
- **Timetable** – View individual weekly timetable with day/period grid
- **Allocations** – View assigned courses, rooms, and sections
- **Workload** – Detailed workload breakdown with visual analytics
- **Leave Management** – Submit and track leave requests
- **Reports** – Generate and download personal workload reports
- **Announcements** – View announcements from the administration

### 🎓 Student Portal
- **Dashboard** – Quick access to section timetable and announcements
- **Section Timetable** – View class-wise weekly schedule
- **Teacher's Timetable** – Look up any teacher's schedule
- **Announcements** – Stay updated with university-wide announcements

### 🗺️ Campus Map
- Interactive campus map for navigation

### 🔔 Notifications
- Event-driven email notifications (class cancellations, leave approvals) via Nodemailer
- In-app toast notifications for real-time feedback

### 📱 Responsive Design
- Fully responsive UI with mobile-first approach
- Works seamlessly across desktop, tablet, and mobile devices

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 7** | Build tool & dev server |
| **React Router DOM 7** | Client-side routing |
| **Tailwind CSS 3** | Utility-first CSS framework |
| **Recharts** | Data visualization & charts |
| **Lucide React** | Icon library |
| **React Toastify** | Toast notifications |
| **html2canvas + jsPDF** | PDF report generation |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Email notifications |
| **Handlebars** | Email templates |
| **EventEmitter2** | Event-driven notification system |

### Scheduling Engine
| Technology | Purpose |
|---|---|
| **Rust** | High-performance scheduler worker |
| **Genetic Algorithm** | Timetable optimization using mutation & crossover |
| **Rayon** | Parallel/multi-threaded evaluation |
| **Serde** | JSON serialization for Node.js ↔ Rust communication |

### Testing
| Technology | Purpose |
|---|---|
| **Vitest** | Frontend unit & component testing |
| **React Testing Library** | React component testing |
| **Jest** | Backend unit & integration testing |
| **Supertest** | HTTP API testing |
| **MongoDB Memory Server** | In-memory DB for test isolation |

---

## Project Structure

```
SchedAI/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── Admin/               # Admin portal pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── TimeTable.jsx
│   │   │   │   ├── Workload.jsx
│   │   │   │   ├── Report.jsx
│   │   │   │   ├── Allocation.jsx
│   │   │   │   ├── Announcements.jsx
│   │   │   │   └── LeaveForm.jsx
│   │   │   ├── Faculty/             # Faculty portal pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── TimeTable.jsx
│   │   │   │   ├── Workload.jsx
│   │   │   │   ├── Reports.jsx
│   │   │   │   ├── Allocations.jsx
│   │   │   │   ├── Announcements.jsx
│   │   │   │   └── LeaveForm.jsx
│   │   │   ├── Student/             # Student portal pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── SectionTimeTable.jsx
│   │   │   │   ├── TeachersTimeTable.jsx
│   │   │   │   ├── Announcements.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── AuthPage.jsx         # Login page with role selection
│   │   │   ├── ForgotPassword.jsx   # Password recovery flow
│   │   │   └── Map.jsx              # Interactive campus map
│   │   ├── components/              # Reusable UI components
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StudentSidebar.jsx
│   │   │   ├── TopToolbar.jsx
│   │   │   ├── TimetableGrid.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── EfficiencyGauge.jsx
│   │   │   ├── EngagementCurveChart.jsx
│   │   │   ├── ExportReportModal.jsx
│   │   │   ├── WorkloadReportModal.jsx
│   │   │   ├── ReportKPICard.jsx
│   │   │   ├── AddEventModal.jsx
│   │   │   ├── EditEventModal.jsx
│   │   │   ├── AnnouncementModal.jsx
│   │   │   └── InfoBlock.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx       # Global state management
│   │   ├── utils/                   # Utilities, API calls, mock data
│   │   ├── __tests__/               # Frontend test suites
│   │   ├── App.jsx                  # Root component with routing
│   │   └── main.jsx                 # Application entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                          # Backend application
│   ├── server.js                    # Express server entry point
│   ├── BackendAndDB/
│   │   ├── DB_models/               # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Student.js
│   │   │   ├── Course.js
│   │   │   ├── Room.js
│   │   │   ├── Section.js
│   │   │   ├── schedule.js
│   │   │   ├── ScheduleOverride.js
│   │   │   ├── FacultyPreference.js
│   │   │   ├── announcement.js
│   │   │   ├── leaveRequest.js
│   │   │   ├── timeSlot.js
│   │   │   ├── workload.js
│   │   │   └── task.js
│   │   ├── controllers/             # Route handlers & business logic
│   │   ├── routes/                  # API route definitions
│   │   ├── middleware/              # JWT auth middleware
│   │   ├── services/                # Faculty data aggregation service
│   │   ├── notifications/           # Event-driven email notification system
│   │   └── mail/                    # Nodemailer service & Handlebars templates
│   ├── scheduler_worker/            # Rust scheduling engine
│   │   ├── Cargo.toml
│   │   └── src/                     # Genetic algorithm implementation
│   ├── tests/                       # Backend test suites
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── seed.js                      # Database seeding script
│   ├── seedStudents.js              # Student data seeder
│   └── package.json
│
├── E2E_TEST_REPORT.md
├── Integration_Testing_Report.md
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (local instance or MongoDB Atlas)
- **Rust** (for building the scheduler worker — optional for frontend-only development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Eshwarnath24/SchedAI.git
   cd SchedAI
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in `server/` with:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   MAIL_HOST=your_smtp_host
   MAIL_PORT=your_smtp_port
   MAIL_USER=your_email
   MAIL_PASS=your_email_password
   ```

4. **Seed the database** (optional)
   ```bash
   node seed.js
   node seedStudents.js
   ```

5. **Build the Rust scheduler** (optional)
   ```bash
   npm run build-rust
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```
   The API server will be available at `http://localhost:5000`

7. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

8. **Start the frontend dev server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

---

## API Endpoints

| Route | Description |
|---|---|
| `POST /api/auth/login` | User authentication |
| `POST /api/auth/register` | User registration |
| `GET /api/schedule` | Fetch timetable data |
| `POST /api/schedule/generate` | Trigger schedule generation |
| `GET /api/leaves` | Fetch leave requests |
| `POST /api/leaves` | Submit leave request |
| `GET /api/announcements` | Fetch announcements |
| `POST /api/announcements` | Create announcement |
| `GET /api/reports` | Fetch report data |
| `GET /api/dashboard` | Dashboard metrics |
| `GET /api/courses` | Course information |

---

## Available Scripts

### Frontend (`client/`)
| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run test` | Run Vitest test suites |
| `npm run test:watch` | Run tests in watch mode |

### Backend (`server/`)
| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (hot reload) |
| `npm start` | Start server (production) |
| `npm test` | Run all Jest tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run build-rust` | Compile Rust scheduler worker |

---

## Scheduling Engine


---

## Timetable Efficiency & Analytics

SchedAI measures the efficiency and practicality of generated timetables using advanced analytics, computed in real time and validated by automated tests.

### Key Metrics
- **Engagement Score:** Measures how evenly classes are distributed across the week (higher = more balanced).
- **Utilization Rate:** Percentage of available teaching slots actually used.
- **Consecutive Hours Metric:** Indicates how well classes are grouped (minimizing idle gaps).
- **Gap Analysis:** Counts and averages idle periods between classes.

These metrics are computed by the backend’s Faculty Data Aggregation Service and are available via the `/api/dashboard/:facultyId` and `/api/reports/:facultyId` endpoints.

#### Example API Response (excerpt)
```json
{
   "success": true,
   "facultyId": "507f1f77bcf86cd799439011",
   "kpis": {
      "totalCourses": 5,
      "weeklyHours": 18,
      "completionRate": 67,
      "activeClasses": 3,
      "pendingLeaves": 1,
      "utilizationRate": 45,
      "engagementScore": 78
   },
   "efficiency": {
      "engagementScore": 78,
      "utilizationRate": 45,
      "consecutiveHoursMetric": 62,
      "totalGaps": 8,
      "avgGapsPerDay": 1.6
   }
}
```

### Automated Test Coverage
- **Integration tests** validate that all efficiency metrics are present and correctly structured for real and edge-case data.
- **Unit tests** ensure the correctness of calculations that feed into efficiency analytics.

#### Example Test Assertion
```js
expect(res.body.engagementCurve).toBeDefined();
expect(res.body.engagementCurve.labels).toContain('Monday');
expect(res.body.workloadStats.totalWorkingHours).toBeGreaterThanOrEqual(0);
```

### Performance
- Analytics service is optimized for sub-100ms response times using parallel MongoDB aggregations.
- Test benchmarks show:
   - **Total Response Time:** ~127ms average
   - **Efficiency Calculations:** ~45ms average

---

The timetable generation is powered by a **Rust-based genetic algorithm** that optimizes class schedules by considering:

- Faculty preferences and availability
- Room capacity and type constraints
- Section-specific requirements
- Time slot conflicts and constraints
- Workload balancing across faculty

The Rust worker communicates with the Node.js backend via JSON I/O, ensuring high-performance schedule computation with multi-threaded evaluation using **Rayon**.

---

## Deployment

- **Frontend** — Deployed on **Vercel** with automatic deployments on push to `main`
- **Backend** — Can be deployed on any Node.js hosting platform (Render, Railway, AWS, etc.)
- **Database** — MongoDB Atlas (cloud) or local MongoDB instance

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/Eshwarnath24/SchedAI) or contact the development team.

---

**Built with ❤️ for smarter academic scheduling at Amrita University**

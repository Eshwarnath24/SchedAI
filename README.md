# SchedAI - Smart Scheduling Assistant

An intelligent scheduling application designed to streamline resource allocation, workload management, and team coordination. SchedAI combines AI-powered insights with an intuitive interface to simplify project and event scheduling.

**Live Demo:** [https://sched-ai-opal.vercel.app/](https://sched-ai-opal.vercel.app/)

---

## Features

- **Dashboard** - Central hub for quick overview and key metrics
- **TimeTable** - Visual scheduling and calendar management
- **Allocations** - Manage and track resource allocations
- **Workload Analysis** - Monitor team workload and capacity planning
- **Announcements** - Communicate updates and important information
- **Leave Management** - Track and manage employee leave requests
- **Event Management** - Create, edit, and manage events with modal interfaces
- **Responsive Design** - Works seamlessly across desktop and mobile devices
- **Real-time Updates** - Instant notifications and status updates

---

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Lucide React** - Icon library
- **React Toastify** - Toast notifications

### Development
- **ESLint** - Code linting and quality
- **Autoprefixer** - CSS vendor prefixes

---

## Project Structure

```
SchedAI/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── AddEventModal.jsx
│   │   │   ├── AnnouncementModal.jsx
│   │   │   ├── EditEventModal.jsx
│   │   │   ├── InfoBlock.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── TopToolbar.jsx
│   │   ├── Pages/             # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TimeTable.jsx
│   │   │   ├── Allocations.jsx
│   │   │   ├── Workload.jsx
│   │   │   ├── Announcements.jsx
│   │   │   └── LeaveForm.jsx
│   │   ├── context/           # React Context for state management
│   │   │   └── AppContext.jsx
│   │   ├── utils/             # Utility functions and constants
│   │   │   ├── announcements.js
│   │   │   └── constants.js
│   │   ├── App.jsx            # Main App component
│   │   ├── main.jsx           # Application entry point
│   │   ├── App.css
│   │   └── index.css
│   ├── public/                # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── eslint.config.js
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Eshwarnath24/SchedAI.git
   cd SchedAI
   ```

2. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

---

## Usage

### Navigation
Use the **Sidebar** component to navigate between different sections:
- Dashboard - Overview and analytics
- TimeTable - Schedule management
- Allocations - Resource distribution
- Workload - Team workload tracking
- Announcements - Updates and notices
- LeaveForm - Leave request submission

### Event Management
- Click **Add Event** to create new events via `AddEventModal`
- Use **Edit** button to modify existing events via `EditEventModal`
- Announcements can be created/edited via `AnnouncementModal`

### Notifications
Toast notifications provide real-time feedback for actions and updates.

---

## Component Overview

| Component | Purpose |
|-----------|---------|
| `Sidebar` | Navigation menu and app structure |
| `TopToolbar` | Header with controls and information |
| `AddEventModal` | Form to create new events |
| `EditEventModal` | Form to modify existing events |
| `AnnouncementModal` | Interface for announcements |
| `InfoBlock` | Reusable information display card |

---

## Context & State Management

The application uses **React Context** (`AppContext.jsx`) for global state management, providing centralized access to:
- User data
- Event information
- Application settings
- Shared functionality

---

## Deployment

The application is deployed on **Vercel**. Any push to the main branch triggers automatic deployment.

---

## Contributing

1. Create a feature branch: `git checkout -b feature/YourFeature`
2. Commit changes: `git commit -m 'Add YourFeature'`
3. Push to branch: `git push origin feature/YourFeature`
4. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository or contact the development team.

---

**Built with ❤️ for better scheduling**

# GMS Frontend - Goal Management System

Production-ready React frontend for the Goal Management System with modern UI/UX.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Zustand** - Lightweight state management
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Form handling
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **date-fns** - Date formatting

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Manager, Member)
- Protected routes
- Auto-redirect on token expiration

### Dashboard
- Goal statistics overview
- Active, completed, at-risk goals
- Recent goals list
- Quick navigation

### Goal Management
- Create goals with auto-calculated due dates
- Priority-based weightage system
- Real-time weightage validation
- Goal approval workflow
- Progress tracking with percentage
- Subtask management with auto-completion
- At-risk goal detection
- Status-based filtering

### Feedback & Scoring
- Member feedback submission
- Evaluator feedback with 5 rating categories
- Performance scoring system
- Auto-transition to scorable status

### Admin Features
- User management (CRUD)
- Team management (CRUD)
- Role assignment
- Manager hierarchy setup

## Setup

### Prerequisites
- Node.js 18+ and npm
- Backend API running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Access the application:
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.jsx      # Main layout with navigation
│   └── ProtectedRoute.jsx  # Auth guard
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── Dashboard.jsx   # Dashboard with stats
│   ├── Goals.jsx       # Goals list
│   ├── CreateGoal.jsx  # Goal creation form
│   ├── GoalDetail.jsx  # Goal details with actions
│   ├── Users.jsx       # User management
│   └── Teams.jsx       # Team management
├── services/           # API services
│   ├── api.js         # Axios instance
│   ├── auth.js        # Auth service
│   ├── goal.js        # Goal service
│   ├── user.js        # User service
│   └── team.js        # Team service
├── store/             # Zustand stores
│   └── auth.js        # Auth state
├── utils/             # Utility functions
│   └── format.js      # Date/string formatting
├── constants/         # Constants
│   └── enums.js       # Enums matching backend
├── App.jsx            # Main app with routing
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## API Integration

The frontend uses a proxy configuration in `vite.config.js` to forward `/api/*` requests to the backend at `http://localhost:8000`.

All API calls automatically include the JWT token from localStorage via Axios interceptors.

## Default Credentials

Use the credentials from your backend database. Example:
- Email: admin@example.com
- Password: (as set in your database)

## Key Features Implementation

### Auto-calculated Due Dates
Due dates are automatically calculated based on start_date + tag:
- Daily: +1 day
- Weekly: +7 days
- Monthly: +30 days
- Quarterly: +90 days
- Yearly: +365 days

### Priority-based Weightage
Weightage is auto-assigned based on priority:
- Critical: 40%
- High: 30%
- Medium: 20%
- Low: 10%

The system validates that total weightage for a user's goals in the same period doesn't exceed 100%.

### Goal Workflow
1. **Draft** → Submit for approval
2. **Pending Approval** → Manager/Admin approves
3. **Active** → Track progress, add subtasks
4. **Completed** → Auto-transitions to awaiting feedback
5. **Awaiting Feedback** → Member + Evaluator submit feedback
6. **Scorable** → Manager/Admin submits score
7. **Scored** → Final state

### Subtask Auto-completion
When subtasks are added, goal completion percentage is automatically calculated based on completed subtasks count.

### At-risk Detection
Goals are flagged as "at-risk" when:
- Time elapsed > 70%
- Completion < 50%

## UI/UX Highlights

- Clean, modern design with Tailwind CSS
- Responsive layout for all screen sizes
- Color-coded status badges
- Progress bars for visual feedback
- Modal dialogs for forms
- Toast notifications for user feedback
- Loading states and error handling
- Intuitive navigation with active states

## Development Tips

- Hot reload enabled for instant feedback
- React DevTools recommended for debugging
- Check browser console for API errors
- Use React Hook Form DevTools for form debugging

## Troubleshooting

### CORS Issues
Ensure backend has CORS enabled for `http://localhost:3000`

### API Connection Failed
- Verify backend is running on port 8000
- Check proxy configuration in vite.config.js

### Authentication Issues
- Clear localStorage and login again
- Check JWT token expiration in backend

## Future Enhancements

- Dark mode support
- Advanced filtering and search
- Export reports to PDF/Excel
- Real-time notifications with WebSockets
- Goal templates
- Bulk operations
- Analytics dashboard with charts

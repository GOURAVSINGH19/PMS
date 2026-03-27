# GMS Frontend - Feature Overview

## 🎨 UI/UX Design

### Design System
- **Color Scheme**: Blue primary (#3b82f6) with semantic colors
- **Typography**: System fonts with clear hierarchy
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable button, input, card classes
- **Icons**: Lucide React for consistent iconography
- **Responsive**: Mobile-first design with Tailwind breakpoints

### Visual Elements
- Status badges with color coding
- Progress bars for visual feedback
- Modal dialogs for forms
- Toast notifications for actions
- Loading spinners for async operations
- Hover states and transitions

## 📱 Pages & Features

### 1. Login Page (`/login`)
- Clean, centered design
- Email/password form
- Form validation
- Auto-redirect if authenticated
- Error handling

### 2. Dashboard (`/`)
- **Statistics Cards**:
  - Total Goals
  - Active Goals
  - Completed Goals
  - At-Risk Goals
  - Pending Approval
- **Recent Goals List**: Last 5 goals with quick view
- **Quick Actions**: Create goal button
- **Clickable Stats**: Navigate to filtered views

### 3. Goals List (`/goals`)
- **Table View** with columns:
  - Title (with at-risk indicator)
  - Level (company/team/individual)
  - Priority (with color badges)
  - Status (with color badges)
  - Progress (visual bar + percentage)
  - Due Date
  - Actions (View link)
- **Filtering**: By status, at-risk flag
- **Create Button**: Quick access to goal creation

### 4. Create Goal (`/goals/new`)
- **Form Fields**:
  - Title (required)
  - Description (optional)
  - Level (dropdown)
  - Tag (dropdown - auto-calculates due date)
  - Priority (dropdown - shows weightage)
  - Start Date (date picker)
  - Assign To (user dropdown)
- **Real-time Weightage Check**:
  - Shows goal weightage based on priority
  - Shows remaining weightage for user/period
  - Validates before submission
- **Auto-calculations**:
  - Due date from start_date + tag
  - Weightage from priority
  - Team from assignee

### 5. Goal Detail (`/goals/:id`)
- **Header Section**:
  - Title
  - Status badge
  - Priority badge
  - At-risk indicator
  - Action buttons (context-aware)

- **Statistics Cards**:
  - Progress percentage with visual bar
  - Time elapsed percentage
  - Days remaining
  - Weightage

- **Details Section**:
  - Level, Tag
  - Start/Due dates
  - Assignee, Creator
  - Description

- **Subtasks Section**:
  - List with checkboxes
  - Add new subtask (modal)
  - Delete subtask
  - Auto-completion calculation
  - Only editable by assignee when active

- **Feedback Section**:
  - Member feedback (deliverables, improvements)
  - Evaluator feedback (5 ratings + comment)
  - Submit buttons (role-based)
  - Display submitted feedback

- **Score Section**:
  - Performance rating dropdown
  - Submit button (manager/admin only)
  - Display final score

- **Context-aware Actions**:
  - Draft: Submit for approval
  - Pending: Approve/Reject (manager/admin)
  - Active: Update progress, Mark complete
  - Awaiting Feedback: Submit feedback
  - Scorable: Submit score

### 6. Users Management (`/users`) - Admin Only
- **Table View**:
  - Name, Email, Role
  - Team, Manager
  - Edit/Delete actions
- **Add/Edit Modal**:
  - Name, Email, Password
  - Role dropdown
  - Team dropdown
  - Manager dropdown (hierarchy)
- **CRUD Operations**: Create, Read, Update, Delete

### 7. Teams Management (`/teams`) - Admin Only
- **Card Grid View**:
  - Team name
  - Manager name
  - Member count
  - Edit/Delete actions
- **Add/Edit Modal**:
  - Team name
  - Manager dropdown (admin/manager only)
- **CRUD Operations**: Create, Read, Update, Delete

## 🔐 Authentication & Authorization

### Authentication
- JWT token stored in localStorage
- Auto-included in all API requests via Axios interceptor
- Auto-redirect to login on 401
- Token validation on protected routes

### Authorization
- **Public**: Login page only
- **Authenticated**: Dashboard, Goals
- **Admin Only**: Users, Teams management
- **Role-based Actions**:
  - Approve goals: Manager/Admin
  - Submit evaluator feedback: Manager/Admin
  - Score goals: Manager/Admin
  - Update progress: Assignee only
  - Submit member feedback: Assignee only

## 🔄 State Management

### Zustand Store
- **Auth Store**:
  - User object
  - JWT token
  - Login/Logout actions
  - Role check helpers

### Local State
- Component-level state with useState
- Form state with React Hook Form
- Loading states for async operations

## 🌐 API Integration

### Axios Configuration
- Base URL: `/api/v1`
- Proxy to backend: `http://localhost:8000`
- Request interceptor: Add JWT token
- Response interceptor: Handle 401 errors

### Services
- **authService**: Login, logout, user info
- **goalService**: All goal operations
- **userService**: User CRUD
- **teamService**: Team CRUD

### Error Handling
- Toast notifications for errors
- Form validation errors
- Network error handling
- 401 auto-redirect

## 🎯 Goal Workflow Implementation

```
DRAFT
  ↓ (Submit for approval)
PENDING_APPROVAL
  ↓ (Approve)
ACTIVE
  ↓ (Mark complete)
COMPLETED
  ↓ (Auto-transition)
AWAITING_FEEDBACK
  ↓ (Both feedbacks submitted)
SCORABLE
  ↓ (Submit score)
SCORED
```

### Auto-transitions
- Completed → Awaiting Feedback (automatic)
- Awaiting Feedback → Scorable (when both feedbacks submitted)

### Manual Actions
- Draft → Pending Approval (creator)
- Pending Approval → Active (manager/admin)
- Pending Approval → Rejected (manager/admin)
- Active → Completed (assignee)
- Scorable → Scored (manager/admin)

## 📊 Data Visualization

### Progress Indicators
- Horizontal progress bars with percentage
- Color-coded status badges
- At-risk warnings
- Time elapsed indicators

### Statistics
- Numeric displays with icons
- Clickable stat cards
- Color-coded priorities
- Visual weightage indicators

## 🎨 Color Coding

### Status Colors
- Draft: Gray
- Pending Approval: Yellow
- Active: Blue
- Completed: Green
- Awaiting Feedback: Purple
- Scorable: Indigo
- Scored: Emerald
- Rejected: Red

### Priority Colors
- Critical: Red (40%)
- High: Orange (30%)
- Medium: Yellow (20%)
- Low: Green (10%)

## 🚀 Performance Optimizations

- Vite for fast builds and HMR
- Code splitting with React Router
- Lazy loading for routes (can be added)
- Optimized re-renders with Zustand
- Minimal dependencies
- Tailwind CSS purging in production

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Responsive navigation
- Mobile-friendly forms
- Touch-friendly buttons
- Scrollable tables on mobile

## 🔧 Developer Experience

- Hot Module Replacement (HMR)
- ESLint ready (can be configured)
- Clear project structure
- Reusable components
- Consistent naming conventions
- Comprehensive comments
- Type-safe with PropTypes (can be added)

## 🎁 Production Ready

- Environment configuration
- Build optimization
- Error boundaries (can be added)
- Loading states
- Error handling
- Toast notifications
- Form validation
- Security best practices
- CORS handling
- Token management

## 🔮 Future Enhancements

- Dark mode toggle
- Advanced filtering
- Search functionality
- Export to PDF/Excel
- Charts and analytics
- Real-time updates (WebSockets)
- Notifications system
- Goal templates
- Bulk operations
- Activity timeline
- Comments on goals
- File attachments
- Email notifications
- Mobile app (React Native)

# Attendance Management System

A comprehensive web-based attendance management system built with Angular 18+ and modern web technologies. This application provides role-based access control for employees and administrators to manage attendance, leave requests, and notifications efficiently.

## 🚀 Features

### For Employees
- **Real-time Attendance Tracking**: Check-in/check-out with live timer
- **Break Management**: Start and end breaks during work hours
- **Leave Requests**: Submit leave applications with date ranges and reasons
- **Notifications**: View leave request status updates (approved/rejected/pending)
- **Attendance History**: View personal attendance records

### For Administrators
- **Employee Management**: View and manage employee accounts
- **Leave Approval System**: Approve or reject employee leave requests
- **Attendance Overview**: Monitor all employee attendance data
- **Dashboard Analytics**: Real-time attendance statistics and insights

## 🛠️ Technology Stack

- **Frontend**: Angular 18+ (Standalone Components)
- **Language**: TypeScript
- **Styling**: Bootstrap 5 + Custom CSS
- **Icons**: FontAwesome
- **Notifications**: SweetAlert2
- **Authentication**: JWT Token-based
- **HTTP Client**: Angular HttpClient with RxJS

## 📁 Project Structure


markdown
src/app/
├── core/
│ ├── guards/ # Route protection (auth, admin, login guards)
│ └── services/ # Business logic services
├── features/
│ ├── auth/ # Login/Registration
│ ├── dashboard/ # Main dashboard with attendance tracking
│ ├── attendance/ # Attendance history
│ ├── leaves/ # Leave management
│ ├── employees/ # Employee management (Admin only)
│ └── notifications/ # Notification system
├── layout/
│ ├── header/ # Top navigation bar
│ ├── sidebar/ # Side navigation menu
│ └── layout/ # Main layout wrapper
└── shared/
└── components/ # Reusable components (404 page, etc.)


## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend_attendanceSystem


Install dependencies

npm install

bash
Environment Setup

Configure API endpoints in src/environments/environment.ts

Set up backend API URL and other environment variables

Run the application

ng serve

bash
Navigate to http://localhost:4200/

Build for Production
ng build --prod

bash
🔐 Authentication & Authorization
The application uses JWT token-based authentication with role-based access control:

Public Routes: Login/Registration pages

Protected Routes: All dashboard and feature pages (requires authentication)

Admin Routes: Employee management and leave approvals (admin role required)

User Roles
EMPLOYEE: Basic attendance and leave management features

ADMIN: Full system access including employee management and approvals

📱 Responsive Design
The application is fully responsive and optimized for:

Desktop: Full feature access with sidebar navigation

Tablet: Adaptive layout with collapsible sidebar

Mobile: Touch-friendly interface with mobile-optimized components

🎨 UI/UX Features
Modern Design: Clean, professional interface with smooth animations

Interactive Elements: Hover effects, loading states, and visual feedback

Accessibility: Proper ARIA labels and keyboard navigation support

Consistent Styling: Unified color scheme across all components

🔧 Key Components
Dashboard
Real-time attendance timer

Check-in/check-out functionality

Break management

Quick stats overview

Leave Management
Date range selection

Reason input with validation

Status tracking (pending/approved/rejected)

Admin approval interface

Notifications
Role-based notification display

Leave status updates

Real-time updates

📊 API Integration
The frontend communicates with a RESTful backend API for:

User authentication and authorization

Attendance data management

Leave request processing

Employee information management

Real-time notifications

API Endpoints
POST /api/auth/login - User authentication

GET /api/attendance/status - Get attendance status

POST /api/attendance/checkin - Check-in

POST /api/attendance/checkout - Check-out

GET /api/leaves/getleaves - Get leave requests

PUT /api/leaves/update-status - Update leave status

🧪 Testing
Run unit tests:

ng test

bash
Run end-to-end tests:

ng e2e

bash
📈 Performance Optimizations
Lazy Loading: Feature modules loaded on demand

OnPush Change Detection: Optimized component updates

Standalone Components: Reduced bundle size

Tree Shaking: Unused code elimination

🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/new-feature)

Commit changes (git commit -am 'Add new feature')

Push to branch (git push origin feature/new-feature)

Create a Pull Request



🔄 Version History
v1.0.0 - Initial release with core attendance features

v1.1.0 - Added leave management system

v1.2.0 - Implemented notification system and admin features

v1.3.0 - Enhanced UI/UX with responsive design

Built with ❤️ using Angular 18+ and modern web technologies
```
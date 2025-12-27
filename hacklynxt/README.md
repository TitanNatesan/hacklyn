# Hacklyn - Next.js Frontend

A modern hackathon and event management platform built with Next.js 16, React 19, and Tailwind CSS.

## Features

- **User Authentication**: Login, registration, and OAuth (Google, GitHub)
- **Event Management**: Browse, create, and manage hackathons and events
- **Dashboard**: Role-based dashboards for students, organizers, judges, and admins
- **Profile Management**: Complete profile with education, experience, and projects
- **Application System**: Apply to events with team formation and project submission
- **Admin Panel**: Manage users, approve events, and view platform statistics

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS with custom design system
- **HTTP Client**: Axios
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (Django REST API)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hacklynxt
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_OAUTH_URL=http://localhost:8000
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── auth/              # Authentication page
│   ├── complete-profile/  # Profile completion wizard
│   ├── contact/           # Contact page
│   ├── dashboard/         # Dashboard pages
│   │   ├── admin/        # Admin dashboard
│   │   ├── apply/        # Apply for event
│   │   ├── judge/        # Judge dashboard
│   │   ├── organize/     # Create event
│   │   └── organizer/    # Organizer dashboard
│   └── events/           # Events listing and details
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific components
│   ├── events/           # Event-related components
│   ├── landing/          # Landing page sections
│   ├── layout/           # Header, Footer
│   ├── profile/          # Profile form steps
│   └── ui/               # shadcn/ui components
├── hooks/                 # Custom React hooks
└── lib/                   # Utilities and API client
    ├── api.js            # Axios API client
    └── utils.js          # Utility functions
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## API Integration

The app uses Axios for API communication. The API client is located in `src/lib/api.js` and includes:

- **authAPI**: Authentication (login, register, OAuth)
- **profileAPI**: User profile management
- **eventsAPI**: Event CRUD operations
- **applicationsAPI**: Event applications
- **teamsAPI**: Team management
- **dashboardAPI**: Dashboard statistics
- **adminAPI**: Admin operations
- **judgeAPI**: Judging operations

## Environment Variables

| Variable                | Description             |
| ----------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`   | Backend API base URL    |
| `NEXT_PUBLIC_OAUTH_URL` | OAuth redirect base URL |

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variables
4. Deploy

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

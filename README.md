TLC Connect - Frontend
A modern React frontend for TLC Connect, a social platform with points system, groups, and real-time features.

🚀 Features
User Authentication - Secure login/registration

Points System - Earn and track points for platform engagement

Groups & Communities - Create, join, and manage groups

Real-time Chat - Live group conversations

Social Features - Posts, reactions, and user interactions

Responsive Design - Mobile-friendly interface

🛠 Tech Stack
Frontend: React 18, Vite

Styling: Tailwind CSS

Routing: React Router DOM

HTTP Client: Axios

Real-time: Laravel Echo, Pusher

Icons: Lucide React

📋 Prerequisites
Before you begin, ensure you have installed:

Node.js (version 16 or higher)

npm or yarn

⚡ Quick Start
1. Clone the Repository
bash
git clone https://github.com/koyomihub/tlc-connect-frontend.git
cd tlc-connect-frontend
2. Install Dependencies
bash
npm install
3. Environment Configuration
Create a .env file in the root directory:

env
VITE_API_URL=http://localhost:8000/api
VITE_PUSHER_APP_KEY=your_pusher_app_key
VITE_PUSHER_APP_CLUSTER=your_pusher_cluster
VITE_PUSHER_HOST=localhost
VITE_PUSHER_PORT=6001
VITE_PUSHER_SCHEME=http
4. Start Development Server
bash
npm run dev
The application will be available at http://localhost:5173

🔧 Available Scripts
npm run dev - Start development server

npm run build - Build for production

npm run preview - Preview production build

npm run lint - Run ESLint

npm run lint:fix - Fix ESLint issues automatically

📁 Project Structure
text
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Navbar, etc.)
│   ├── Posts/          # Post-related components
│   └── Social/         # Social interaction components
├── pages/              # Page components
│   ├── Earn.jsx        # Points earning page
│   ├── Groups.jsx      # Groups listing page
│   ├── GroupDetail.jsx # Single group view
│   ├── GroupChat.jsx   # Group chat interface
│   └── GroupInvitations.jsx # Group invitations
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication context
├── services/           # API and external services
│   ├── api.js          # API client configuration
│   └── echo.js         # Real-time service setup
└── App.jsx             # Main application component
🔌 API Integration
This frontend connects to the TLC Connect backend API. Ensure the backend is running and properly configured.

Required Backend Endpoints:
POST /api/auth/login - User authentication

GET /api/user - Get current user

GET/POST /api/groups - Group management

GET/POST /api/posts - Post management

GET/POST /api/points - Points system

🎨 Styling
This project uses Tailwind CSS for styling. Key features:

Responsive design utilities

Custom color palette

Component-based styling

Customization:
Edit tailwind.config.js to modify the design system:

javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      },
    },
  },
}
🔐 Authentication
The app uses token-based authentication:

Login returns an access token

Token is stored securely

Automatic token inclusion in API requests

Protected routes for authenticated users

📱 Real-time Features
Real-time functionality powered by Laravel Echo and Pusher:

Live group chats

Real-time notifications

Live post updates

🚀 Deployment
Build for Production
bash
npm run build
Deployment Options:
Vercel: Connect your GitHub repository for automatic deployments

Netlify: Drag and drop the dist folder or connect via Git

Traditional Hosting: Upload the dist folder to your web server

Environment Variables for Production:
Update your .env file with production values:

env
VITE_API_URL=https://your-backend-domain.com/api
VITE_PUSHER_APP_KEY=your_production_pusher_key
VITE_PUSHER_APP_CLUSTER=mt1
VITE_PUSHER_SCHEME=https
🤝 Contributing
Fork the repository

Create a feature branch: git checkout -b feature/amazing-feature

Commit your changes: git commit -m 'Add amazing feature'

Push to the branch: git push origin feature/amazing-feature

Open a Pull Request

Development Guidelines:
Follow React best practices

Use meaningful component and variable names

Write responsive, mobile-first CSS

Test across different browsers

🐛 Troubleshooting
Common Issues:
Build Failures:

Ensure Node.js version is 16+

Delete node_modules and run npm install again

API Connection Issues:

Verify backend server is running

Check CORS configuration on backend

Confirm API URL in .env file

Real-time Features Not Working:

Verify Pusher credentials

Check WebSocket server status

Ensure proper event broadcasting on backend

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
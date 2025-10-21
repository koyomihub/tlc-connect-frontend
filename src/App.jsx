import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import Threads from './pages/Threads';
import Earn from './pages/Earn';
import Login from './pages/Login';
import Register from './pages/Register';
import GroupChat from './pages/GroupChat'; // Updated import path
import GroupDetail from './pages/GroupDetail'; // Import the GroupDetail component
import GroupInvitations from './pages/GroupInvitations'; // Import the GroupInvitations component
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/:groupId" element={<GroupDetail />} />
              <Route path="/groups/:groupId/chat" element={<GroupChat />} />
              <Route path="/invitations" element={<GroupInvitations />} /> {/* Add this line */}
              <Route path="/threads" element={<Threads />} />
              <Route path="/earn" element={<Earn />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
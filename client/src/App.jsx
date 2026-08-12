import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateComplaint from './pages/CreateComplaint';
import ComplaintsList from './pages/ComplaintsList';
import ComplaintDetail from './pages/ComplaintDetail';
import EvidenceVault from './pages/EvidenceVault';

// Placeholders for remaining
const Profile = () => <div className="p-4">Profile (WIP)</div>;

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Protected Routes (Ideally wrapped in a PrivateRoute component) */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="complaint/new" element={<CreateComplaint />} />
            <Route path="complaints" element={<ComplaintsList />} />
            <Route path="complaint/:id" element={<ComplaintDetail />} />
            <Route path="complaint/:id/evidence" element={<EvidenceVault />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

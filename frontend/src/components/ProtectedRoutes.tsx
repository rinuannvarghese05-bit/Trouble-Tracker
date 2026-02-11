// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// You can pass the roles that are allowed to view the component
const ProtectedRoute = ({ allowedRoles }) => {
    // 1. Check if the token exists (Authentication check)
    const isAuthenticated = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole'); // Get role for authorization
    
    // --- AUTHENTICATION CHECK ---
    if (!isAuthenticated) {
        // If no token exists, redirect to login page immediately.
        // This stops anyone who types the dashboard URL.
        return <Navigate to="/" replace />;
    }

    // --- AUTHORIZATION CHECK (Who can see which dashboard) ---
    // If you pass an 'allowedRoles' prop, check if the user's role is permitted.
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Logged in, but trying to access a page they are not allowed to see
        return <Navigate to="/unauthorized" replace />; // Redirect to a different page
    }

    // If authenticated AND authorized, render the actual page content.
    return <Outlet />;
};

export default ProtectedRoute;
import React, { useState, useEffect } from 'react';
import {
  LogOut,
  Gavel, // NEW: Replaces Shield for ultimate authority
  Users,
  Settings,
  Filter,
  Search,
  Send,
  UserPlus,
  Edit,
  Trash2,
  TrendingUp,
  Clock,
  List,
  Bell,
  // 🚀 NEW ICONS FOR STATS
  Activity, // For Total Complaints
  Hourglass, // For Pending
  Loader, // For In Progress
  CheckCircle, // For Resolved
  XCircle // For Rejected
} from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard';
import NotificationPanel from '../components/NotificationPanel';
import SystemNotificationModal from '../components/SystemNotificationModal';
import AssignAdmin from '../components/AssignAdmin';
import UserManagementModal from '../components/UserManagementModal';

import complaintService from '../services/complaintService';
import * as userService from '../services/userService';
import * as notificationService from '../services/notificationService';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student'; // only admin and student now
  category?: string | null;
  room?: string | null;
  complaintsSubmitted: number;
  status: 'active' | 'inactive';
}

// Defining the Complaint structure for type safety and access to 'domain'
interface ComplaintData {
  _id: string;
  title: string;
  description: string;
  domain: string; // The category of the complaint
  status: string;
  votes: number;
  assignedTo?: string | null;
  submittedAt: string;
  // Add other fields from your complaint schema as needed
}

// New type for sort state
type SortType = 'votes' | 'newest' | 'oldest';

// NEW type for status filter
type ComplaintStatus = 'all' | 'pending' | 'in-progress' | 'resolved' | 'rejected';

const SuperAdminDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  // 🚀 MODIFIED: Use ComplaintData[] for type safety
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  // 'allUsers' now holds ALL users, including the Super Admin
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'complaints' | 'users'>('complaints');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  // NEW state for status filtering
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>('all');

  // New state for sorting
  const [sortType, setSortType] = useState<SortType>('votes');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [showUserModal, setShowUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  // 🚀 MODIFIED STATE: Store the full complaint object
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [complaintToAssign, setComplaintToAssign] = useState<ComplaintData | null>(null);
  const [assignedAdminId, setAssignedAdminId] = useState<string | undefined>(undefined);

  // Added 'SuperAdmin' to the domains list for completeness in the dropdown
  const domains = ['all', 'Maintenance', 'Cleanliness', 'Food', 'Internet', 'Security', 'SuperAdmin'];
  // NEW list for statuses
  const statuses: ComplaintStatus[] = ['all', 'pending', 'in-progress', 'resolved', 'rejected'];


  useEffect(() => {
    const loadDashboardData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return (window.location.href = '/');

      try {
        const user = await userService.getById(userId);
        // Note: Original code checks for 'admin', assuming 'superadmin' role is represented by the 'admin' role in this simplified context, or that the current user's role is stored in 'category' if it's a superadmin role.
        if (user.role !== 'admin' && user.category !== 'superadmin') {
          alert('Access denied: Admins only');
          return (window.location.href = '/');
        }

        setCurrentUser(user);

        const [allComplaints, usersData, userNotifications] = await Promise.all([
          complaintService.getAll(),
          userService.getAll(),
          notificationService.getNotificationsByUser(user._id),
        ]);

        // 🚀 Ensure allComplaints is correctly typed before setting state
        setComplaints(allComplaints as ComplaintData[]);
        setAllUsers(usersData);
        setNotifications(userNotifications);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setUsersLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // ----------------------------------------------------
  // User Management Handlers (kept the same)
  // ----------------------------------------------------

  const openAddUserModal = () => {
    setUserToEdit(null); // Clear any existing edit data
    setShowUserModal(true);
  };

  const openEditUserModal = (user: UserData) => {
    setUserToEdit(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setUserToEdit(null);
  };

  /**
   * Handles both adding and editing a user.
   * @param userPayload The user data to save. Includes _id for edits.
   */
  const handleSaveUser = async (userPayload: Partial<UserData>) => {
    try {
      if (userPayload._id) {
        // EDIT Mode
        const updatedUser = await userService.updateUser(userPayload._id, userPayload);
        // Update allUsers state
        setAllUsers(prev => prev.map(u => (u._id === updatedUser._id ? updatedUser : u)));

        // Special case: if the current user was edited, update currentUser state
        if (currentUser && updatedUser._id === currentUser._id) {
          setCurrentUser(updatedUser as UserData);
        }

        alert(`User ${updatedUser.name} updated successfully!`);
      } else {
        // ADD Mode
        const newUser = await userService.addUser(userPayload);
        // Add the new user to the list
        setAllUsers(prev => [newUser, ...prev]);
        alert(`New ${newUser.role} user ${newUser.name} added successfully!`);
      }
      closeUserModal();
    } catch (err) {
      console.error(`Failed to save user:`, err);
      alert(`Failed to save user. Check console for details.`);
      throw err; // Re-throw so the modal's handleSubmit can catch and handle its own UI
    }
  };

  const openDeleteConfirmation = (user: UserData) => {
    // Prevent deleting the currently logged-in user
    if (currentUser && user._id === currentUser._id) {
      alert("You cannot delete your own account while logged in!");
      return;
    }
    setUserToDelete(user);
  };

  const closeDeleteConfirmation = () => {
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete?._id) {
      alert('User ID is missing.');
      return closeDeleteConfirmation();
    }

    try {
      await userService.deleteUser(userToDelete._id);
      // Remove the user from allUsers state
      setAllUsers(prev => prev.filter(u => u._id !== userToDelete._id));
      alert(`User ${userToDelete.name} (${userToDelete.role}) deleted successfully.`);
      closeDeleteConfirmation();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user. Check console for details.');
      closeDeleteConfirmation();
    }
  };

  // ----------------------------------------------------
  // Complaint Handlers (UPDATED for Assign Modal)
  // ----------------------------------------------------
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updatedComplaint = await complaintService.updateStatus(id, status);
      setComplaints(prev => prev.map(c => (c._id === id ? updatedComplaint : c)));

      if (currentUser?._id) {
        const updatedNotifications = await notificationService.getNotificationsByUser(currentUser._id);
        setNotifications(updatedNotifications);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Check backend logs.');
    }
  };

  // 🚀 MODIFIED: Accepts the full complaint object
  const openAssignModal = (complaint: ComplaintData) => {
    setComplaintToAssign(complaint);
    setAssignedAdminId(complaint.assignedTo || undefined);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setComplaintToAssign(null); // Clear the selected complaint
    setAssignedAdminId(undefined);
  };

  const handleAssignAction = async (adminId: string) => {
    // 🚀 MODIFIED: Use the stored complaint object to get the ID
    if (!complaintToAssign?._id || !adminId || adminId.trim() === '') {
      alert('Invalid complaint or admin ID for assignment.');
      return closeAssignModal();
    }

    const complaintId = complaintToAssign._id;

    try {
      const updatedComplaint = await complaintService.assign(complaintId, adminId);
      setComplaints(prev => prev.map(c => (c._id === complaintId ? updatedComplaint : c)));

      if (currentUser?._id) {
        const updatedNotifications = await notificationService.getNotificationsByUser(currentUser._id);
        setNotifications(updatedNotifications);
      }

      closeAssignModal();
    } catch (err) {
      console.error('Failed to assign staff:', err);
      alert('Failed to assign staff. Check backend logs.');
    }
  };

  // ----------------------------------------------------
  // Notification Handlers (kept the same)
  // ----------------------------------------------------
  const handleSendNotification = async (notificationData: {
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    recipients: string[];
  }) => {
    try {
      // Logic to send notification goes here (not provided in prompt, assuming done in modal/service)
      // After successful send, refresh notifications for the current user if they are a recipient
      if (currentUser?._id && notificationData.recipients.includes(currentUser._id)) {
        const updatedNotifications = await notificationService.getNotificationsByUser(currentUser._id);
        setNotifications(updatedNotifications);
      }
      // Assuming notification service sends the notification when called from the modal
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      if (!notificationId) return;
      await notificationService.markNotificationAsRead(notificationId);

      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (!currentUser?._id) return;
      await notificationService.markAllNotificationsAsRead(currentUser._id);

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // ----------------------------------------------------
  // Utility & Filtering/Sorting Logic (UPDATED with Status Filter)
  // ----------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Phase 1: Filter complaints by domain, status, and search term
  const filteredComplaints = complaints.filter(c => {
    // 1. Domain Filter
    const matchesDomain = selectedDomain === 'all' || c.domain === selectedDomain;

    // 2. Status Filter (NEW LOGIC)
    // c.status is assumed to be one of the status values
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

    // 3. Search Term Filter
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDomain && matchesStatus && matchesSearch;
  });

  // Phase 2: Sort complaints
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    const votesA = a.votes ?? 0;
    const votesB = b.votes ?? 0;
    const dateA = new Date(a.submittedAt).getTime();
    const dateB = new Date(b.submittedAt).getTime();

    if (sortType === 'votes') {
      // Primary sort: Votes (descending)
      if (votesB !== votesA) {
        return votesB - votesA;
      }
      // Secondary sort: Newest first (for equal votes)
      return dateB - dateA;
    } else if (sortType === 'newest') {
      // Sort by date (descending)
      return dateB - dateA;
    } else if (sortType === 'oldest') {
      // Sort by date (ascending)
      return dateA - dateB;
    }

    return 0; // Default no change
  });

  // User search filter and sort (kept the same)
  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u._id.toLowerCase().includes(userSearchTerm.toLowerCase()) // Allow searching by ID
  ).sort((a, b) => {
    // 1. Prioritize the current user
    if (currentUser) {
      if (a._id === currentUser._id) return -1;
      if (b._id === currentUser._id) return 1;
    }

    // 2. Then, sort by role (admins before students)
    if (a.role === 'admin' && b.role === 'student') return -1;
    if (a.role === 'student' && b.role === 'admin') return 1;

    // 3. Finally, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });

  // 🚀 MODIFIED: Used Lucide icons for stats
  const stats = [
    // Use Activity or another high-level metric icon
    { label: 'Total Complaints', value: complaints.length, color: 'from-slate-500 to-indigo-600', IconComponent: Activity },
    // Use Hourglass or Watch for pending
    { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, color: 'from-yellow-500 to-yellow-600', IconComponent: Hourglass },
    // Use Loader or Settings for in-progress
    { label: 'In Progress', value: complaints.filter(c => c.status === 'in-progress').length, color: 'from-cyan-500 to-teal-600', IconComponent: Loader },
    // Use CheckCircle for resolved
    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: 'from-green-500 to-green-600', IconComponent: CheckCircle },
    // Use XCircle for rejected
    { label: 'Rejected', value: complaints.filter(c => c.status === 'rejected').length, color: 'from-red-500 to-red-600', IconComponent: XCircle },
  ];

  // Helper function to render the correct sort icon
  const renderSortIcon = () => {
    switch (sortType) {
      case 'votes':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'newest':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'oldest':
        return <List className="w-4 h-4 text-purple-600" />;
      default:
        return <List className="w-4 h-4 text-purple-600" />;
    }
  };

  // Utility component for user role badge (kept the same)
  const RoleBadge = ({ role, category }: { role: string, category?: string | null }) => {
    // Ensure 'superadmin' is displayed correctly, even if it's in the category field
    const roleDisplay = category === 'superadmin' ? 'Super Admin' : category || (role === 'admin' ? 'Admin' : 'Student');
    const bgColor = roleDisplay.includes('Admin') ? 'bg-purple-100' : 'bg-green-100';
    const textColor = roleDisplay.includes('Admin') ? 'text-purple-800' : 'text-green-800';

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {roleDisplay}
      </span>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;


  return (
    // 🚀 MODIFIED: Light background with a subtle purple-tinted gradient
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 to-purple-50/50">
      
      {/* Modern Header */}
      {/* 🚀 MODIFIED: Light, translucent header with a purple accent border */}
      <header className="shadow-sm border-b border-purple-200 sticky top-0 z-30 backdrop-blur-xl bg-white/80"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              {/* 🚀 MODIFIED ICON: Replaced Shield with Gavel for ultimate authority and added animation */}
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 hover:rotate-6">
                <Gavel className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Global management of complaints, users, and admins</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* SEND NOTIFICATION BUTTON: Changed to purple gradient */}
              <button
                onClick={() => setShowNotificationModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send Global Notification</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="relative group">
                {/* Hover Glow Effect: Updated to purple/indigo */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 from-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl transition-opacity duration-300" />
                {/* Inner card remains bg-white */}
                <div className="relative bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-3">
                    {/* ICON RENDERING: Uses Lucide Icon component */}
                    <div className={`bg-gradient-to-br ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center shadow-lg`}>
                      <stat.IconComponent className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-2 pt-2">
              <button
                onClick={() => setActiveTab('complaints')}
                className={`px-6 py-3 text-sm font-semibold rounded-t-xl transition-all duration-200 ${
                  activeTab === 'complaints'
                    ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600' // Changed to purple
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Complaints
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 text-sm font-semibold rounded-t-xl transition-all duration-200 ${
                  activeTab === 'users'
                    ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600' // Changed to purple
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                User Management
              </button>
            </div>

            {/* Complaints Tab Content */}
            {activeTab === 'complaints' && (
              <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center">
                  {/* Domain Filter Dropdown */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-purple-600" />
                    <select
                      value={selectedDomain}
                      onChange={e => setSelectedDomain(e.target.value)}
                      className="border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                    >
                      {domains.map(d => (
                        <option key={`domain-${d}`} value={d}>
                          {d === 'all' ? 'All Domains' : d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter Dropdown */}
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-600" />
                    <select
                      value={selectedStatus}
                      onChange={e => setSelectedStatus(e.target.value as ComplaintStatus)}
                      className="border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                    >
                      {statuses.map(s => (
                        <option key={`status-${s}`} value={s}>
                          {s === 'all' ? 'All Statuses' : s.replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>


                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-2">
                    {renderSortIcon()}
                    <select
                      value={sortType}
                      onChange={e => setSortType(e.target.value as SortType)}
                      className="border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                    >
                      <option value="votes">Sort: Highest Votes</option>
                      <option value="newest">Sort: Newest First</option>
                      <option value="oldest">Sort: Oldest First</option>
                    </select>
                  </div>

                  {/* Search Input */}
                  <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search complaints..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="flex-1 border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {sortedComplaints.length > 0 ? (
                    // Use the sorted list here
                    sortedComplaints.map(c => (
                      <ComplaintCard
                        key={c._id}
                        complaint={c}
                        showAdminControls
                        onStatusChange={handleStatusChange}
                        // 🚀 MODIFIED: Pass the full complaint object to openAssignModal
                        onAssign={() => openAssignModal(c)}
                        currentUserId={currentUser?._id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-gray-500 text-lg">No complaints found matching the filters.</p>
                      <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search criteria</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Management Tab Content */}
            {activeTab === 'users' && (
              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or ID..."
                      value={userSearchTerm}
                      onChange={e => setUserSearchTerm(e.target.value)}
                      className="flex-1 border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={openAddUserModal}
                    // Changed to purple gradient
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition w-full sm:w-auto justify-center shadow-md hover:shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add New User
                  </button>
                </div>

                {usersLoading ? (
                  <div className="text-center py-10 text-gray-500">Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name/Email</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location/Room</th>
                          <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Complaints</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <tr key={user._id} className={user._id === currentUser?._id ? "bg-purple-50/70 border-l-4 border-purple-500" : ""}>
                              {/* ID */}
                              <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-400 max-w-[100px] truncate" title={user._id}>
                                {user._id.substring(user._id.length - 8)}...
                              </td>
                              {/* Name/Email */}
                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.name}
                                {user._id === currentUser?._id && (
                                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500 text-white">
                                    You
                                  </span>
                                )}
                                <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                              </td>
                              {/* Role */}
                              <td className="px-3 py-4 whitespace-nowrap">
                                <RoleBadge role={user.role} category={user.category} />
                              </td>
                              {/* Category */}
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.category || 'N/A'}
                              </td>
                              {/* Location/Room */}
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.room || 'N/A'}
                              </td>
                              {/* Complaints Submitted */}
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700">
                                {user.complaintsSubmitted}
                              </td>
                              {/* Status */}
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {user.status}
                                </span>
                              </td>
                              {/* Actions */}
                              <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => openEditUserModal(user)}
                                  className="text-purple-600 hover:text-purple-900 transition-colors mr-3 p-1 rounded-lg hover:bg-gray-100"
                                  title="Edit User"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => openDeleteConfirmation(user)}
                                  className={`transition-colors p-1 rounded-lg hover:bg-gray-100 ${
                                    user._id === currentUser?._id
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-red-600 hover:text-red-900'
                                    }`}
                                  title={user._id === currentUser?._id ? "Cannot delete yourself" : "Delete User"}
                                  disabled={user._id === currentUser?._id}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                              No users found matching your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-28">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Notification Icon: Changed to purple gradient */}
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-gray-500">{unreadCount} unread</span>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    // Changed accent color to purple
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
            <NotificationPanel
              notifications={notifications}
              currentUserId={currentUser?._id}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <SystemNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onSend={handleSendNotification}
        // Pass allUsers which now includes the current user
        users={allUsers}
      />

      {/* 🚀 MODIFIED: Pass complaintToAssign.domain as the filter */}
      <AssignAdmin
        isOpen={isAssignModalOpen && complaintToAssign !== null}
        onClose={closeAssignModal}
        onAssign={handleAssignAction}
        currentAssigned={assignedAdminId}
        complaintDomain={complaintToAssign?.domain || ''}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={showUserModal}
        onClose={closeUserModal}
        userToEdit={userToEdit} // Will be null for add mode
        onSaveUser={handleSaveUser} // Unified save handler
      />

      {/* Delete User Confirmation Modal - COMPLETED JSX */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-6">
            <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-6 h-6" /> Confirm Deletion
            </h3>
            <p className="text-gray-700">
              Are you sure you want to delete user{' '}
              <span className="font-semibold text-gray-900">{userToDelete.name}</span> (
              <span className="font-semibold text-gray-900">{userToDelete.role}</span>)?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteConfirmation}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div> // Closing the main div
  );
};

export default SuperAdminDashboard;
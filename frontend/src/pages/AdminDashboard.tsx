import React, { useState, useEffect } from 'react';
import { LogOut, UserCircle, Users, Settings, Search, Send, TrendingUp, Clock, List, Filter, Bell } from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard';
import NotificationPanel from '../components/NotificationPanel';
import SystemNotificationModal from '../components/SystemNotificationModal';
import ViewUserManagementModel from '../components/ViewUserManagementModel';
import AssignAdmin from '../components/AssignAdmin';

import complaintService from '../services/complaintService';
import userService from '../services/userService';
import * as notificationService from '../services/notificationService';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'superadmin';
  category?: string | null;
  room?: string | null;
  complaintsSubmitted: number;
  status: 'active' | 'inactive';
}

interface ComplaintData {
  _id: string;
  title: string;
  description: string;
  domain: string;
  status: string;
  votes: number;
  assignedTo?: string | null;
  submittedAt: string;
}

type SortType = 'votes' | 'newest' | 'oldest';
type StatusFilterType = 'all' | 'pending' | 'in-progress' | 'resolved' | 'rejected';

const AdminDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'complaints' | 'users'>('complaints');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [sortType, setSortType] = useState<SortType>('votes');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [complaintToAssign, setComplaintToAssign] = useState<ComplaintData | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignedAdminId, setAssignedAdminId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadDashboardData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return (window.location.href = '/');

      try {
        const user = await userService.getById(userId);

        if (user.role !== 'admin' && user.role !== 'superadmin') {
          alert('Access denied: Admins only');
          return (window.location.href = '/');
        }

        setCurrentUser(user);

        const [allComplaints, allUsers, userNotifications] = await Promise.all([
          complaintService.getAll(),
          userService.getAll(),
          notificationService.getNotificationsByUser(user._id)
        ]);

        const userRole = user.role;
        const userCategory = user.category;

        const initialFilteredComplaints: ComplaintData[] = allComplaints.filter((c: any) => {
          if (userRole === 'superadmin') return true;
          return c.domain === userCategory;
        });

        setComplaints(initialFilteredComplaints);
        setUsers(allUsers);
        setNotifications(userNotifications);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setUsersLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updatedComplaint = await complaintService.updateStatus(id, status);
      setComplaints(prev => prev.map(c => (c._id === id ? updatedComplaint : c)));

      if (currentUser?._id) {
        const updatedNotifications = await notificationService.getNotificationsByUser(currentUser._id);
        setNotifications(updatedNotifications);
      }
    } catch (err) {
      console.error('Failed to update status or refresh notifications:', err);
      alert('Failed to update status. Check backend logs.');
    }
  };

  const openAssignModal = (complaint: ComplaintData) => {
    setComplaintToAssign(complaint);
    setAssignedAdminId(complaint.assignedTo || undefined);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setComplaintToAssign(null);
    setAssignedAdminId(undefined);
  };

  const handleAssignAction = async (adminId: string) => {
    if (!complaintToAssign?._id || !adminId || adminId.trim() === '') {
      console.error("Invalid complaint or admin ID for assignment.");
      closeAssignModal();
      return;
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

  const handleSendNotification = async (notificationData: {
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    recipients: string[];
  }) => {
    try {
      if (currentUser?._id && notificationData.recipients.includes(currentUser._id)) {
        const updatedNotifications = await notificationService.getNotificationsByUser(currentUser._id);
        setNotifications(updatedNotifications);
      }
    } catch (err) {
      console.error('Failed to refresh notifications after system send:', err);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      if (!notificationId) return;
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('AdminDashboard: Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (!currentUser?._id) return;
      await notificationService.markAllNotificationsAsRead(currentUser._id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('AdminDashboard: Failed to mark all notifications as read:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const filteredComplaints = complaints.filter(c => {
    const userRole = currentUser?.role;
    const userCategory = currentUser?.category;

    if (userRole === 'admin' && userCategory) {
      if (c.domain !== userCategory) return false;
    }

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    if (!matchesStatus) return false;

    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    const votesA = a.votes ?? 0;
    const votesB = b.votes ?? 0;
    const dateA = new Date(a.submittedAt).getTime();
    const dateB = new Date(b.submittedAt).getTime();

    if (sortType === 'votes') {
      if (votesB !== votesA) return votesB - votesA;
      return dateB - dateA;
    } else if (sortType === 'newest') {
      return dateB - dateA;
    } else if (sortType === 'oldest') {
      return dateA - dateB;
    }

    return 0;
  });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u._id.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Complaints', value: complaints.length, color: 'from-blue-500 to-blue-600', icon: '📊' },
    { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, color: 'from-yellow-500 to-yellow-600', icon: '⏳' },
    { label: 'In Progress', value: complaints.filter(c => c.status === 'in-progress').length, color: 'from-purple-500 to-purple-600', icon: '🔄' },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: 'from-green-500 to-green-600', icon: '✅' },
    { label: 'Rejected', value: complaints.filter(c => c.status === 'rejected').length, color: 'from-red-500 to-red-600', icon: '❌' },
  ];

  const renderSortIcon = () => {
    switch (sortType) {
      case 'votes': return <TrendingUp className="w-4 h-4" />;
      case 'newest': return <Clock className="w-4 h-4" />;
      case 'oldest': return <List className="w-4 h-4" />;
      default: return <List className="w-4 h-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <UserCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage complaints & users</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNotificationModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send Notification</span>
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
          {currentUser?.role === 'admin' && currentUser?.category && (
            <div className="pb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                Managing: {currentUser.category} Complaints
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl transition-opacity duration-300" />
                <div className="relative bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`bg-gradient-to-br ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg mb-3`}>
                      {stat.icon}
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
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
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
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                User Management
              </button>
            </div>

            {/* Complaints Tab */}
            {activeTab === 'complaints' && (
              <div className="p-6 space-y-6">
                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search complaints..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as StatusFilterType)}
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {renderSortIcon()}
                      </div>
                      <select
                        value={sortType}
                        onChange={e => setSortType(e.target.value as SortType)}
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                      >
                        <option value="votes">Highest Votes</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Complaints List */}
                <div className="space-y-4">
                  {sortedComplaints.length > 0 ? (
                    sortedComplaints.map(c => (
                      <ComplaintCard
                        key={c._id}
                        complaint={c}
                        showAdminControls
                        onAssign={() => openAssignModal(c)}
                        currentUserId={currentUser?._id}
                        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> FIX IS HERE <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                        onStatusChange={handleStatusChange} 
                        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-gray-500 text-lg">No complaints found</p>
                      <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search criteria</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="p-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or ID..."
                    value={userSearchTerm}
                    onChange={e => setUserSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <ViewUserManagementModel
                  users={filteredUsers}
                  loading={usersLoading}
                  currentUserId={currentUser?._id}
                />
              </div>
            )}
          </div>
        </div>

        {/* Notifications Panel - Enhanced */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-28">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
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
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
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
        users={users}
      />

      <AssignAdmin
        isOpen={isAssignModalOpen && complaintToAssign !== null}
        onClose={closeAssignModal}
        onAssign={handleAssignAction}
        currentAssigned={assignedAdminId}
        complaintDomain={complaintToAssign?.domain || ''}
      />
    </div>
  );
};

export default AdminDashboard;
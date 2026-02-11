import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Clock,
  List,
  Filter,
  Grip,
  LogOut,
  PlusCircle,
  User,
  Bell,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintSubmissionModal from '../components/ComplaintSubmissionModal';
import userService from '../services/userService';
import complaintService from '../services/complaintService';
import notificationService from '../services/notificationService';
import NotificationPanel from '../components/NotificationPanel';

type SortType = 'votes' | 'newest' | 'oldest';
type StatusFilterType = 'all' | 'pending' | 'in-progress' | 'resolved' | 'rejected';

const DOMAIN_OPTIONS = [
  'all',
  'Maintenance',
  'Cleanliness',
  'Food',
  'Internet',
  'Security'
] as const;
type DomainFilterType = typeof DOMAIN_OPTIONS[number];

const StudentDashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allComplaints, setAllComplaints] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortType, setSortType] = useState<SortType>('votes');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [domainFilter, setDomainFilter] = useState<DomainFilterType>('all');

  const fetchComplaints = async () => {
    try {
      const allComplaintsFetched = await complaintService.getAll();
      setAllComplaints(allComplaintsFetched);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return console.warn('User ID not found.');

      try {
        const user = await userService.getById(userId);
        setCurrentUser(user);
        await fetchComplaints();
        const userNotifications = await notificationService.getNotificationsByUser(user._id);
        setNotifications(userNotifications);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    loadData();
  }, []);

  const handleComplaintSubmitted = () => {
    setIsModalOpen(false);
    fetchComplaints();
  };

  const handleVote = async (id: string) => {
    if (!currentUser) return;
    const userId = currentUser._id;
    const currentComplaint = allComplaints.find(c => c._id === id);
    const votedByArray = currentComplaint?.votedBy || [];
    const hasVoted = votedByArray.includes(userId);

    try {
      await complaintService.voteComplaint(id, userId);
      const updateComplaintsState = (prev: any[]) =>
        prev.map(c => {
          if (c._id !== id) return c;
          return {
            ...c,
            votes: (c.votes || 0) + (hasVoted ? -1 : 1),
            votedBy: hasVoted
              ? (c.votedBy || []).filter((voterId: string) => voterId !== userId)
              : [...(c.votedBy || []), userId],
          };
        });
      setAllComplaints(updateComplaintsState);
    } catch (err) {
      console.error('Failed to register vote:', err);
      alert('Voting failed. Please try again.');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?._id) return;
    try {
      await notificationService.markAllNotificationsAsRead(currentUser._id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const sortComplaints = (complaints: any[]) => {
    const sorted = [...complaints].sort((a, b) => {
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
    return sorted;
  };

  const statusAndDomainFilteredComplaints = allComplaints.filter(c =>
    (statusFilter === 'all' || c.status === statusFilter) &&
    (domainFilter === 'all' || c.domain === domainFilter)
  );

  const studentComplaints = statusAndDomainFilteredComplaints.filter(c => c.submittedBy === currentUser?._id);
  const othersComplaints = statusAndDomainFilteredComplaints.filter(c => c.submittedBy !== currentUser?._id);

  const sortedOwnComplaints = sortComplaints(studentComplaints);
  const sortedOtherComplaints = sortComplaints(othersComplaints);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const totalComplaints = allComplaints.length;
  const resolvedComplaints = allComplaints.filter(c => c.status === 'resolved').length;

  const renderSortIcon = () => {
    switch (sortType) {
      case 'votes': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'newest': return <Clock className="w-4 h-4 text-emerald-600" />;
      case 'oldest': return <List className="w-4 h-4 text-emerald-600" />;
      default: return <TrendingUp className="w-4 h-4 text-emerald-600" />;
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
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-500">Track and manage your complaints</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Submit Complaint</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl transition-opacity duration-300" />
              <div className="relative bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Total Complaints</p>
                    <p className="text-4xl font-bold text-gray-900">{totalComplaints}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl transition-opacity duration-300" />
              <div className="relative bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Resolved Complaints</p>
                    <p className="text-4xl font-bold text-gray-900">{resolvedComplaints}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Grip className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <select
                value={domainFilter}
                onChange={e => setDomainFilter(e.target.value as DomainFilterType)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Domains</option>
                {DOMAIN_OPTIONS.filter(d => d !== 'all').map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as StatusFilterType)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
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
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="votes">Highest Votes</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Your Complaints */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>Your Complaints</span>
              <span className="bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full">
                {sortedOwnComplaints.length}
              </span>
            </h2>
            <div className="space-y-4">
              {sortedOwnComplaints.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <div className="text-5xl mb-3">📝</div>
                  <p className="text-gray-500 text-lg mb-2">No complaints found</p>
                  <p className="text-gray-400 text-sm">Submit a new complaint or adjust your filters</p>
                </div>
              ) : (
                sortedOwnComplaints.map(c => (
                  <ComplaintCard
                    key={c._id}
                    complaint={c}
                    currentUserId={currentUser?._id}
                    onVote={handleVote}
                    isOwner={true}
                  />
                ))
              )}
            </div>
          </div>

          {/* Community Complaints */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>Community Complaints</span>
              <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                {sortedOtherComplaints.length}
              </span>
            </h2>
            <div className="space-y-4">
              {sortedOtherComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No community complaints available</p>
                </div>
              ) : (
                sortedOtherComplaints.map(c => (
                  <ComplaintCard
                    key={c._id}
                    complaint={c}
                    currentUserId={currentUser?._id}
                    onVote={handleVote}
                    isOwner={false}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-28">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-emerald-600 font-medium">{unreadCount} unread</span>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
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

      <ComplaintSubmissionModal
        isOpen={isModalOpen}
        onClose={handleComplaintSubmitted}
      />
    </div>
  );
};

export default StudentDashboard;
import { Complaint } from '../components/ComplaintCard';
import { Notification } from '../components/NotificationPanel';

export const mockComplaints: Complaint[] = [
  {
    id: '1',
    title: 'Broken AC in Room 204',
    description: 'The air conditioning unit in room 204 has been making loud noises and not cooling properly for the past week. It\'s affecting our sleep and study schedule.',
    images: ['ac-1.jpg', 'ac-2.jpg'],
    status: 'pending',
    votes: 15,
    hasVoted: false,
    submittedBy: 'John Doe',
    submittedAt: '2 hours ago',
    domain: 'Maintenance',
    assignedTo: 'Mike Johnson'
  },
  {
    id: '2',
    title: 'Water Leakage in Bathroom',
    description: 'There is continuous water leakage from the ceiling in the common bathroom on 3rd floor. The floor is always wet and slippery.',
    images: ['leak-1.jpg'],
    status: 'in-progress',
    votes: 23,
    hasVoted: true,
    submittedBy: 'Sarah Wilson',
    submittedAt: '1 day ago',
    domain: 'Maintenance'
  },
  {
    id: '3',
    title: 'Poor Food Quality in Mess',
    description: 'The food served in the mess has been consistently poor quality. Many students have complained of stomach issues after eating.',
    images: ['food-1.jpg', 'food-2.jpg', 'food-3.jpg'],
    status: 'resolved',
    votes: 45,
    hasVoted: false,
    submittedBy: 'Alex Kumar',
    submittedAt: '3 days ago',
    domain: 'Food',
    assignedTo: 'Chef Manager'
  },
  {
    id: '4',
    title: 'WiFi Connection Issues',
    description: 'Internet connection has been very slow and frequently disconnecting in the west wing rooms. Unable to attend online classes properly.',
    images: [],
    status: 'pending',
    votes: 32,
    hasVoted: true,
    submittedBy: 'Emma Thompson',
    submittedAt: '5 hours ago',
    domain: 'Internet'
  },
  {
    id: '5',
    title: 'Dirty Common Areas',
    description: 'The common lounge and study areas are not being cleaned regularly. There\'s dust and trash accumulating.',
    images: ['clean-1.jpg'],
    status: 'rejected',
    votes: 8,
    hasVoted: false,
    submittedBy: 'David Chen',
    submittedAt: '1 week ago',
    domain: 'Cleanliness'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Complaint Resolved',
    message: 'Your complaint about "Poor Food Quality in Mess" has been resolved.',
    timestamp: '10 minutes ago',
    isRead: false
  },
  {
    id: '2',
    type: 'info',
    title: 'Status Update',
    message: 'Your complaint "Broken AC in Room 204" is now being processed.',
    timestamp: '2 hours ago',
    isRead: false
  },
  {
    id: '3',
    type: 'warning',
    title: 'Pending Review',
    message: 'Your recent complaint requires additional information.',
    timestamp: '1 day ago',
    isRead: true
  },
  {
    id: '4',
    type: 'error',
    title: 'Complaint Rejected',
    message: 'Your complaint "Dirty Common Areas" has been rejected due to insufficient evidence.',
    timestamp: '2 days ago',
    isRead: true
  },
  {
    id: '5',
    type: 'info',
    title: 'New Admin Assigned',
    message: 'Mike Johnson has been assigned to handle maintenance complaints.',
    timestamp: '3 days ago',
    isRead: true
  }
];

export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@hostel.edu',
    role: 'student',
    room: '204',
    category: undefined,
    complaintsSubmitted: 5,
    status: 'active'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@hostel.edu',
    role: 'student',
    room: '312',
    category: undefined,
    complaintsSubmitted: 3,
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@hostel.edu',
    role: 'admin',
    room: '-',
    category: 'Maintenance',
    complaintsSubmitted: 0,
    status: 'active'
  },
  {
    id: '4',
    name: 'Emma Thompson',
    email: 'emma.thompson@hostel.edu',
    role: 'student',
    room: '156',
    category: undefined,
    complaintsSubmitted: 2,
    status: 'active'
  }
];
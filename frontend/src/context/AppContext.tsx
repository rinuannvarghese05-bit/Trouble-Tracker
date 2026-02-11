import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'superadmin';
  room?: string;
  category?: string;
  complaintsSubmitted?: number;
  status: 'active' | 'inactive';
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  images: string[];
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  votes: number;
  votedBy: string[];
  submittedBy: string;
  submittedAt: string;
  domain: string;
  assignedTo?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetUsers?: string[];
}

interface AppState {
  currentUser: User | null;
  users: User[];
  complaints: Complaint[];
  notifications: Notification[];
}

type AppAction =
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'ADD_COMPLAINT'; payload: Complaint }
  | { type: 'UPDATE_COMPLAINT'; payload: { id: string; updates: Partial<Complaint> } }
  | { type: 'VOTE_COMPLAINT'; payload: { id: string; userId: string } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

const initialState: AppState = {
  currentUser: null,
  users: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@hostel.edu',
      role: 'student',
      room: '204',
      complaintsSubmitted: 5,
      status: 'active'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@hostel.edu',
      role: 'student',
      room: '312',
      complaintsSubmitted: 3,
      status: 'active'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@hostel.edu',
      role: 'admin',
      category: 'Maintenance',
      complaintsSubmitted: 0,
      status: 'active'
    },
    {
      id: '4',
      name: 'Super Admin',
      email: 'superadmin@hostel.edu',
      role: 'superadmin',
      complaintsSubmitted: 0,
      status: 'active'
    }
  ],
  complaints: [
    {
      id: '1',
      title: 'Broken AC in Room 204',
      description: 'The air conditioning unit in room 204 has been making loud noises and not cooling properly for the past week.',
      images: ['ac-1.jpg', 'ac-2.jpg'],
      status: 'pending',
      votes: 15,
      votedBy: ['2', '3'],
      submittedBy: '1',
      submittedAt: '2 hours ago',
      domain: 'Maintenance',
      assignedTo: 'Mike Johnson'
    },
    {
      id: '2',
      title: 'Water Leakage in Bathroom',
      description: 'There is continuous water leakage from the ceiling in the common bathroom on 3rd floor.',
      images: ['leak-1.jpg'],
      status: 'in-progress',
      votes: 23,
      votedBy: ['1', '4'],
      submittedBy: '2',
      submittedAt: '1 day ago',
      domain: 'Maintenance'
    },
    {
      id: '3',
      title: 'Poor Food Quality in Mess',
      description: 'The food served in the mess has been consistently poor quality.',
      images: ['food-1.jpg', 'food-2.jpg'],
      status: 'resolved',
      votes: 45,
      votedBy: ['1', '2', '3'],
      submittedBy: '1',
      submittedAt: '3 days ago',
      domain: 'Food'
    }
  ],
  notifications: [
    {
      id: '1',
      type: 'success',
      title: 'Complaint Resolved',
      message: 'Your complaint about "Poor Food Quality in Mess" has been resolved.',
      timestamp: '10 minutes ago',
      isRead: false,
      targetUsers: ['1']
    },
    {
      id: '2',
      type: 'info',
      title: 'Status Update',
      message: 'Your complaint "Broken AC in Room 204" is now being processed.',
      timestamp: '2 hours ago',
      isRead: false,
      targetUsers: ['1']
    }
  ]
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    
    case 'ADD_COMPLAINT':
      return { ...state, complaints: [action.payload, ...state.complaints] };
    
    case 'UPDATE_COMPLAINT':
      return {
        ...state,
        complaints: state.complaints.map(complaint =>
          complaint.id === action.payload.id
            ? { ...complaint, ...action.payload.updates }
            : complaint
        )
      };
    
    case 'VOTE_COMPLAINT':
      return {
        ...state,
        complaints: state.complaints.map(complaint => {
          if (complaint.id === action.payload.id) {
            const hasVoted = complaint.votedBy.includes(action.payload.userId);
            return {
              ...complaint,
              votes: hasVoted ? complaint.votes - 1 : complaint.votes + 1,
              votedBy: hasVoted
                ? complaint.votedBy.filter(id => id !== action.payload.userId)
                : [...complaint.votedBy, action.payload.userId]
            };
          }
          return complaint;
        })
      };
    
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.updates }
            : notification
        )
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
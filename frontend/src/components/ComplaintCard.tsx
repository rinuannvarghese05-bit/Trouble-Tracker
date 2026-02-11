import React, { useEffect, useState } from 'react';
import {
  ThumbsUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  User,
  Tag, // Importing Tag icon for the domain for better clarity
} from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { useAppContext } from '../context/AppContext';
import userService from '../services/userService';

// 🚀 MODIFICATION 1: Update the Complaint interface
interface Complaint {
  _id: string;
  title: string;
  description: string;
  status: string;
  submittedBy: string;
  submittedAt: string;
  domain: string;
  assignedTo?: string | null; // Can be null
  votedBy?: string[];
  votes?: number;
  images?: string[];
  // NOTE: assignedToName is usually derived in the parent or fetched here, 
  // but to keep the interface simple, we'll fetch it here.
}

interface ComplaintCardProps {
  complaint: Complaint;
  currentUserId: string;
  showAdminControls?: boolean;
  showDeleteControl?: boolean;
  onVote?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
  onAssign?: (id: string) => void; // This should be updated in the parent component to pass the full complaint
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  currentUserId,
  showAdminControls = false,
  showDeleteControl = false,
  onVote,
  onStatusChange,
  onDelete,
  onAssign,
}) => {
  const { state } = useAppContext();
  const [submittedByName, setSubmittedByName] = useState('Unknown');
  const [assignedAdminName, setAssignedAdminName] = useState<string | null>(null); // 🚀 NEW STATE
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false); // 🚀 NEW STATE

  useEffect(() => {
    const fetchUserNames = async () => {
        setIsLoadingUser(true);
        setIsLoadingAdmin(!!complaint.assignedTo); // Only load admin name if assignedTo exists

      try {
        // Fetch Submitted By User Name
        const submitter = await userService.getById(complaint.submittedBy);
        setSubmittedByName(submitter.name);

        // 🚀 MODIFICATION 2: Fetch Assigned Admin Name
        if (complaint.assignedTo) {
            const admin = await userService.getById(complaint.assignedTo);
            setAssignedAdminName(admin.name);
        } else {
            setAssignedAdminName(null);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setSubmittedByName('Unknown User');
        setAssignedAdminName('Error Fetching Admin');
      } finally {
        setIsLoadingUser(false);
        setIsLoadingAdmin(false);
      }
    };
    
    // Rerun whenever submittedBy or assignedTo changes
    fetchUserNames();
  }, [complaint.submittedBy, complaint.assignedTo]); 

  const isAdmin = state.currentUser?.role === 'admin' || state.currentUser?.role === 'superadmin';
  
  const isAssigned = !!complaint.assignedTo;
  // Check if the complaint is in a final, closed state
  const isClosed = complaint.status === 'resolved' || complaint.status === 'rejected'; 

  let hasVoted = complaint.votedBy?.includes(currentUserId) ?? false;
  if (isAdmin) {
    hasVoted = false;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'info';
      case 'resolved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card hover className="overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 flex-1">{complaint.title}</h3>
          <div className="flex items-center gap-2 ml-4">
            <Badge variant={getStatusColor(complaint.status)}>
              {getStatusIcon(complaint.status)}
              {complaint.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">{complaint.description}</p>
        {complaint.images && complaint.images.length > 0 && (
          <div className="complaint-images mb-4">
            {complaint.images.map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`complaint-img-${idx}`}
                style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }}
              />
            ))}
            {/* Minimal styling for display; in a real app, use Tailwind classes */}
          </div>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" /> Submitted By: 
              <span className="font-medium text-slate-700">
                {isLoadingUser ? 'Loading...' : submittedByName}
              </span>
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3" /> Domain: 
              <span className="font-medium text-slate-700">{complaint.domain}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Submitted At: 
              <span className="font-medium text-slate-700">{new Date(complaint.submittedAt).toLocaleDateString()}</span>
          </span>
        </div>
        
        {/* 🚀 MODIFICATION 3: Display Assigned Admin Name */}
        <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
            <User className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Assigned Staff:</span>
            {isLoadingAdmin ? (
                <span className="text-sm text-slate-500">Loading...</span>
            ) : isAssigned && assignedAdminName ? (
                <span className="font-semibold text-blue-600">
                    {assignedAdminName}
                </span>
            ) : (
                <span className="text-yellow-600">Unassigned</span>
            )}
        </div>
      </div>
      <div className="p-4 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => complaint._id && onVote?.(complaint._id)}
            variant={hasVoted ? 'primary' : 'ghost'}
            size="sm"
            className={hasVoted ? 'shadow-md' : ''}
            disabled={isAdmin}
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="font-semibold">{complaint.votes ?? 0}</span>
          </Button>
        </div>
        {showAdminControls && isAdmin && (
          <div className="flex items-center gap-2">
            <select
              value={complaint.status}
              onChange={(e) =>
                complaint._id && onStatusChange?.(complaint._id, e.target.value)
              }
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            {/* 🚀 MODIFICATION 4: Conditionally Render Assign Button */}
            {
              // Show button only if NOT assigned AND NOT resolved/rejected
              !isAssigned && !isClosed && (
              <Button
                onClick={() => complaint._id && onAssign?.(complaint._id)}
                variant="primary"
                size="sm"
              >
                <Edit className="w-4 h-4" /> Assign Admin
              </Button>
            )}

          </div>
        )}
        {showDeleteControl && (
          <Button
            onClick={() => complaint._id && onDelete?.(complaint._id)}
            variant="danger"
            size="sm"
            className="ml-auto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ComplaintCard;
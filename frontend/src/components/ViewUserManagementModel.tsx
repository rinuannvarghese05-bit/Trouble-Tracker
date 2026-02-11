import React from 'react';
import { User } from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  category?: string | null;
  room?: string | null;
  complaintsSubmitted: number;
  status: 'active' | 'inactive';
}

interface ViewUserManagementModelProps {
  users: UserData[];
  loading: boolean;
  currentUserId?: string; 
}

// 🚀 UPDATED UTILITY COMPONENT: RoleBadge now only prints the generic role 🚀
const RoleBadge = ({ role }: { role: string }) => {
    // Choose colors based on the generic role
    let bgColor, textColor;
    let roleDisplay;

    // Standardize the display text
    if (role === 'admin') {
        roleDisplay = 'Admin';
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
    } else {
        roleDisplay = 'Student';
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
    }

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
            {roleDisplay}
        </span>
    );
};

const ViewUserManagementModel: React.FC<ViewUserManagementModelProps> = ({ users, loading, currentUserId }) => {
    
    // Sorting logic: prioritize current user, then role, then name
    const sortedUsers = [...users].sort((a, b) => {
        // 1. Prioritize the current user
        if (currentUserId) {
            if (a._id === currentUserId) return -1;
            if (b._id === currentUserId) return 1;
        }

        // 2. Sort by role (Admin > Student)
        // NOTE: The sorting still uses the category to distinguish between different admin types for grouping,
        // but the displayed badge will only show 'Admin'.
        const roleOrder = (user: UserData) => {
            if (user.category === 'SuperAdmin') return 1; // SuperAdmin is still highest for sorting
            if (user.role === 'admin') return 2;
            return 3;
        };

        if (roleOrder(a) !== roleOrder(b)) {
            return roleOrder(a) - roleOrder(b);
        }

        // 3. Finally, sort alphabetically by name
        return a.name.localeCompare(b.name);
    });

    if (loading) return (
        <div className="text-center py-10 text-gray-500 flex justify-center items-center gap-2">
            <User className="w-5 h-5 animate-pulse" /> Loading user data...
        </div>
    );

    if (sortedUsers.length === 0) return <p className="text-center text-gray-500 mt-6">No users found.</p>;

    return (
        <div className="overflow-x-auto shadow border border-gray-100 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {/* Added ID column */}
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name/Email</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location/Room</th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Complaints</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {/* No Actions column, maintaining read-only status */}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedUsers.map((user) => (
                        <tr 
                            key={user._id} 
                            // 🚨 Highlighting logic applied here
                            className={user._id === currentUserId ? "bg-blue-50/70 border-l-4 border-blue-500" : ""}
                        >
                            {/* ID (Truncated) */}
                            <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-400 max-w-[100px] truncate" title={user._id}>
                                {user._id.substring(user._id.length - 8)}...
                            </td>
                            {/* Name/Email */}
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.name} 
                                {/* 'You' badge applied here */}
                                {user._id === currentUserId && (
                                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500 text-white">
                                        You
                                    </span>
                                )}
                                <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                            </td>
                            {/* Role */}
                            {/* 🚨 Passed only 'role' to the updated RoleBadge */}
                            <td className="px-3 py-4 whitespace-nowrap">
                                <RoleBadge role={user.role} /> 
                            </td>
                            {/* Category */}
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.category || 'N/A'}
                            </td>
                            {/* Location/Room */}
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.room || 'N/A'}
                            </td>
                            {/* Complaints Submitted (Centered) */}
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700">
                                {user.complaintsSubmitted}
                            </td>
                            {/* Status (Badge style) */}
                            <td className="px-3 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.status}
                                </span>
                            </td>
                            {/* Actions column removed */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ViewUserManagementModel;
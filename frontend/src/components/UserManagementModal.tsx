import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, User, Eye, EyeOff, Edit, Loader2 } from 'lucide-react';

// Define the shape of user data passed for editing
interface UserData {
  _id?: string; // Optional for new users, required for editing
  name: string;
  email: string;
  role: 'admin' | 'student';
  category?: string;
  room?: string;
  password?: string; // Optional for edit, as you might not change it
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  // userToEdit will be null for 'Add' mode and contain data for 'Edit' mode
  userToEdit: UserData | null; 
  // Unified handler for both adding and editing. This function is expected to be asynchronous.
  onSaveUser: (user: UserData) => Promise<UserData>; 
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onSaveUser,
}) => {
  // Determine if we are in Edit mode
  const isEditMode = !!userToEdit?._id; 
  
  // State variables
  const [activeTab, setActiveTab] = useState<'admin' | 'student'>('admin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [category, setCategory] = useState('');
  const [room, setRoom] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const adminCategories = [
    'Maintenance',
    'Cleanliness',
    'Food',
    'Internet',
    'Security',
    'Super Admin',
  ];

  // Populate form fields and reset state when the modal opens/closes
  useEffect(() => {
    if (isOpen) {
        setErrorMessage(null); // Clear previous errors
        
        if (userToEdit) {
            // Edit Mode: Populate fields
            setName(userToEdit.name);
            setEmail(userToEdit.email);
            // Ensure the active tab matches the user's existing role in edit mode
            const role = userToEdit.role || 'admin'; 
            setActiveTab(role);
            setPassword(''); // Do not pre-fill password for security
            
            if (role === 'admin') {
                // Handle Super Admin mapping for the select box
                const cat = userToEdit.category === 'superadmin' ? 'Super Admin' : (userToEdit.category || '');
                setCategory(cat);
                setRoom('');
            } else {
                setRoom(userToEdit.room || '');
                setCategory('');
            }
        } else {
            // Add Mode: Reset state
            setName('');
            setEmail('');
            setPassword('');
            setCategory('');
            setRoom('');
            setActiveTab('admin');
        }
    } else {
        // Optionally reset all state when closing
        setIsLoading(false);
    }
  }, [isOpen, userToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Clear any previous error messages

    // Basic validation
    if (!name.trim() || !email.trim()) {
        setErrorMessage('Name and Email are required.');
        return;
    }
    if (!isEditMode && !password.trim()) {
        setErrorMessage('Password is required for new users.');
        return;
    }
    if (activeTab === 'admin' && !category) {
        setErrorMessage('Admin Category is required.');
        return;
    }
    if (activeTab === 'student' && !room) {
        setErrorMessage('Room Number is required for students.');
        return;
    }

    setIsLoading(true);

    // Build base payload
    let userPayload: Partial<UserData> = { name, email };

    // Add password only if it's set (for both add and edit if password field is used)
    if (password.trim()) {
      userPayload.password = password;
    }

    // Add role-specific data
    if (activeTab === 'admin') {
      userPayload.role = 'admin';
      // Map 'Super Admin' display back to 'superadmin' payload
      userPayload.category = category === 'Super Admin' ? 'superadmin' : category; 
      userPayload.room = undefined; // Ensure room is not sent
    } else {
      userPayload.role = 'student';
      userPayload.room = room;
      userPayload.category = undefined; // Ensure category is not sent
    }

    if (isEditMode && userToEdit?._id) {
        // EDIT Operation: Add the user ID to the payload
        userPayload._id = userToEdit._id;
    } 

    try {
      // Call the unified onSaveUser handler (from the parent component)
      await onSaveUser(userPayload as UserData); 
      
      // Success: Reset form state and close modal
      setName('');
      setEmail('');
      setPassword('');
      setCategory('');
      setRoom('');
      setShowPassword(false);
      onClose();
    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'edit' : 'add'} user:`, err);
      // Replace alert() with UI message
      setErrorMessage(`Failed to ${isEditMode ? 'edit' : 'add'} user. Check the console for details.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const saveButtonText = isEditMode 
    ? (isLoading ? 'Saving...' : 'Save Changes') 
    : (isLoading ? 'Adding...' : `Add ${activeTab === 'admin' ? 'Admin' : 'Student'}`);
  
  const iconColorClass = activeTab === 'admin' ? 'text-blue-600' : 'text-green-600';

  return (
    // Tailwind CSS loaded via external script in the hosting environment
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all scale-100 ease-out duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {isEditMode ? <Edit className={`w-6 h-6 ${iconColorClass}`} /> : <UserPlus className={`w-6 h-6 ${iconColorClass}`} />}
            {isEditMode ? 'Edit User Details' : 'Add New User'}
          </h2>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message Display */}
        {errorMessage && (
            <div className="p-4 mx-6 mt-4 text-sm text-red-800 bg-red-100 rounded-lg border border-red-300 transition-opacity duration-300" role="alert">
                <span className="font-semibold mr-1">Error:</span> {errorMessage}
            </div>
        )}

        {/* Tabs (Disabled in Edit Mode to prevent easy role change) */}
        <div className="flex border-b border-gray-200 mx-6 mt-4 rounded-t-lg overflow-hidden">
          <button
            onClick={() => setActiveTab('admin')}
            disabled={isEditMode || isLoading} // Disable tab switching in edit mode or when loading
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'admin'
                ? 'text-white border-b-2 border-blue-600 bg-blue-600 shadow-md'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 bg-white'
            } ${isEditMode && 'opacity-60 cursor-not-allowed'}`}
          >
            <Shield className="w-4 h-4" /> Admin
          </button>
          <button
            onClick={() => setActiveTab('student')}
            disabled={isEditMode || isLoading} // Disable tab switching in edit mode or when loading
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'student'
                ? 'text-white border-b-2 border-green-600 bg-green-600 shadow-md'
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-50 bg-white'
            } ${isEditMode && 'opacity-60 cursor-not-allowed'}`}
          >
            <User className="w-4 h-4" /> Student
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50"
              placeholder="Enter full name"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200 disabled:text-gray-500"
              placeholder="Enter email address"
              required
              disabled={isEditMode || isLoading} // Prevent editing email in edit mode (and when loading)
            />
            {isEditMode && <p className="mt-1 text-xs text-gray-500">Email addresses cannot be changed after creation.</p>}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {isEditMode ? '(Leave blank to keep existing)' : <span className="text-red-500">*</span>}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10 disabled:bg-gray-50"
              placeholder={isEditMode ? 'New password (optional)' : 'Enter password'}
              required={!isEditMode} // Only required if adding
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-500 hover:text-gray-700 p-1"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {activeTab === 'admin' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Category <span className="text-red-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50"
                required
                disabled={isLoading}
              >
                <option value="">Select category</option>
                {adminCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:bg-gray-50"
                placeholder="e.g., 204"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-semibold shadow-md ${
                activeTab === 'admin' 
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditMode ? (
                  <Edit className="w-4 h-4" />
              ) : (
                  <UserPlus className="w-4 h-4" />
              )}
              {saveButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;

// src/pages/Profile.jsx
import { useState } from 'react';
import { useAdminAuth } from '../services/auth/AdminAuthService';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAdminAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    // Call your update API here
    updateUser(formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user?.name || 'Admin User'}</h1>
              <p className="text-blue-100">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{user?.name || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-semibold">
                  {user?.is_superuser ? 'Super Admin' : user?.is_staff ? 'Staff' : 'Admin'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Last Login</p>
                <p className="font-semibold">
                  {user?.last_login 
                    ? new Date(user.last_login).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          {user?.permissions && user.permissions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

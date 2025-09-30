'use client'

import { useState } from 'react'
import { Users, Search, Filter, MoreVertical, UserPlus, Mail, Phone, Calendar } from 'lucide-react'

// Mock data for testing
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    role: 'Customer',
    joinDate: '2024-01-15',
    orders: 12,
    totalSpent: '$1,234.56'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    role: 'Premium',
    joinDate: '2024-02-20',
    orders: 8,
    totalSpent: '$2,456.78'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1 (555) 345-6789',
    status: 'inactive',
    role: 'Customer',
    joinDate: '2023-12-10',
    orders: 3,
    totalSpent: '$456.23'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '+1 (555) 456-7890',
    status: 'active',
    role: 'VIP',
    joinDate: '2024-01-05',
    orders: 25,
    totalSpent: '$5,678.90'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    phone: '+1 (555) 567-8901',
    status: 'pending',
    role: 'Customer',
    joinDate: '2024-03-01',
    orders: 1,
    totalSpent: '$89.99'
  },
  {
    id: 6,
    name: 'Lisa Davis',
    email: 'lisa.davis@example.com',
    phone: '+1 (555) 678-9012',
    status: 'active',
    role: 'Premium',
    joinDate: '2024-02-14',
    orders: 15,
    totalSpent: '$3,234.56'
  }
]

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      Customer: 'bg-blue-100 text-blue-800',
      Premium: 'bg-purple-100 text-purple-800',
      VIP: 'bg-gold-100 text-gold-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Users</h1>
          <p className="text-slate-600 mt-1">Manage your platform users</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">{mockUsers.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Users</p>
              <p className="text-2xl font-bold text-slate-900">{mockUsers.filter(u => u.status === 'active').length}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Premium Users</p>
              <p className="text-2xl font-bold text-slate-900">{mockUsers.filter(u => u.role === 'Premium' || u.role === 'VIP').length}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">New This Month</p>
              <p className="text-2xl font-bold text-slate-900">3</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card-modern p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="input-modern pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="input-modern w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-modern overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      {user.email}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-slate-400" />
                      {user.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {user.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {user.totalSpent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

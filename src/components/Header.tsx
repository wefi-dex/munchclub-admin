'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { useState } from 'react'

export function Header() {
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    return (
        <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-slate-200/50 sticky top-0 z-10">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 group">
                        <Menu className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </button>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="w-64 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white/50 backdrop-blur-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            onFocus={() => setIsSearchOpen(true)}
                            onBlur={() => setIsSearchOpen(false)}
                        />
                        {isSearchOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-slate-200 p-3 animate-slide-up z-20">
                                <p className="text-xs text-slate-500 mb-2">Recent searches</p>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer">
                                        <Search className="w-3 h-3 text-slate-400" />
                                        <span className="text-sm text-slate-700">Users</span>
                                    </div>
                                    <div className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer">
                                        <Search className="w-3 h-3 text-slate-400" />
                                        <span className="text-sm text-slate-700">Orders</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 relative group">
                        <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            3
                        </span>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-white">A</span>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-slate-900">Admin User</p>
                            <p className="text-xs text-slate-500">Administrator</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

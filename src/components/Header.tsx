'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { useState } from 'react'

export function Header() {
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    return (
        <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-slate-200/50">
            <div className="flex items-center justify-between px-8 py-6">
                {/* Left Section */}
                <div className="flex items-center space-x-6">
                    <button className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 group">
                        <Menu className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </button>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="input-modern w-80 pl-12 pr-4 py-3 text-sm placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                            onFocus={() => setIsSearchOpen(true)}
                            onBlur={() => setIsSearchOpen(false)}
                        />
                        {isSearchOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 animate-slide-up">
                                <p className="text-sm text-slate-500">Recent searches</p>
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                        <Search className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-700">Users</span>
                                    </div>
                                    <div className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                        <Search className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-700">Orders</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-6">
                    {/* Notifications */}
                    <button className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 relative group">
                        <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            3
                        </span>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">A</span>
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

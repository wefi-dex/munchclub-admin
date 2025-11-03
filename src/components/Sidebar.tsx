'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    Home,
    Users,
    ShoppingCart,
    BookOpen,
    ChefHat,
    CreditCard,
    Tag,
    LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Books', href: '/books', icon: BookOpen },
    { name: 'Recipes', href: '/recipes', icon: ChefHat },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Coupons', href: '/coupons', icon: Tag },
]

export function Sidebar() {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="flex flex-col w-72 bg-white/90 backdrop-blur-sm shadow-2xl border-r border-slate-200/50" suppressHydrationWarning>
            {/* Logo Section */}
            <div className="flex items-center justify-center h-20 px-6 gradient-primary" suppressHydrationWarning>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🍽️</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Munchclub</h1>
                        <p className="text-xs text-white/80">Admin Dashboard</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-8 space-y-3" suppressHydrationWarning>
                {navigation.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'sidebar-item group',
                                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                            )}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {mounted ? (
                                <item.icon className="w-6 h-6 mr-4 transition-transform group-hover:scale-110" />
                            ) : (
                                <div className="w-6 h-6 mr-4" />
                            )}
                            <span className="font-medium text-base">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-bounce-gentle"></div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile Section */}
            <div className="p-6 border-t border-slate-200/50 bg-slate-50/50">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-lg font-bold text-white">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">Admin User</p>
                        <p className="text-xs text-slate-500 truncate">admin@themunchclub.com</p>
                    </div>
                </div>
                <button className="flex items-center w-full px-5 py-3.5 text-base text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-all duration-200 group">
                    {mounted ? (
                        <LogOut className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                    ) : (
                        <div className="w-5 h-5 mr-3" />
                    )}
                    <span className="font-medium">Sign out</span>
                </button>
            </div>
        </div>
    )
}

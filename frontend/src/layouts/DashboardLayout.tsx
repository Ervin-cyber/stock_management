import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Package, Building2, ArrowRightLeft, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Products', path: '/products', icon: Package },
        { name: 'Warehouses', path: '/warehouses', icon: Building2 },
        { name: 'Stock Movements', path: '/movements', icon: ArrowRightLeft },
    ];

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
            
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-20 shadow-md">
                <div className="flex items-center space-x-2">
                    <Package className="h-6 w-6 text-blue-500" />
                    <span className="text-xl font-bold tracking-wider">STOCKFLOW</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 focus:outline-none">
                    {isSidebarOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                </button>
            </div>

            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity"
                    onClick={closeSidebar}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col
                transform transition-transform duration-300 ease-in-out
                md:static md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="p-6 hidden md:flex items-center space-x-3 text-white">
                    <Package className="h-8 w-8 text-blue-500" />
                    <span className="text-2xl font-bold tracking-wider">STOCKFLOW</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0 overflow-y-auto pt-20 md:pt-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={closeSidebar}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                                        isActive 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <div className="flex flex-col mb-4 px-2">
                        <span className="text-sm font-semibold text-white">{user?.name}</span>
                        <span className="text-xs text-slate-500">{user?.role}</span>
                    </div>
                    <Button 
                        variant="destructive" 
                        className="w-full justify-start hover:bg-red-600" 
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet /> 
                </div>
            </main>

        </div>
    );
}
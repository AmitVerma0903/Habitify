import { useState, useEffect } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { Home, ListTodo, BarChart2, Calendar, Settings, Bell, Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "../lib/AuthContext"
import { api } from "../lib/api"

export default function MainLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [allHabits, setAllHabits] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const fetchAllHabits = async () => {
    try {
      const { data } = await api.get("/habits")
      setAllHabits(data)
    } catch (error) {
      console.error("Failed to fetch habits for search", error)
    }
  }

  useEffect(() => {
    if (user) fetchAllHabits()
  }, [user])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      return
    }
    const filtered = allHabits.filter(h => 
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setSearchResults(filtered)
  }, [searchQuery, allHabits])
  
  const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: ListTodo, label: "Habits", href: "/habits" },
    { icon: BarChart2, label: "Analytics", href: "/analytics" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
  ]

  return (
    <div className="flex h-screen bg-[#0E0E11] text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800/50 bg-[#121216] hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Habitify</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.href} to={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800/50">
          <Link to="/settings">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium text-sm">Settings</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-800/50 bg-[#121216]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search habits..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => setShowResults(true)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-zinc-200 placeholder:text-zinc-500"
              />
              
              {/* Search Results Dropdown */}
              {showResults && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#121216] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((habit) => (
                        <Link 
                          key={habit.id} 
                          to="/habits" 
                          onClick={() => {
                            setShowResults(false)
                            setSearchQuery("")
                          }}
                        >
                          <div className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 rounded-lg transition-colors group">
                            <span className="text-xl">{habit.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{habit.title}</p>
                              <p className="text-[10px] text-zinc-500 uppercase font-bold">{habit.category}</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-zinc-500 italic">
                        No habits found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-zinc-400 hover:text-zinc-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border border-[#121216]" />
            </button>
            <Link to="/habits">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 rounded-full px-5 hidden sm:flex">
                <Plus className="w-4 h-4" />
                New Habit
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right hidden lg:block mr-2">
                <span className="block text-sm font-medium text-zinc-200">{user?.name}</span>
                <span className="block text-xs text-zinc-500">{user?.email}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden cursor-pointer">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="User" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={logout}
                className="text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-red-500/20 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-500/30 ml-2"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

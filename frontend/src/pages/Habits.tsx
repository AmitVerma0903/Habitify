import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, ListTodo, Loader2, X } from "lucide-react"
import { api } from "../lib/api"

interface Habit {
  id: number
  title: string
  category: string
  color: string
  icon: string
  frequency: string
}

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form State
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Health")
  const [color, setColor] = useState("text-emerald-400")
  const [icon, setIcon] = useState("🏃‍♂️")

  const fetchHabits = async () => {
    try {
      const { data } = await api.get("/habits")
      setHabits(data)
    } catch (error) {
      console.error("Failed to fetch habits", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post("/habits", {
        title,
        category,
        color,
        icon,
        frequency: "daily"
      })
      setIsModalOpen(false)
      setTitle("")
      fetchHabits()
    } catch (error) {
      console.error("Failed to create habit", error)
    }
  }

  const colorOptions = [
    { value: "text-emerald-400", label: "Emerald" },
    { value: "text-blue-400", label: "Blue" },
    { value: "text-indigo-400", label: "Indigo" },
    { value: "text-purple-400", label: "Purple" },
    { value: "text-orange-400", label: "Orange" },
    { value: "text-rose-400", label: "Rose" },
  ]

  const categoryIcons: Record<string, string[]> = {
    Health: ["🏃‍♂️", "💧", "🥗", "🧘‍♀️", "😴"],
    Learning: ["📚", "🧠", "🎓", "✍️"],
    Productivity: ["💻", "🎯", "⏱️", "📅"],
    Finance: ["💰", "📉", "💳"]
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Manage Habits</h1>
          <p className="text-zinc-400 mt-1">Create, edit, and organize your daily routines.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Habit
        </button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      ) : habits.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121216] rounded-2xl border border-zinc-800/50 p-12 flex flex-col items-center justify-center text-center shadow-xl"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
            <ListTodo className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Habits Found</h2>
          <p className="text-zinc-400 max-w-md mx-auto mb-6">
            You haven't created any habits yet. Start by adding a new habit to track your daily progress and build a better routine.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-6 py-2.5 rounded-xl font-medium transition-colors border border-indigo-500/20"
          >
            Add Your First Habit
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {habits.map((habit) => {
            const bgClass = `bg-${habit.color.split('-')[1]}-400/10`;
            return (
              <div key={habit.id} className="bg-[#121216] p-6 rounded-2xl border border-zinc-800/50 shadow-xl flex items-start gap-4 hover:border-zinc-700 transition-colors">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bgClass.includes('undefined') ? 'bg-indigo-400/10' : bgClass}`}>
                  {habit.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{habit.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs uppercase font-bold tracking-wider px-2 py-1 rounded flex items-center ${habit.color} ${bgClass.includes('undefined') ? 'bg-indigo-400/10' : bgClass}`}>
                      {habit.category}
                    </span>
                    <span className="text-zinc-500 text-sm capitalize">{habit.frequency}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </motion.div>
      )}

      {/* Create Habit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121216] w-full max-w-lg rounded-2xl border border-zinc-800/50 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
                <h2 className="text-xl font-bold text-white">Create New Habit</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateHabit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Habit Title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                    placeholder="e.g. Read 10 Pages"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value)
                        setIcon(categoryIcons[e.target.value][0]) // Default icon for new category
                      }}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 appearance-none"
                    >
                      {Object.keys(categoryIcons).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Color Theme</label>
                    <select 
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 appearance-none"
                    >
                      {colorOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Select Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {categoryIcons[category].map(ico => (
                      <button
                        key={ico}
                        type="button"
                        onClick={() => setIcon(ico)}
                        className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl border transition-all ${
                          icon === ico 
                            ? 'bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30' 
                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
                        }`}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800/50">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Save Habit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

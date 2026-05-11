import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Flame, CheckCircle2, Circle, Trophy, BrainCircuit, Activity, Loader2 } from "lucide-react"
import { useAuth } from "../lib/AuthContext"
import { api } from "../lib/api"

interface Habit {
  id: number
  title: string
  category: string
  color: string
  icon: string
  frequency: string
  completed: boolean
}

export default function Dashboard() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchHabits = async () => {
    try {
      const { data } = await api.get("/habits/today")
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

  const handleComplete = async (habitId: number) => {
    try {
      // Optimistic update
      setHabits(prev => prev.map(h => h.id === habitId ? { ...h, completed: true } : h))
      await api.post(`/habits/${habitId}/log`, { status: "completed", notes: "" })
    } catch (error) {
      console.error("Failed to complete habit", error)
      // Revert optimistic update
      fetchHabits()
    }
  }

  const completedCount = habits.filter(h => h.completed).length
  const totalCount = habits.length
  const remainingCount = totalCount - completedCount
  const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : 'evening'}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-zinc-400 mt-1">
            {remainingCount > 0 
              ? `You have ${remainingCount} habit${remainingCount !== 1 ? 's' : ''} left for today. Keep the streak alive!`
              : "All habits completed for today. Great job!"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-xl border border-indigo-500/20">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-semibold">0 Day Streak</span>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Main Column - Today's Habits */}
        <div className="md:col-span-2 space-y-6">
          <motion.div variants={item} className="bg-[#121216] rounded-2xl border border-zinc-800/50 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Today's Habits</h2>
              <span className="text-sm font-medium text-zinc-400 bg-zinc-800/50 px-3 py-1 rounded-full">
                {completedCount} / {totalCount} Completed
              </span>
            </div>
            <div className="p-4 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : habits.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  No habits scheduled for today. Go to the Habits page to create one!
                </div>
              ) : (
                habits.map((habit) => (
                  <HabitItem 
                    key={habit.id}
                    title={habit.title} 
                    category={habit.category}
                    completed={habit.completed} 
                    icon={habit.icon}
                    color={habit.color}
                    bg={`bg-${habit.color.split('-')[1]}-400/10`}
                    onComplete={() => handleComplete(habit.id)}
                  />
                ))
              )}
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-[#121216] rounded-2xl border border-zinc-800/50 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6">Consistency Heatmap</h2>
            {/* Mock GitHub-style Heatmap */}
            <div className="flex gap-1 overflow-hidden">
              {Array.from({ length: 30 }).map((_, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, rowIndex) => {
                    const intensity = Math.random()
                    let colorClass = "bg-zinc-800/50" // empty
                    if (intensity > 0.8) colorClass = "bg-indigo-400"
                    else if (intensity > 0.5) colorClass = "bg-indigo-500/70"
                    else if (intensity > 0.2) colorClass = "bg-indigo-600/40"
                    
                    return (
                      <div 
                        key={`${colIndex}-${rowIndex}`} 
                        className={`w-3 h-3 rounded-[2px] ${colorClass} transition-colors hover:ring-1 ring-indigo-300 cursor-pointer`}
                        title="Completed habits"
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Side Column - Analytics & AI Insights */}
        <div className="space-y-6">
          <motion.div variants={item} className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl border border-indigo-500/20 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <BrainCircuit className="w-5 h-5 text-indigo-300" />
              </div>
              <h3 className="text-lg font-semibold text-indigo-100">AI Coach</h3>
            </div>
            <p className="text-indigo-200/80 text-sm leading-relaxed mb-4">
              You're doing great! Try to complete your remaining habits to maintain your momentum. Keep pushing!
            </p>
            <button className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-indigo-200 text-sm font-medium transition-colors">
              View Full Analysis
            </button>
          </motion.div>

          <motion.div variants={item} className="bg-[#121216] rounded-2xl border border-zinc-800/50 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-zinc-400" />
              <h3 className="text-lg font-semibold text-white">Daily Productivity</h3>
            </div>
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-indigo-500 transition-all duration-1000 ease-in-out"
                  strokeDasharray={`${completionPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{completionPercentage}%</span>
                <span className="text-xs text-zinc-400">Score</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-[#121216] rounded-2xl border border-zinc-800/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Milestones</h3>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <span className="text-indigo-400 text-lg">🌱</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">Just Starting</h4>
                  <p className="text-xs text-zinc-500">First steps to success</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function HabitItem({ title, category, completed, icon, color, bg, onComplete }: any) {
  // Tailwind dynamically generated classes for background fallback
  const safeBg = bg.includes('undefined') ? 'bg-indigo-400/10' : bg;
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group hover:shadow-md ${
      completed ? 'bg-zinc-900/30 border-zinc-800/50 opacity-60' : 'bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800/50'
    }`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={completed ? undefined : onComplete}
          disabled={completed}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
          completed ? 'text-indigo-400 cursor-default' : 'text-zinc-500 hover:text-indigo-400 cursor-pointer'
        }`}>
          {completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${safeBg}`}>
            {icon}
          </div>
          <div>
            <h3 className={`font-medium ${completed ? 'text-zinc-400 line-through' : 'text-zinc-100'}`}>{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center ${color} ${safeBg}`}>{category}</span>
            </div>
          </div>
        </div>
      </div>
      {!completed && (
        <button 
          onClick={onComplete}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
        >
          Complete
        </button>
      )}
    </div>
  )
}

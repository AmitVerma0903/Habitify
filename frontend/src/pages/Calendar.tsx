import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"
import { api } from "../lib/api"

interface CompletedHabit {
  id: number
  title: string
  color: string
  icon: string
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<Record<string, CompletedHabit[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const { data } = await api.get("/analytics/calendar")
        setCalendarData(data)
      } catch (error) {
        console.error("Failed to fetch calendar data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCalendarData()
  }, [])

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const todayStr = new Date().toISOString().split('T')[0]
    const isToday = dateStr === todayStr
    const completedHabits = calendarData[dateStr] || []
    const hasActivity = completedHabits.length > 0

    days.push(
      <div 
        key={i} 
        onClick={() => hasActivity && setSelectedDate(dateStr)}
        className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-colors ${hasActivity ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500/50' : ''}
          ${isToday ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300' : 'bg-zinc-800/20 border border-transparent text-zinc-400 hover:bg-zinc-800/50'}
        `}
      >
        <span className={`text-lg ${isToday ? 'font-bold' : 'font-medium'}`}>{i}</span>
        {hasActivity && (
          <div className="flex gap-0.5 mt-1">
            {completedHabits.slice(0, 3).map((h, idx) => (
              <div key={idx} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ))}
            {completedHabits.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-50" />}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Calendar</h1>
          <p className="text-zinc-400 mt-1">View your habit history and plan ahead.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 bg-zinc-800/50 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-white text-lg min-w-[150px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-2 bg-zinc-800/50 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121216] rounded-2xl border border-zinc-800/50 p-6 md:p-8 shadow-xl"
      >
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-zinc-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedDate && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setSelectedDate(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#18181b] border border-zinc-800 p-6 rounded-2xl shadow-2xl z-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <button onClick={() => setSelectedDate(null)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {calendarData[selectedDate]?.map(habit => (
                  <div key={habit.id} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-indigo-500/10">
                      {habit.icon}
                    </div>
                    <span className="font-medium text-zinc-200">{habit.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

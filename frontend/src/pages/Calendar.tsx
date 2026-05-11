import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Calendar() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
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
          <button className="p-2 bg-zinc-800/50 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-white text-lg min-w-[120px] text-center">October 2023</span>
          <button className="p-2 bg-zinc-800/50 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121216] rounded-2xl border border-zinc-800/50 p-8 shadow-xl"
      >
        {/* Mock Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-zinc-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => {
            const isToday = i === 15
            const hasActivity = Math.random() > 0.5
            return (
              <div 
                key={i} 
                className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-colors cursor-pointer
                  ${isToday ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300' : 'bg-zinc-800/20 hover:bg-zinc-800/50 border border-transparent text-zinc-400'}
                `}
              >
                <span className={`text-lg ${isToday ? 'font-bold' : 'font-medium'}`}>{i < 31 ? i + 1 : (i - 30)}</span>
                {hasActivity && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />}
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

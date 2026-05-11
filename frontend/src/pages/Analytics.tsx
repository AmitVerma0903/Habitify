import { motion } from "framer-motion"
import { BarChart2, TrendingUp, PieChart, Activity } from "lucide-react"

export default function Analytics() {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Overview</h1>
        <p className="text-zinc-400 mt-1">Deep dive into your habit performance and trends.</p>
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { title: "Completion Rate", value: "85%", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { title: "Total Habits", value: "12", icon: PieChart, color: "text-blue-400", bg: "bg-blue-400/10" },
          { title: "Current Streak", value: "5 Days", icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-400/10" },
          { title: "Best Streak", value: "21 Days", icon: BarChart2, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((stat, i) => (
          <motion.div key={i} variants={item} className="bg-[#121216] p-6 rounded-2xl border border-zinc-800/50 shadow-xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#121216] rounded-2xl border border-zinc-800/50 p-8 min-h-[400px] flex flex-col items-center justify-center shadow-xl"
      >
        <BarChart2 className="w-12 h-12 text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Detailed Charts Coming Soon</h2>
        <p className="text-zinc-500 text-center max-w-md">
          We are crunching the numbers to bring you detailed visualizations of your progress over time. Check back later!
        </p>
      </motion.div>
    </div>
  )
}

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart2, TrendingUp, PieChart, Activity, Loader2 } from "lucide-react"
import { api } from "../lib/api"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AnalyticsData {
  total_habits: number
  completed_today: number
  average_completion_rate: number
  best_streak: number
  productivity_score: number
}

interface Trend {
  date: string
  completed: number
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [trends, setTrends] = useState<Trend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryRes, trendsRes] = await Promise.all([
          api.get("/analytics/summary"),
          api.get("/analytics/trends")
        ])
        setData(summaryRes.data)
        setTrends(trendsRes.data)
      } catch (error) {
        console.error("Failed to fetch analytics", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    )
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
          { title: "Completion Rate", value: `${data?.average_completion_rate || 0}%`, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { title: "Total Habits", value: data?.total_habits.toString() || "0", icon: PieChart, color: "text-blue-400", bg: "bg-blue-400/10" },
          { title: "Completed Today", value: data?.completed_today.toString() || "0", icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-400/10" },
          { title: "Best Streak", value: `${data?.best_streak || 0} Days`, icon: BarChart2, color: "text-purple-400", bg: "bg-purple-400/10" },
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
        className="bg-[#121216] rounded-2xl border border-zinc-800/50 p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-white">Completion Trend</h2>
            <p className="text-sm text-zinc-400">Your activity over the last 7 days</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            Habits Completed
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#a5b4fc' }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}

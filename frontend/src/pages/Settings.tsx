import { motion } from "framer-motion"
import { User, Bell, Shield, Paintbrush } from "lucide-react"

export default function Settings() {
  const sections = [
    { id: "profile", icon: User, title: "Profile", description: "Manage your personal information and preferences." },
    { id: "appearance", icon: Paintbrush, title: "Appearance", description: "Customize the look and feel of the app." },
    { id: "notifications", icon: Bell, title: "Notifications", description: "Configure how you want to be alerted." },
    { id: "privacy", icon: Shield, title: "Privacy & Security", description: "Control your data and account security." },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account preferences and configurations.</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-64 space-y-2 flex-shrink-0"
        >
          {sections.map((section, idx) => (
            <button 
              key={section.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
                ${idx === 0 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}
              `}
            >
              <section.icon className="w-5 h-5" />
              <span className="font-medium">{section.title}</span>
            </button>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-[#121216] rounded-2xl border border-zinc-800/50 p-8 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-indigo-500/50 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Change Avatar
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">Display Name</label>
                <input 
                  type="text" 
                  defaultValue="Felix"
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-400">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="felix@example.com"
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/50 flex justify-end">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

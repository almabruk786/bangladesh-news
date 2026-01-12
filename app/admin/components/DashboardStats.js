"use client";
import React from 'react';
import { TrendingUp, Users, FileText, Eye, Smartphone, ArrowUpRight } from "lucide-react";
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

export default function DashboardStats({ stats }) {
    const cards = [
        {
            title: "Live Visitors",
            value: stats.activeUsers || 0,
            icon: Users,
            gradient: "from-blue-500 to-indigo-600",
            shadow: "shadow-blue-500/30",
            isLive: true
        },
        {
            title: "App Users",
            value: stats.activePWA || 0,
            icon: Smartphone,
            gradient: "from-rose-500 to-pink-500",
            shadow: "shadow-rose-500/30",
            isLive: true
        },
        {
            title: "Total News",
            value: stats.total,
            icon: FileText,
            gradient: "from-violet-500 to-purple-500",
            shadow: "shadow-violet-500/30"
        },
        {
            title: "Published",
            value: stats.published,
            icon: TrendingUp,
            gradient: "from-emerald-400 to-green-500",
            shadow: "shadow-emerald-500/30",
            trend: "+12%"
        },
        {
            title: "Pending",
            value: stats.pending,
            icon: Eye,
            gradient: "from-amber-400 to-orange-500",
            shadow: "shadow-amber-500/30"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {cards.map((card, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={`relative overflow-hidden bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-white shadow-xl ${card.shadow}`}
                >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <card.icon size={100} />
                    </div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">{card.title}</p>
                            <h3 className="text-3xl font-black mt-2 flex items-center gap-2">
                                <CountUp end={card.value || 0} duration={2} separator="," />
                                {card.isLive && (
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                    </span>
                                )}
                            </h3>
                        </div>
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/10">
                            <card.icon size={20} className="text-white" />
                        </div>
                    </div>

                    {/* Mini Footer / Sparkline Area */}
                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-xs font-medium text-white/80">
                        {card.trend ? (
                            <>
                                <ArrowUpRight size={14} className="text-white" />
                                <span>{card.trend} vs last week</span>
                            </>
                        ) : (
                            <span>Updated just now</span>
                        )}
                        {/* Fake Sparkline for visual effect */}
                        <div className="ml-auto w-12 h-4 opacity-50 flex items-end gap-[2px]">
                            {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-white rounded-t-[1px]"></div>
                            ))}
                        </div>
                    </div>

                </motion.div>
            ))}
        </div>
    );
}

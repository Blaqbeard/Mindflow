import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactElement<LucideIcon>;
  onClick: () => void;
  color: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, onClick, color }) => (
  <Card 
    className={`group cursor-pointer bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:scale-105 transition-all duration-200 hover:border-${color}-300 dark:hover:border-${color}-600`}
    onClick={onClick}
  >
    <CardContent className="p-4 sm:p-6 text-center">
      <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-${color}-500/25 transition-shadow`}>
        {React.cloneElement(icon, { className: "h-6 w-6 text-white" })}
      </div>
      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </CardContent>
  </Card>
);

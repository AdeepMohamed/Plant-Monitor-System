import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert, HelpCircle } from 'lucide-react';

export const HealthBadge = ({ status, score, size = "md" }) => {
  const normStatus = (status || '').toLowerCase();
  
  let config = {
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
    label: status || "Healthy"
  };

  if (normStatus.includes("excellent")) {
    config = {
      bg: "bg-emerald-50 dark:bg-emerald-950/60",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-300 dark:border-emerald-700",
      icon: CheckCircle2,
      label: "Excellent"
    };
  } else if (normStatus.includes("good")) {
    config = {
      bg: "bg-green-50 dark:bg-green-950/60",
      text: "text-green-700 dark:text-green-300",
      border: "border-green-300 dark:border-green-700",
      icon: CheckCircle2,
      label: "Good"
    };
  } else if (normStatus.includes("moderate") || normStatus.includes("attention")) {
    config = {
      bg: "bg-amber-50 dark:bg-amber-950/60",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-300 dark:border-amber-700",
      icon: AlertTriangle,
      label: "Moderate"
    };
  } else if (normStatus.includes("poor")) {
    config = {
      bg: "bg-orange-50 dark:bg-orange-950/60",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-300 dark:border-orange-700",
      icon: AlertCircle,
      label: "Poor"
    };
  } else if (normStatus.includes("critical") || normStatus.includes("severe")) {
    config = {
      bg: "bg-red-50 dark:bg-red-950/60",
      text: "text-red-700 dark:text-red-300",
      border: "border-red-300 dark:border-red-700",
      icon: ShieldAlert,
      label: "Critical"
    };
  } else if (normStatus.includes("inconclusive")) {
    config = {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-700 dark:text-gray-300",
      border: "border-gray-300 dark:border-gray-700",
      icon: HelpCircle,
      label: "Inconclusive"
    };
  }

  const Icon = config.icon;
  const sizeClasses = size === "sm"
    ? "text-xs px-2 py-0.5 gap-1"
    : size === "lg"
    ? "text-sm px-3.5 py-1.5 gap-2 font-bold"
    : "text-xs px-2.5 py-1 gap-1.5 font-semibold";

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
      <Icon className={size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
      <span>{config.label} {score !== undefined && score !== null ? `(${score})` : ''}</span>
    </span>
  );
};

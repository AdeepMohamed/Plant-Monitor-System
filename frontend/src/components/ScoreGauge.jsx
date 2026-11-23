import React from 'react';

export const ScoreGauge = ({ score = 0, size = 160, strokeWidth = 14, label = "Health Score" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let color = "#16834A"; // Excellent
  let statusText = "Excellent";
  
  if (clampedScore >= 90) {
    color = "#16834A";
    statusText = "Excellent";
  } else if (clampedScore >= 75) {
    color = "#22C55E";
    statusText = "Good";
  } else if (clampedScore >= 50) {
    color = "#F59E0B";
    statusText = "Moderate";
  } else if (clampedScore >= 25) {
    color = "#F97316";
    statusText = "Poor";
  } else {
    color = "#DC2626";
    statusText = "Critical";
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-gray-800"
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {clampedScore}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400">
          / 100
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full mt-1"
          style={{ color: color, backgroundColor: `${color}18` }}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
};

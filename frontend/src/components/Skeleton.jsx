// src/components/Skeleton.jsx
export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] rounded-2xl ${className}`}
      style={{ animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }}
    />
  );
}
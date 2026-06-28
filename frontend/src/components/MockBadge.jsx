// src/components/MockBadge.jsx
const IS_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export default function MockBadge() {
  if (!IS_MOCK) return null;
  return (
    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      Mock Data
    </span>
  );
}
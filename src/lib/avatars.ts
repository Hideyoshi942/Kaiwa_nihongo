import type { Scenario } from "./types";

export interface AiAvatar {
  emoji: string;
  bgClass: string;
  label: string;
}

const ROLE_AVATARS: Record<string, AiAvatar> = {
  "Restaurant server": { emoji: "👨‍🍳", bgClass: "bg-orange-500/15", label: "Server" },
  "Store clerk": { emoji: "🏪", bgClass: "bg-blue-500/15", label: "Clerk" },
  "Passerby": { emoji: "🚶", bgClass: "bg-slate-500/15", label: "Local" },
  "New acquaintance": { emoji: "👋", bgClass: "bg-pink-500/15", label: "Friend" },
  "Receptionist": { emoji: "🏥", bgClass: "bg-teal-500/15", label: "Reception" },
  "Real estate agent": { emoji: "🏠", bgClass: "bg-amber-500/15", label: "Agent" },
  Manager: { emoji: "👔", bgClass: "bg-indigo-500/15", label: "Manager" },
  "Team lead": { emoji: "📋", bgClass: "bg-violet-500/15", label: "Lead" },
  Client: { emoji: "📞", bgClass: "bg-cyan-500/15", label: "Client" },
  "School administrator": { emoji: "🎓", bgClass: "bg-emerald-500/15", label: "Admin" },
  Professor: { emoji: "👨‍🏫", bgClass: "bg-purple-500/15", label: "Professor" },
  Interviewer: { emoji: "💼", bgClass: "bg-crimson/15", label: "Interviewer" },
  "Business client": { emoji: "🤝", bgClass: "bg-crimson/15", label: "Client" },
  "Upset customer": { emoji: "😤", bgClass: "bg-red-500/15", label: "Customer" },
  "Store staff": { emoji: "🛒", bgClass: "bg-green-500/15", label: "Staff" },
  "Bank teller": { emoji: "🏦", bgClass: "bg-blue-600/15", label: "Teller" },
  "Postal clerk": { emoji: "📮", bgClass: "bg-yellow-500/15", label: "Postal" },
  "Station staff": { emoji: "🚃", bgClass: "bg-sky-500/15", label: "Station" },
  "Senior colleague": { emoji: "👩‍💼", bgClass: "bg-indigo-500/15", label: "Senior" },
  "Dormitory manager": { emoji: "🏫", bgClass: "bg-orange-500/15", label: "Dorm" },
  "Club senior member": { emoji: "⚽", bgClass: "bg-lime-500/15", label: "Club" },
  Classmate: { emoji: "📚", bgClass: "bg-rose-500/15", label: "Classmate" },
  Customer: { emoji: "🧑", bgClass: "bg-gray-500/15", label: "Customer" },
  "HR manager": { emoji: "👩‍💼", bgClass: "bg-indigo-600/15", label: "HR" },
  "Executive client": { emoji: "🏢", bgClass: "bg-slate-600/15", label: "Executive" },
  "Email recipient": { emoji: "✉️", bgClass: "bg-blue-500/15", label: "Colleague" },
  "Meeting facilitator": { emoji: "📊", bgClass: "bg-violet-600/15", label: "Facilitator" },
  Pharmacist: { emoji: "💊", bgClass: "bg-green-600/15", label: "Pharmacist" },
  "Hair stylist": { emoji: "💇", bgClass: "bg-pink-500/15", label: "Stylist" },
  "Hotel receptionist": { emoji: "🏨", bgClass: "bg-amber-500/15", label: "Reception" },
  "Izakaya staff": { emoji: "🍶", bgClass: "bg-orange-600/15", label: "Staff" },
  Librarian: { emoji: "📖", bgClass: "bg-blue-500/15", label: "Librarian" },
  "Store manager": { emoji: "🏬", bgClass: "bg-indigo-500/15", label: "Manager" },
  "Festival visitor": { emoji: "🎪", bgClass: "bg-rose-500/15", label: "Visitor" },
  "Curious customer": { emoji: "🤔", bgClass: "bg-yellow-500/15", label: "Customer" },
};

const CATEGORY_DEFAULTS: Record<string, AiAvatar> = {
  "daily-life": { emoji: "🏙️", bgClass: "bg-sky-500/15", label: "Local" },
  workplace: { emoji: "💼", bgClass: "bg-indigo-500/15", label: "Colleague" },
  "study-abroad": { emoji: "🎒", bgClass: "bg-emerald-500/15", label: "Student" },
  "job-interviews": { emoji: "🎯", bgClass: "bg-crimson/15", label: "Interviewer" },
  "customer-service": { emoji: "🛎️", bgClass: "bg-amber-500/15", label: "Customer" },
  "business-japanese": { emoji: "🏢", bgClass: "bg-slate-600/15", label: "Business" },
};

export function getAiAvatar(scenario: Scenario): AiAvatar {
  return (
    ROLE_AVATARS[scenario.aiRole] ??
    CATEGORY_DEFAULTS[scenario.category] ??
    { emoji: "🤖", bgClass: "bg-crimson/15", label: "AI" }
  );
}

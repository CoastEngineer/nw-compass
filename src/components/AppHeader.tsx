import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Dashboard" },
  { to: "/config", label: "Config" },
  { to: "/teaching", label: "Teaching" },
  { to: "/snapshots", label: "Snapshots" },
];

export default function AppHeader() {
  return (
    <div className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-neutral-200">
      <div className="mx-auto max-w-[1280px] px-6 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <div className="text-lg font-semibold tracking-tight">NW Compass</div>
          <div className="text-xs text-neutral-500">Family Net Worth Cockpit</div>
        </div>

        <nav className="flex items-center gap-1 rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                [
                  "px-3 py-2 text-sm rounded-xl transition",
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100",
                ].join(" ")
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
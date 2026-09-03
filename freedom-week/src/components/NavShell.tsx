import { NavLink, Outlet } from "react-router-dom";
import { EagleIcon, TorchIcon, CrossIcon, LaurelIcon, GearIcon } from "./icons";
import type { ComponentType, SVGProps } from "react";

const NAV_ITEMS: Array<{
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
}> = [
  { to: "/", label: "Ascent", Icon: EagleIcon },
  { to: "/week", label: "Campaign", Icon: TorchIcon },
  { to: "/creed", label: "Creed", Icon: CrossIcon },
  { to: "/legacy", label: "Legacy", Icon: LaurelIcon },
  { to: "/settings", label: "Settings", Icon: GearIcon },
];

function NavItems({ vertical }: { vertical: boolean }) {
  return (
    <>
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            [
              "fw-tap flex items-center justify-center gap-2 rounded-lg transition-colors",
              vertical ? "flex-col px-3 py-3 text-[11px]" : "flex-1 flex-col py-2 text-[10px]",
              isActive
                ? "text-gold"
                : "text-parchment/50 hover:text-parchment/80",
            ].join(" ")
          }
        >
          <Icon size={22} />
          <span className="font-display tracking-wide uppercase">{label}</span>
        </NavLink>
      ))}
    </>
  );
}

export function NavShell() {
  return (
    <div className="min-h-dvh bg-navy text-parchment">
      <nav
        className="fixed inset-y-0 left-0 z-30 hidden w-24 flex-col items-stretch gap-1 border-r border-gold/15 bg-navy-deep/80 py-6 backdrop-blur md:flex"
        aria-label="Primary"
      >
        <NavItems vertical />
      </nav>

      <main className="min-h-dvh w-full pb-[calc(64px+env(safe-area-inset-bottom))] md:ml-24 md:pb-0">
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-gold/15 bg-navy-deep/90 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        <NavItems vertical={false} />
      </nav>
    </div>
  );
}

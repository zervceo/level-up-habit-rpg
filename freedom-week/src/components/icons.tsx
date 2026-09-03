import type { SVGProps } from "react";

/**
 * Line-art icon set — eagle, torch, cross, laurel, star. Pure inline SVG,
 * no icon library, so every mark can be swapped by editing this file alone.
 * All icons use `currentColor` and a shared stroke weight so they drop into
 * any surface (navy, parchment, gold) and inherit size from font-size or an
 * explicit `size` prop.
 */

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function EagleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 4c-1.4 1.6-2 3-2 4.4M12 4c1.4 1.6 2 3 2 4.4" />
      <path d="M12 8.4c-3.6-2.2-7.4-2.6-10-1.8 2 1.6 3.6 2.6 4.6 4.4-1.6.4-3 1.4-4 3 2.4.4 4-.2 5.6-1.4.4 1.8 1.6 3 3.8 4.6" />
      <path d="M12 8.4c3.6-2.2 7.4-2.6 10-1.8-2 1.6-3.6 2.6-4.6 4.4 1.6.4 3 1.4 4 3-2.4.4-4-.2-5.6-1.4-.4 1.8-1.6 3-3.8 4.6" />
      <path d="M12 12.6v6.4" />
      <path d="M10 21c.7-.9 1.3-1.4 2-1.4s1.3.5 2 1.4" />
    </svg>
  );
}

export function TorchIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 2c1.2 1.4 1.8 2.5 1.8 3.6 0 1-.5 1.4-.9 2 .8.2 1.6.9 1.6 2.1 0 1.5-1.1 2.1-2.5 2.1s-2.5-.6-2.5-2.1c0-1.2.8-1.9 1.6-2.1-.4-.6-.9-1-.9-2C10.2 4.5 10.8 3.4 12 2Z" />
      <path d="M9 12.4h6l-1 3.6H10l-1-3.6Z" />
      <path d="M10.4 16h3.2l.9 6H9.5l.9-6Z" />
    </svg>
  );
}

export function CrossIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3v18" />
      <path d="M6.5 8.5h11" />
    </svg>
  );
}

export function LaurelIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M8 4c-3 2.5-4.2 6.4-3 10.4C6 17.8 8.5 20 11.4 21" />
      <path d="M6.4 6.4 5 5.6M6.6 9.4l-1.6-.4M7.4 12.4l-1.7.2M8.6 15.2l-1.6.8" />
      <path d="M16 4c3 2.5 4.2 6.4 3 10.4C18 17.8 15.5 20 12.6 21" />
      <path d="M17.6 6.4 19 5.6M17.4 9.4l1.6-.4M16.6 12.4l1.7.2M15.4 15.2l1.6.8" />
    </svg>
  );
}

export function StarIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3.5 14.5 9.6 21 10.2 16 14.4 17.5 20.8 12 17.3 6.5 20.8 8 14.4 3 10.2 9.5 9.6Z" />
    </svg>
  );
}

export function GearIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.4M12 18.1v2.4M20.5 12h-2.4M5.9 12H3.5M17.7 6.3l-1.7 1.7M8 16l-1.7 1.7M17.7 17.7 16 16M8 8 6.3 6.3" />
    </svg>
  );
}

const CATEGORY_ICON = {
  Faith: CrossIcon,
  Work: TorchIcon,
  Body: LaurelIcon,
  Mind: EagleIcon,
  Home: StarIcon,
  Other: StarIcon,
} as const;

export function CategoryIcon({
  category,
  ...props
}: IconProps & { category: keyof typeof CATEGORY_ICON }) {
  const Icon = CATEGORY_ICON[category] ?? StarIcon;
  return <Icon {...props} />;
}

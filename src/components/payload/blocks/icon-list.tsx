/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertCircle, Award, Calendar, Camera, Check, ChevronRight, Clock, Flag, Globe, Goal, Heart, Info,
  Link, List, MapPin, Mail, MessageCircle, Newspaper, Phone, Play, Shield, Sparkles, Star, Ticket,
  Trophy, Tv, User, Users, Video, Zap,
  type LucideIcon,
} from "lucide-react";

// Os 30 nomes de src/cms/blocks/icons.ts (ICON_NAMES) → componente do lucide.
const ICONS: Record<string, LucideIcon> = {
  check: Check, star: Star, trophy: Trophy, calendar: Calendar, clock: Clock, "map-pin": MapPin,
  tv: Tv, users: Users, user: User, heart: Heart, shield: Shield, flag: Flag, goal: Goal,
  ticket: Ticket, newspaper: Newspaper, play: Play, video: Video, camera: Camera, phone: Phone,
  mail: Mail, "message-circle": MessageCircle, link: Link, globe: Globe, award: Award, zap: Zap,
  sparkles: Sparkles, list: List, info: Info, "alert-circle": AlertCircle, "chevron-right": ChevronRight,
};

export function lucideIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || Check;
}

export function IconListBlock({ block }: { block: any }) {
  const items = (block.items || []).filter((it: any) => it?.text);
  if (!items.length) return null;
  return (
    <div>
      {block.title && <h2 className="mb-3 text-lg font-bold text-text-primary">{block.title}</h2>}
      <ul className={`grid grid-cols-1 gap-x-6 gap-y-2 ${block.columns === "2" ? "sm:grid-cols-2" : ""}`}>
        {items.map((it: any, i: number) => {
          const Icon = lucideIcon(it.icon);
          return (
            <li key={i} className="flex items-start gap-2 text-text-primary">
              <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-green" />
              {it.href ? (
                <a href={it.href} className="hover:text-green hover:underline">
                  {it.text}
                </a>
              ) : (
                <span>{it.text}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

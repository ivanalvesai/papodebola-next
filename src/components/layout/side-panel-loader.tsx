"use client";

import dynamic from "next/dynamic";

const SidePanel = dynamic(
  () => import("./side-panel").then((m) => m.SidePanel),
  { ssr: false }
);

export function SidePanelLoader() {
  return <SidePanel />;
}

"use client";

import { Shell } from "../_components/shell";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}

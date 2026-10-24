import type { ReactNode } from "react";

import SuiteShell from "@/components/suite/SuiteShell";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <SuiteShell>{children}</SuiteShell>;
}

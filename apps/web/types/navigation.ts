import { ReactNode } from "react";

export interface NavigationItem {
  name: string;
  icon: ReactNode;
  active: boolean;
}

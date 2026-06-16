import {
  BarChart3,
  Building2,
  CreditCard,
  Landmark,
  Settings,
  UsersRound,
} from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Contributors",
    href: "/contributors",
    icon: UsersRound,
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: CreditCard,
  },
  {
    title: "Treasury",
    href: "/treasury",
    icon: Landmark,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const productNavItem = {
  title: "Arc Payroll",
  href: "/",
  icon: Building2,
};

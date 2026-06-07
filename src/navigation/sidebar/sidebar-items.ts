import { BarChart3, LineChart, type LucideIcon, Upload, Users } from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Pedidos e Tendências",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/kpi",
        icon: BarChart3,
      },
      {
        title: "Upload CSV",
        url: "/dashboard/upload",
        icon: Upload,
      },
    ],
  },
  {
    id: 2,
    label: "Avaliação e Desempenho",
    items: [
      {
        title: "Dashboard",
        url: "#",
        icon: LineChart,
        comingSoon: true,
      },
      {
        title: "Avaliação",
        url: "/dashboard/avaliacao",
        icon: LineChart,
      },
      {
        title: "Funcionários",
        url: "/dashboard/funcionarios",
        icon: Users,
      },
    ],
  },
];

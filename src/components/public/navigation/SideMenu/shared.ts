export type MenuItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
};

export const menuConfig: MenuItem[] = [
  {
    id: "retreats",
    label: "Retiros",
    icon: "material-symbols:temple-buddhist",
    path: "/public",
  },
];

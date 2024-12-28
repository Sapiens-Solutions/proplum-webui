import React from "react";
import { NavLink } from "react-router-dom";
import {
  BookType,
  TableProperties as TablePropertiesIcon,
  ArrowBigDownDash,
  Codesandbox,
  Group,
  Pickaxe,
  Cog,
  RotateCwSquare,
  Pi,
  GalleryVerticalEnd,
  BarChartHorizontalBig,
  ScrollText,
  Workflow,
  BookText,
  Wrench,
} from "lucide-react";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import styles from "./SidebarItemsList.module.css";
import { TABLE_NAME_TO_LABEL, TABLE_PAGE_URL } from "@/const";

type MenuGroup = {
  group?: string;
  items: MenuGroupItem[];
};

type MenuGroupItem = {
  link: string;
  label: string;
  icon: typeof TablePropertiesIcon;
};

const makeTableLink = (tableName: string): string =>
  `${TABLE_PAGE_URL}/${tableName}`;

const getTableMenuGroupItem = (
  tableName: string,
  icon: MenuGroupItem["icon"]
): MenuGroupItem => ({
  link: makeTableLink(tableName),
  label: TABLE_NAME_TO_LABEL[tableName],
  icon,
});

const MENU_GROUPS: MenuGroup[] = [
  {
    group: "Ведение справочников",
    items: [
      getTableMenuGroupItem("d_extraction_type", BookType),
      getTableMenuGroupItem("d_load_type", ArrowBigDownDash),
      getTableMenuGroupItem("d_load_method", Codesandbox),
      getTableMenuGroupItem("d_load_group", Group),
      getTableMenuGroupItem("d_delta_mode", Pickaxe),
    ],
  },
  {
    group: "Загрузки",
    items: [
      getTableMenuGroupItem("objects", Cog),
      getTableMenuGroupItem("dependencies", RotateCwSquare),
      getTableMenuGroupItem("load_constants", Pi),
      getTableMenuGroupItem("load_info", GalleryVerticalEnd),
      getTableMenuGroupItem("load_status_today", BarChartHorizontalBig),
      getTableMenuGroupItem("objects_log", ScrollText),
      getTableMenuGroupItem("ext_tables_params", Wrench),
    ],
  },
  {
    group: "Цепочки процессов",
    items: [
      getTableMenuGroupItem("chains", Workflow),
      getTableMenuGroupItem("chains_info", BookText),
    ],
  },
];

export const SidebarItemsList: React.FC = () => {
  return (
    <Command className="overflow-visible">
      <CommandList className="overflow-visible">
        {MENU_GROUPS.map((menuGroup, index) => (
          <CommandGroup
            heading={menuGroup.group}
            key={index}
            className="grid px-2"
          >
            {menuGroup.items.map((groupItem, itemIndex) => (
              <NavLink
                to={groupItem.link}
                key={`${groupItem.label}-${itemIndex}`}
                className={({ isActive }) =>
                  cn(
                    styles.headerLink,
                    isActive
                      ? styles.activeHeaderLink
                      : styles.nonActiveHeaderLink
                  )
                }
              >
                <groupItem.icon className="mr-2 h-4 w-4" />
                <span>{groupItem.label}</span>
              </NavLink>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
};

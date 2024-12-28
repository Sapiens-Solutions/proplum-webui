import React from "react";
import styles from "./Loader.module.css";
import { cn } from "@/lib/utils";

interface LoaderProps {
  color: string;
  secondaryColor: string;
  wrapperClassName?: string;
  containerClassName?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  color = "transparent",
  secondaryColor = "#fff",
  wrapperClassName = "",
  containerClassName = "",
}: LoaderProps) => {
  return (
    <div className={cn(styles.loader, wrapperClassName)}>
      <div
        className={cn(styles.loader__container, containerClassName)}
        style={{ borderColor: secondaryColor, borderTopColor: color }}
      ></div>
    </div>
  );
};

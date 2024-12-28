import React from "react";
import { NavLink } from "react-router-dom";
import { AIRFLOW_URL } from "@/envs";
import { BadgeButton } from "@/components/BadgeButton/BadgeButton";

const RELOAD_DAG_JOB_LINK = `${AIRFLOW_URL}/dags/job_auto_generate_dags`;

interface ReloadChainsListButtonProps {
  tableName?: string;
}

export const ReloadChainsListButton: React.FC<ReloadChainsListButtonProps> = ({
  tableName,
}) => {
  return tableName === "chains" ? (
    <NavLink to={RELOAD_DAG_JOB_LINK} target="_blank">
      <BadgeButton label="Обновить список цепочек" hasButtonWrapper={false} />
    </NavLink>
  ) : null;
};

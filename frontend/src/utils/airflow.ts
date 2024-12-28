import { AIRFLOW_URL } from "@/envs";

export function getAirflowJobLink(jobName: string): string {
  if (!jobName) return "";
  return `${AIRFLOW_URL}/dags/${jobName}`;
}

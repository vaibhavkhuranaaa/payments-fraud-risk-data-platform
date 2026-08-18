export type MonitoringSource = {
  source_file: string;
  event_count: number;
  fraud_count: number;
  fraud_rate: number;
  first_event_at: string;
  last_event_at: string;
};

export type Monitoring = {
  scope: string;
  sources: MonitoringSource[];
};

export type EvaluationModel = {
  pr_auc: number;
  recall_at_review_rate: number;
  brier_score: number;
  alert_volume: number;
  alert_volume_by_month: Record<string, number>;
  calibration_bins: Array<{
    low: number;
    high: number;
    count: number;
    observed_rate: number | null;
  }>;
};

export type Evaluation = {
  split: string;
  review_rate: number;
  holdout_rows?: number;
  features?: string[];
  models: Record<string, EvaluationModel>;
};

const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";
const apiKey = process.env.RISK_API_KEY;

async function apiFetch<T>(path: string): Promise<T> {
  if (!apiKey) {
    throw new Error("RISK_API_KEY is required for aggregate API access");
  }
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { "X-API-Key": apiKey },
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    throw new Error(`Risk API returned ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getMonitoring() {
  return apiFetch<Monitoring>("/v1/monitoring");
}

export function getEvaluation() {
  return apiFetch<Evaluation>("/v1/evaluation");
}

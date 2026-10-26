import axios from "axios";
import type { TriageRequest, TriageResponse } from "@/models/triage";

export type { TriageRequest, TriageResponse };

// The environment variable overrides the local API URL when needed.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Sends patient vitals to the backend triage endpoint and returns the
// ESI level, label, confidence score and per-level probability distribution.
export async function submitTriage(
  data: TriageRequest,
): Promise<TriageResponse> {
  const { data: result } = await axios.post<TriageResponse>(
    `${API_BASE}/triage`,
    data,
  );
  return result;
}

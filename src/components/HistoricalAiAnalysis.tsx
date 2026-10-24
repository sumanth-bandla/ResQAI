import { useState } from "react";
import { AlertTriangle, BrainCircuit, LoaderCircle, Sparkles } from "lucide-react";
import { Card } from "./Ui";
import { supabase } from "../lib/supabase";

type AnalysisMode = "trends" | "summary";
type AnalysisResponse = {
  analysis: string;
  sourceRecordCount: number;
  generatedAt: string;
};

export function HistoricalAiAnalysis({ mode, recordId }: { mode: AnalysisMode; recordId?: string }) {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runAnalysis() {
    if (loading) return;
    setAnalysis(null);
    setError("");
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    if (mode === "summary" && !recordId) {
      setError("The selected historical record is unavailable.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke<AnalysisResponse>("historical-ai-analysis", {
        body: mode === "trends" ? { mode } : { mode, recordId },
      });
      if (invokeError) {
        let message = "AI analysis is unavailable. Confirm the Supabase Edge Function and Gemini secret are configured.";
        if (invokeError.context instanceof Response) {
          try {
            const body = await invokeError.context.clone().json() as { message?: unknown };
            if (typeof body.message === "string") message = body.message;
          } catch {
            // Keep the actionable fallback when the function error has no JSON body.
          }
        }
        throw new Error(message);
      }
      if (!data || typeof data.analysis !== "string" || !data.analysis.trim()) {
        throw new Error("The analysis service returned no summary. Try again later.");
      }
      setAnalysis(data);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Could not generate historical analysis.");
    } finally {
      setLoading(false);
    }
  }

  const isTrend = mode === "trends";

  return (
    <Card
      title={isTrend ? "AI historical trends" : "AI record summary"}
      subtitle={isTrend ? "Optional description of aggregate counts from closed public records" : "Optional summary of this closed public record"}
    >
      <div className="ai-analysis-panel">
        <div className="ai-analysis-boundary"><AlertTriangle size={14} /><span>Demonstration only · not an emergency assessment, prediction, recommendation, or operational decision</span></div>
        <p className="ai-analysis-disclosure">{isTrend
          ? "If requested, only aggregate month, neighborhood, and reported-situation counts are sent to Google Gemini. Individual records and addresses are not sent."
          : "If requested, this record's date, neighborhood, and source classifications are sent to Google Gemini. Addresses, coordinates, account details, and record identifiers are excluded."}</p>
        <button className="button button--secondary ai-analysis-button" type="button" onClick={() => void runAnalysis()} disabled={loading}>
          {loading ? <><LoaderCircle className="spin" size={14} />Analyzing historical data…</> : <><Sparkles size={14} />{isTrend ? "Generate historical trends" : "Summarize this closed record"}</>}
        </button>
        {error && <div className="ai-analysis-error" role="alert">{error}</div>}
        {analysis && (
          <div className="ai-analysis-result" role="status">
            <div><BrainCircuit size={14} /><strong>AI-generated · verify against source data</strong></div>
            <p>{analysis.analysis}</p>
            <small>Based on {analysis.sourceRecordCount.toLocaleString()} public record{analysis.sourceRecordCount === 1 ? "" : "s"} · {new Date(analysis.generatedAt).toLocaleString()}</small>
          </div>
        )}
      </div>
    </Card>
  );
}

"use client";

import type { AnalyzeResult } from "@/lib/types";
import BudgetPanel from "./plan/BudgetPanel";
import FunnelPanel from "./plan/FunnelPanel";
import MessageMatchPanel from "./plan/MessageMatchPanel";
import TargetingPanel from "./plan/TargetingPanel";
import TestingPlanPanel from "./plan/TestingPlanPanel";
import PreviewPanel from "./plan/PreviewPanel";
import CalibrationPanel from "./plan/CalibrationPanel";
import SovPanel from "./plan/SovPanel";
import PolicyPanel from "./plan/PolicyPanel";
import ExportPanel from "./plan/ExportPanel";

export default function PlanningPanel({ result }: { result: AnalyzeResult }) {
  return (
    <div className="mt-5 space-y-5">
      <BudgetPanel result={result} />
      <div className="grid gap-5 lg:grid-cols-2">
        <FunnelPanel result={result} />
        <TestingPlanPanel result={result} />
      </div>
      <PreviewPanel result={result} />
      <MessageMatchPanel result={result} />
      <TargetingPanel result={result} />
      <div className="grid gap-5 lg:grid-cols-2">
        <SovPanel result={result} />
        <PolicyPanel result={result} />
      </div>
      <CalibrationPanel result={result} />
      <ExportPanel result={result} />
    </div>
  );
}
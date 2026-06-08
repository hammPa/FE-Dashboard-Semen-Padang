// src/pages/Overview.jsx
import SummaryCards from "../components/SummaryCards";
import TrendChart from "../components/TrendChart";
import SourceChart from "../components/SourceChart";
import LogTable from "../components/LogTable";

export default function Overview() {
  return (
    <>
      <SummaryCards />
      <TrendChart />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        <SourceChart />
        <LogTable />
      </div>
    </>
  );
}

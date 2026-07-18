'use client';

import Header from "../../components/Header";
import MetricCard from "../../components/MetricCard";
import DeviceCard from "../../components/DeviceCard";
import OperationsPanel from "../../components/OperationsPanel";
import ActivityPanel from "../../components/ActivityPanel";

export default function Page() {
  return (
    <main className="dashboard">
      <Header
        title="OmniMCP Dashboard"
        subtitle="Universal Hardware Abstraction Layer"
      />

      <div className="metrics-grid">
        <MetricCard title="Registered Adapters" value={2} />
        <MetricCard title="Connected Devices" value={2} />
        <MetricCard title="System Health" value="Healthy" />
        <MetricCard title="MCP Commands" value={5} />
      </div>

      <h2 className="section-title">Connected Hardware</h2>

      <div className="devices-grid">
        <DeviceCard
          name="Machine Controller"
          type="ESP32"
          id="esp32-1"
          status="Connected"
        />

        <DeviceCard
          name="Inspection Camera"
          type="Camera"
          id="camera-1"
          status="Connected"
        />
      </div>

      <div className="panel-grid">
        <OperationsPanel />
        <ActivityPanel />
      </div>
    </main>
  );
}

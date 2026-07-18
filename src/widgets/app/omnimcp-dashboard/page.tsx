'use client';

import Header from "../../components/Header";
import MetricCard from "../../components/MetricCard";
import DeviceCard from "../../components/DeviceCard";
import OperationsPanel from "../../components/OperationsPanel";
import ActivityPanel from "../../components/ActivityPanel";

import LoadingState from "../../components/states/LoadingState";
import EmptyState from "../../components/states/EmptyState";
import ErrorState from "../../components/states/ErrorState";
import OfflineState from "../../components/states/OfflineState";
import SystemOverview from "../../components/SystemOverview";
// Temporary mock data.
// Member 1 can replace this entire object with live MCP data later.
const dashboardData = {
  metrics: {
    registeredAdapters: 2,
    connectedDevices: 2,
    systemHealth: "Healthy",
    mcpCommands: 5,
  },

  devices: [
    {
      id: "esp32-1",
      name: "Machine Controller",
      type: "ESP32",
      status: "Connected",
    },
    {
      id: "camera-1",
      name: "Inspection Camera",
      type: "Camera",
      status: "Connected",
    },
  ],
};

export default function Page() {
  // ------------------------------------------------------------------
  // Temporary UI states.
  // These will later come from the backend / NitroStack APIs.
  // ------------------------------------------------------------------

  const loading = false;
  const hasError = false;
  const isOffline = false;

  // Loading State
  if (loading) {
    return (
      <main className="dashboard">
        <LoadingState />
      </main>
    );
  }

  // Error State
  if (hasError) {
    return (
      <main className="dashboard">
        <ErrorState />
      </main>
    );
  }

  // Offline State
  if (isOffline) {
    return (
      <main className="dashboard">
        <OfflineState />
      </main>
    );
  }

  // Empty State
  if (dashboardData.devices.length === 0) {
    return (
      <main className="dashboard">
        <EmptyState />
      </main>
    );
  }

  // ------------------------------------------------------------------
  // Main Dashboard
  // ------------------------------------------------------------------

  return (
    <main className="dashboard">
      <Header
        title="OmniMCP Dashboard"
        subtitle="Universal Hardware Abstraction Layer"
      />

           <div className="metrics-grid">
        <MetricCard
          title="Registered Adapters"
          value={dashboardData.metrics.registeredAdapters}
        />

        <MetricCard
          title="Connected Devices"
          value={dashboardData.metrics.connectedDevices}
        />

        <MetricCard
          title="System Health"
          value={dashboardData.metrics.systemHealth}
        />

        <MetricCard
          title="MCP Commands"
          value={dashboardData.metrics.mcpCommands}
        />
      </div>

      {/* NEW */}
      <SystemOverview />

      <h2 className="section-title">Connected Hardware</h2>

      <div className="devices-grid">
        {dashboardData.devices.map((device) => (
          <DeviceCard
            key={device.id}
            {...device}
          />
        ))}
      </div>

      <div className="panel-grid">
        <OperationsPanel />
        <ActivityPanel />
      </div>
    </main>
  );
}

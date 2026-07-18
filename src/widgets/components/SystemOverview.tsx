export default function SystemOverview() {
  return (
    <div className="panel">
      <h3>System Overview</h3>

      <div className="overview-grid">
        <div className="overview-item">
          <span>🟢 Server Status</span>
          <strong>Online</strong>
        </div>

        <div className="overview-item">
          <span>🔄 Last Sync</span>
          <strong>Just Now</strong>
        </div>

        <div className="overview-item">
          <span>🔌 Total Adapters</span>
          <strong>2</strong>
        </div>

        <div className="overview-item">
          <span>📡 Connected Devices</span>
          <strong>2</strong>
        </div>
      </div>
    </div>
  );
}

const activity = [
  "Dashboard Started",
  "ESP32 Connected",
  "Inspection Camera Connected",
  "System Healthy",
  "Awaiting MCP Commands",
];

export default function ActivityPanel() {
  return (
    <div className="panel">
      <h3>System Timeline</h3>

      {activity.map((item, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-dot"></div>

          <div>
            <div className="timeline-time">
              09:4{index}
            </div>

            <div>{item}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

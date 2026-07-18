type DeviceCardProps = {
  name: string;
  type: string;
  id: string;
  status: string;
};

export default function DeviceCard({
  name,
  type,
  id,
  status,
}: DeviceCardProps) {
  return (
    <div className="device-card">
      <div className="device-header">
        <div>
          <h3>{name}</h3>
          <span className="device-type">{type}</span>
        </div>

        <span
          className={
            status === "Connected"
              ? "status-connected"
              : "status-disconnected"
          }
        >
          ● {status}
        </span>
      </div>

      <div className="device-info">
        <p>
          <strong>ID:</strong> {id}
        </p>
      </div>
    </div>
  );
}

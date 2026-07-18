const commands = [
  {
    name: "list_devices",
    description: "Discover registered adapters",
  },
  {
    name: "connect_device",
    description: "Connect hardware",
  },
  {
    name: "disconnect_device",
    description: "Disconnect hardware",
  },
  {
    name: "device_status",
    description: "Check device health",
  },
  {
    name: "execute_command",
    description: "Execute adapter action",
  },
];

export default function OperationsPanel() {
  return (
    <div className="panel">
      <h3>⚙️ Available MCP Commands</h3>

      {commands.map((cmd) => (
        <div key={cmd.name} className="command-card">
          <div className="command-title">{cmd.name}</div>
          <div className="command-desc">{cmd.description}</div>
        </div>
      ))}
    </div>
  );
}

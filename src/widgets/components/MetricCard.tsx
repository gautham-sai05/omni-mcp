type MetricCardProps = {
  title: string;
  value: string | number;
};

export default function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

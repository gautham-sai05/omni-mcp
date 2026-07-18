type HeaderProps = {
  title: string;
  subtitle: string;
};

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="status-pill">
        <span className="status-dot"></span>
        SYSTEM ONLINE
      </div>
    </header>
  );
}

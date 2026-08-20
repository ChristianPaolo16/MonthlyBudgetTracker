export default function FinancialCard({ icon, value, label, trend, trendValue, color }) {
  const colorClass = color ? `financial-card--${color}` : '';

  return (
    <div className={`financial-card ${colorClass}`}>
      <div className="financial-card__icon">{icon}</div>
      <div className="financial-card__info">
        <span className="financial-card__value">{value}</span>
        <span className="financial-card__label">{label}</span>
      </div>
      {trend && (
        <div className={`financial-card__trend financial-card__trend--${trend}`}>
          {trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192'} {trendValue}
        </div>
      )}
    </div>
  );
}

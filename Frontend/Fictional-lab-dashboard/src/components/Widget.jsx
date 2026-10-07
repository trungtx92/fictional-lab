export function Widget({ title, kind, children }) {
  return (
    <section className="widget">
      <h3 className="widget__title">
        {title} <span className="widget__kind">({kind})</span>
      </h3>
      <div className="widget__body">{children}</div>
    </section>
  );
}

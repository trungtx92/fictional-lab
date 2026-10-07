export function Widget({ title, children }) {
  return (
    <section className="widget">
      <h3 className="widget__title">{title}</h3>
      <div className="widget__body">{children}</div>
    </section>
  );
}

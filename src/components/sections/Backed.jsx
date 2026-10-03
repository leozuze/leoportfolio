export default function Backed({
  variant = "services",
  children,
  className = "",
}) {
  return (
    <div
      data-bg-section={variant}
      className={className}
    >
      {children}
    </div>
  );
}
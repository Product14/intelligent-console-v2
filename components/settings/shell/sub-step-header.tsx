export function SubStepHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-black-dark">{title}</h2>
      {description && <p className="mt-1 text-sm text-black-60">{description}</p>}
    </div>
  );
}

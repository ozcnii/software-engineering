interface ListSkeletonProps {
  label: string;
  rows?: number;
}

export function ListSkeleton({ label, rows = 4 }: ListSkeletonProps) {
  return (
    <div className="skeleton-list" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} />
      ))}
    </div>
  );
}

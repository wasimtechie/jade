/** Full-height blog builder shell inside dashboard content area. */
export default function BlogBuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-[var(--dash-gutter,1rem)] flex min-h-[calc(100dvh-var(--dash-header-h,4rem))] flex-col lg:-mx-6">
      {children}
    </div>
  );
}

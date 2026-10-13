/** Keep the listing responsive while allowing root articles to return a real 404. */
export default function RootLoading() {
  return (
    <div
      className="min-h-[100dvh] bg-[#1A1C1E]"
      aria-busy="true"
      aria-label="Loading page"
    />
  );
}

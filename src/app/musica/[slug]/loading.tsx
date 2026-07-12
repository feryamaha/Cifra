/** Skeleton da página de cifra (SPEC_010 A4): feedback imediato na navegação. */
export default function LoadingSong() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 @tablet:grid-cols-[60%_40%]">
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded bg-secondary-800" />
        <div className="h-9 w-2/3 animate-pulse rounded-lg bg-secondary-800" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-secondary-800" />
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-10 animate-pulse rounded-lg bg-secondary-800" />
          ))}
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-secondary-900/70" />
        ))}
      </div>
      <div className="hidden space-y-4 @tablet:block">
        <div className="h-64 animate-pulse rounded-2xl bg-secondary-900/70" />
        <div className="h-40 animate-pulse rounded-2xl bg-secondary-900/70" />
      </div>
    </div>
  );
}

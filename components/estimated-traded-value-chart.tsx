import Image from "next/image";

export function EstimatedTradedValueChart() {
  return (
    <section
      aria-labelledby="estimated-traded-value-heading"
      className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="px-4 pt-5 sm:px-6">
        <h2 id="estimated-traded-value-heading" className="text-xl font-bold tracking-[-0.02em] text-[#203a63] sm:text-2xl">
          Estimated daily traded value
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          17 June–14 October 2026 · PKR billion
        </p>
      </div>
      <picture>
        <source
          media="(max-width: 639px)"
          srcSet="/data/charts/estimated-traded-value-2026-06-17-to-2026-10-14-mobile.png"
          width={720}
          height={540}
        />
        <Image
        src="/data/charts/estimated-traded-value-2026-06-17-to-2026-10-14.png"
        alt="Daily estimated traded value across 97–100 downloaded stocks, from 17 June to 14 October 2026. Value is estimated as daily shares traded multiplied by closing price."
        width={2520}
        height={936}
        sizes="(max-width: 640px) calc(100vw - 24px), (max-width: 1880px) calc(100vw - 64px), 1816px"
        className="mt-3 block h-auto w-full"
        />
      </picture>
    </section>
  );
}

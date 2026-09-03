export function SiteDisclaimer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-5 text-xs leading-5 text-slate-500 sm:px-8">
      <div className="mx-auto max-w-[1880px]">
        <p>
          <span className="font-bold text-slate-700">Disclaimer.</span>{" "}
          <span className="font-bold text-[#9a6700]">Market data is not live.</span>{" "}
          pktkr provides information and research for general informational purposes only. It is not investment advice, a recommendation, or an offer to buy or sell any security. Market data is sourced from the{" "}
          <a href="https://dps.psx.com.pk/" target="_blank" rel="noreferrer" className="font-semibold text-[#315a8a] underline decoration-slate-300 underline-offset-2 hover:decoration-[#315a8a]">Pakistan Stock Exchange Data Portal (DPS)</a>{" "}
          where available; data and analysis may be delayed, incomplete, or inaccurate, and no accuracy or suitability is guaranteed. Verify information against official sources before making any decision and consider consulting a licensed investment adviser.
        </p>
      </div>
    </footer>
  );
}

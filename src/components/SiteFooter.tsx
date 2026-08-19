export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-10 text-center md:px-8 xl:max-w-7xl xl:px-12 xl:py-12 2xl:px-16">
        <p className="font-display text-[0.7rem] font-semibold tracking-[0.16em] text-muted">
          © {new Date().getFullYear()} by Ashton Hanson
        </p>
      </div>
    </footer>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-10 text-center md:px-8">
        <p className="font-display text-[0.7rem] font-semibold tracking-[0.16em] text-muted">
          © {new Date().getFullYear()} by Ashton Hanson
        </p>
      </div>
    </footer>
  );
}

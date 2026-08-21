/** Metallic down-arrow shown on load before the first intro title. */
export function ScrollCue() {
  return (
    <div className="scroll-cue" role="img" aria-label="Scroll down">
      <span className="scroll-cue-hover">
        <svg
          className="scroll-cue-icon"
          viewBox="0 0 48 64"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="scroll-cue-metal"
              x1="8%"
              y1="0%"
              x2="92%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7a7a78" />
              <stop offset="18%" stopColor="#d8d8d4" />
              <stop offset="36%" stopColor="#ffffff" />
              <stop offset="52%" stopColor="#9a9a98" />
              <stop offset="70%" stopColor="#ececea" />
              <stop offset="100%" stopColor="#7a7a78" />
            </linearGradient>
          </defs>
          <path
            fill="url(#scroll-cue-metal)"
            d="M24 4c1.2 0 2.2 1 2.2 2.2v32.05l9.36-9.36a2.2 2.2 0 1 1 3.11 3.11L25.56 55.27a2.2 2.2 0 0 1-3.12 0L9.33 32a2.2 2.2 0 1 1 3.11-3.11l9.36 9.36V6.2C21.8 5 22.8 4 24 4Z"
          />
        </svg>
      </span>
    </div>
  );
}

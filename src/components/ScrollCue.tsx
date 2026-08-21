/** Metallic down-arrow shown on load before the first intro title. */
export function ScrollCue() {
  return (
    <div className="scroll-cue" role="img" aria-label="Scroll down">
      <span className="scroll-cue-hover">
        <span className="scroll-cue-icon" />
      </span>
    </div>
  );
}

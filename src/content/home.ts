const aboutLines = [
  "As a graphic designer\nof 10+ years",
  "with a strong focus on\nIllustration, Adobe Creative Suite,",
  "AI-assisted visual storytelling\nand Music Production,",
  "blending traditional design principles\nwith emerging tools.",
] as const;

export const home = {
  aboutTitle: "ABOUT ME",
  aboutWord: "ABOUT",
  meWord: "ME",
  /** One scroll beat per entry; `\n` splits into two display lines. */
  aboutLines: [...aboutLines],
  /** Desktop home intro — same copy as one flowing paragraph. */
  aboutParagraph: aboutLines.map((line) => line.replace(/\n/g, " ")).join(" "),
  recentWorkTitle: "RECENT WORK",
  seeMenuLines: ["SEE MENU", "FOR OTHER", "WORK."] as const,
  aiAnimationTitle: "AI ANIMATION",
  aiAnimations: [
    {
      src: "/media/home/ai-animation/01-early-birds-intro.mp4",
      alt: "Early Birds Intro",
      type: "video" as const,
    },
    {
      src: "/media/home/ai-animation/02-jax-and-the-angry-dog-web.mp4",
      alt: "Jax and the Angry Dog",
      type: "video" as const,
    },
    {
      src: "/media/home/ai-animation/03-man-wakes-up-on-moon-web.mp4",
      alt: "Man Wakes Up on the Moon",
      type: "video" as const,
    },
    {
      src: "/media/home/ai-animation/04-manicure-for-strangers-web.mp4",
      alt: "Manicure for Strangers",
      type: "video" as const,
    },
    {
      src: "/media/home/ai-animation/05-nike-ad-web.mp4",
      alt: "Nike Ad",
      type: "video" as const,
    },
    {
      src: "/media/home/ai-animation/06-covert-auto-ad-web.mp4",
      alt: "Covert Auto Ad",
      type: "video" as const,
    },
    {
      src: "/media/home/ai-animation/07-bellas-hair-salon-ad-web.mp4",
      alt: "Bellas Hair Salon Ad",
      type: "video" as const,
    },
    {
      src: "/media/home/ai-animation/08-austin-rowing-club-ad-web.mp4",
      alt: "Austin Rowing Club Ad",
      type: "video" as const,
    },
  ],
};

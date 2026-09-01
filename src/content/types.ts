export type MediaItem = {
  src: string;
  alt: string;
  type?: "image" | "video";
};

export type CaseStudy = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  media?: MediaItem[];
  sections?: { heading: string; media?: MediaItem[] }[];
  /** Render the contact form in place of a gallery. */
  form?: boolean;
};

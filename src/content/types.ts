export type MediaItem = {
  src: string;
  alt: string;
  type?: "image" | "video";
  /** CSS object-position when the slide uses cover crop. */
  objectPosition?: string;
  /** Extra cover from the top, as a percent of the frame, to hide letterbox. */
  cropTop?: number;
  /** Extra cover from the bottom, as a percent of the frame, to hide letterbox. */
  cropBottom?: number;
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

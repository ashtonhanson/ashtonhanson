import type { CaseStudy, MediaItem } from "@/content/types";

export const adsIntro =
  "The art of ad design is about crafting compelling visuals that capture attention, drive engagement, and inspire action. With 15 years of experience, I bring a strategic blend of creativity and purpose to every project, leveraging powerful imagery, thoughtful layouts, and persuasive messaging to ensure your advertisements make a lasting impression and achieve tangible results.";

/** Sentence-length segments so the intro can wrap like a normal paragraph. */
export const adsIntroLines = [
  "The art of ad design is about crafting compelling visuals that capture attention, drive engagement, and inspire action.",
  "With 15 years of experience, I bring a strategic blend of creativity and purpose to every project, leveraging powerful imagery, thoughtful layouts, and persuasive messaging to ensure your advertisements make a lasting impression and achieve tangible results.",
] as const;

export const adCategories = ["DIRECT MAIL", "PRINT", "SOCIAL MEDIA"] as const;

function directMailAd(file: string, alt: string): MediaItem {
  return {
    src: `/ads/direct-mail/${file}`,
    alt,
  };
}

export const adCases: CaseStudy[] = [
  {
    id: "print",
    title: "PRINT",
    subtitle: "",
    body: "Mailers, print ads, and illustrated pieces made to work in the real world: clear hierarchy, strong imagery, and layouts that still read when they land in a mailbox or on a page.",
    media: [
      directMailAd("illustration-ad.jpg", "J&J Exterminating illustrated print ad"),
      directMailAd(
        "illustrated-printed-ad.jpg",
        "J&J Exterminating illustrated ad in print",
      ),
      directMailAd("luna-bar-grill.jpg", "Luna Bar and Grill print ad"),
      directMailAd("campus-collectables.jpg", "Campus Collectibles vintage shop print ad"),
      directMailAd("floor-connection.jpg", "Floor Connection print ad"),
      directMailAd("ichiban.jpg", "Ichiban Restaurant direct mail flyer"),
      directMailAd("lockhart-jewelers.jpg", "Lockhart Jewelers print ad"),
      directMailAd("maids-of-many.jpg", "Maids of Many print ad"),
      directMailAd("halls-fitness.jpg", "Hall’s Fitness Center print ad"),
      directMailAd(
        "gorhams-nursery-banner.jpg",
        "Gorham’s Potting Soil nursery fence banner",
      ),
      directMailAd(
        "bossier-olympiad-brochure.jpg",
        "Bossier Olympiad brochure layout",
      ),
    ],
  },
  {
    id: "social-media",
    title: "SOCIAL MEDIA",
    subtitle: "",
    body: "Campaign graphics for feeds and stories: consistent, high-energy visuals built to stop the scroll and stay on brand.",
    sections: [
      {
        heading: "TERNIUM",
        media: [
          { src: "/ads/ternium/01.jpg", alt: "Ternium ad design 01" },
          { src: "/ads/ternium/02.jpg", alt: "Ternium ad design 02" },
          { src: "/ads/ternium/03.jpg", alt: "Ternium ad design 03" },
          { src: "/ads/ternium/04.jpg", alt: "Ternium ad design 04" },
          { src: "/ads/ternium/05.jpg", alt: "Ternium ad design 05" },
          { src: "/ads/ternium/06.png", alt: "Ternium ad design 06" },
        ],
      },
      {
        heading: "REAUX FITNESS",
        media: [
          { src: "/ads/reaux-fitness/01.jpg", alt: "Reaux Fitness ad design 01" },
          { src: "/ads/reaux-fitness/02.jpg", alt: "Reaux Fitness ad design 02" },
          { src: "/ads/reaux-fitness/03.jpg", alt: "Reaux Fitness ad design 03" },
          { src: "/ads/reaux-fitness/04.jpg", alt: "Reaux Fitness ad design 04" },
          { src: "/ads/reaux-fitness/05.jpg", alt: "Reaux Fitness ad design 05" },
          { src: "/ads/reaux-fitness/06.jpg", alt: "Reaux Fitness ad design 06" },
          { src: "/ads/reaux-fitness/07.jpg", alt: "Reaux Fitness ad design 07" },
        ],
      },
      {
        heading: "AIR REF",
        media: [
          { src: "/ads/air-ref/01.jpg", alt: "Air Ref ad design 01" },
          { src: "/ads/air-ref/02.png", alt: "Air Ref ad design 02" },
          { src: "/ads/air-ref/03.png", alt: "Air Ref ad design 03" },
          { src: "/ads/air-ref/04.png", alt: "Air Ref ad design 04" },
          { src: "/ads/air-ref/05.png", alt: "Air Ref ad design 05" },
          { src: "/ads/air-ref/06.png", alt: "Air Ref ad design 06" },
        ],
      },
    ],
  },
];

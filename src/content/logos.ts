import type { CaseStudy } from "@/content/types";

export const logosIntro =
  "A logo is the cornerstone of any brand’s identity, a visual symbol that embodies its essence and makes a memorable impact. I specialize in designing logos that are not only visually striking but also deeply meaningful. By combining thoughtful typography, unique design elements, and a strategic approach, I create logos that capture the heart of your brand and leave a lasting impression on your audience.";

/** Sentence-length segments so the intro can wrap like a normal paragraph. */
export const logosIntroLines = [
  "A logo is the cornerstone of any brand’s identity, a visual symbol that embodies its essence and makes a memorable impact.",
  "I specialize in designing logos that are not only visually striking but also deeply meaningful. By combining thoughtful typography, unique design elements, and a strategic approach, I create logos that capture the heart of your brand and leave a lasting impression on your audience.",
] as const;

export const logoCases: CaseStudy[] = [
  {
    id: "hub-tablet",
    title: "HUB TABLET",
    subtitle: "NORWEGIAN\nTECH START-UP",
    body: "A Norwegian tech start-up looking for a solid, clean visual identity. The aim was to build trust and fit in with the hotel industry, where hotel guests will use the HUB Tablet. The color foundations are warm grey and orange. Because the company is based in Norway, the logo and brand also feel at home in current Norwegian marketing culture.",
    media: [
      {
        src: "/logos/hub-tablet.jpeg",
        alt: "HUB Tablet logo",
      },
    ],
  },
  {
    id: "red-rover",
    title: "RED ROVER",
    subtitle: "DOG OBEDIENCE\nTRAINING",
    body: "I was asked to design a logo for their dog training business. They wanted something professional that would depict a solid, dependable organization people could trust. Red was chosen as the main color to convey a serious yet professional presence. The client was extremely happy with the final result. They have become a popular dog training business in town, with a 5-star rating and over 211 positive reviews.",
    media: [
      {
        src: "/logos/red-rover.jpeg",
        alt: "Red Rover logo",
      },
    ],
  },
  {
    id: "nexgen",
    title: "NEXGEN",
    subtitle: "GAMING LLC",
    body: "A bold gaming identity built around a metallic wordmark and a neon X emblem, designed to feel premium, competitive, and instantly recognizable.",
    media: [
      {
        src: "/logos/nexgen.jpeg",
        alt: "Nexgen Gaming logo",
      },
    ],
  },
  {
    id: "mira",
    title: "MIRA",
    subtitle: "DIRECT PRIMARY CARE",
    body: "A clean medical brand mark on brushed metal, calm, modern, and trustworthy for a direct primary care practice.",
    media: [
      {
        src: "/logos/mira.jpeg",
        alt: "Mira Direct Primary Care logo",
      },
    ],
  },
  {
    id: "space-kase",
    title: "SPACE KASE",
    subtitle: "VISUALS",
    body: "Playful rocket branding for a visuals studio, fun character energy with a sharp, professional type lockup.",
    media: [
      {
        src: "/logos/space-kase.jpeg",
        alt: "Space Kase Visuals logo",
      },
    ],
  },
  {
    id: "designer-life",
    title: "DESIGNER",
    subtitle: "LIFE COACHING",
    body: "A soft script wordmark with supporting stationery, personal and polished for life coaching brand materials.",
    media: [
      {
        src: "/logos/designer-life.jpeg",
        alt: "Designer Life Coaching logo",
      },
    ],
  },
  {
    id: "3rd-coast",
    title: "3RD COAST",
    subtitle: "VETERAN-OWNED\nEXTERIOR SERVICES",
    body: "An acquaintance was starting a veteran-owned and operated turnkey exterior services business focused on equipment rental and construction, fencing, pressure washing, small concrete driveways, pergolas, and patio decks. They wanted a clever yet professional vibe. 3rd Coast is in the name because that is what Houston is often called, with the Gulf of Mexico at Galveston.",
    media: [
      {
        src: "/logos/3rd-coast.jpeg",
        alt: "3rd Coast logo",
      },
    ],
  },
  {
    id: "wagyu-yume",
    title: "WAGYU YUME",
    subtitle: "JAPANESE FOOD TRUCK",
    body: "This client was looking for something fun yet professional, in an effort to follow a popular illustrated, cartoonish branding style in the advertising market. The client has been very pleased with the logo and the vehicle wrap.",
    media: [
      {
        src: "/logos/wagyu-yume.jpeg",
        alt: "Wagyu Yume logo",
      },
    ],
  },
  {
    id: "garrison-creek",
    title: "GARRISON CREEK CANDLES",
    subtitle: "SOY CANDLES,\nSOAPS & SCRUBS",
    body: "This business specializes in soy candles, soaps, and scrubs, and wanted something that looked vintage, since they planned to use mason jars as candle containers. The warm scent seems to pop right off the logo.",
    media: [
      {
        src: "/logos/garrison-creek.jpeg",
        alt: "Garrison Creek Candles logo",
      },
    ],
  },
];

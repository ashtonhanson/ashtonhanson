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

export const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/branding", label: "BRANDING" },
  { href: "/ads", label: "ADS" },
  { href: "/logos", label: "LOGOS" },
  { href: "/contact", label: "CONTACT" },
] as const;

export const home = {
  aboutTitle: "ABOUT ME",
  aboutWord: "ABOUT",
  meWord: "ME",
  /** One scroll beat per entry; `\n` splits into two display lines. */
  aboutLines: [
    "As a graphic designer\nof 10+ years",
    "with a strong focus on\nIllustration, Adobe Creative Suite,",
    "AI-assisted visual storytelling\nand Music Production,",
    "blending traditional design principles\nwith emerging tools.",
  ],
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

export const brandingIntro =
  "The essence of branding in graphic design lies in crafting a visual identity that resonates with your audience and stands out in the marketplace. It’s about consistently using a distinctive logo, typography, color palette, graphic elements, and imagery to convey your brand’s personality and values.";

/** Sentence-length segments so the intro can wrap like a normal paragraph. */
export const brandingIntroLines = [
  "The essence of branding in graphic design lies in crafting a visual identity that resonates with your audience and stands out in the marketplace.",
  "It’s about consistently using a distinctive logo, typography, color palette, graphic elements, and imagery to convey your brand’s personality and values.",
] as const;

export const brandingCases: CaseStudy[] = [
  {
    id: "hub-tablet",
    title: "HUB TABLET",
    subtitle: "NORWEGIAN\nTECH START-UP",
    body: "In designing this brand, I wanted something as clean as possible — no unnecessary graphics — while still making a solid, visually appealing identity. The client wants to stand out as modern yet classy, since this tech is for the hotel guest experience. Two hotel groups are already on board, Smart Hotel and Comfort Xpress, and the project is in beta. We also received a grant from Innovasjon Norge, a Norwegian government grant institution. This is a fun work in progress.",
    sections: [
      {
        heading: "OLD HUB TABLET LAYOUT",
        media: [
          {
            src: "/branding/hub-tablet/old-layout/yourec-logo.jpg",
            alt: "YouRec logo — old HUB Tablet layout",
          },
          {
            src: "/branding/hub-tablet/old-layout/yourec-card-1.jpg",
            alt: "YouRec card — old HUB Tablet layout",
          },
          {
            src: "/branding/hub-tablet/old-layout/yourec-card-2.jpg",
            alt: "YouRec card alternate — old HUB Tablet layout",
          },
        ],
      },
      {
        heading: "REVISED\nHUB TABLET LAYOUT",
        media: [
          {
            src: "/logos/hub-tablet-on-wht.jpg",
            alt: "HUB Tablet logo on white",
          },
          {
            src: "/branding/hub-tablet/new-layout/pre-comp.mov",
            alt: "HUB Tablet revised layout animation",
            type: "video",
          },
          {
            src: "/branding/hub-tablet/new-layout/where-to-eat.jpg",
            alt: "HUB Tablet Where to Eat screen",
          },
          {
            src: "/branding/hub-tablet/new-layout/restaurant-layout.jpg",
            alt: "HUB Tablet restaurant layout screen",
          },
          {
            src: "/branding/hub-tablet/new-layout/menu-selections.png",
            alt: "HUB Tablet menu selections screen",
          },
        ],
      },
    ],
  },
  {
    id: "wagyu-yume",
    title: "WAGYU YUME",
    subtitle: "JAPANESE FOOD TRUCK",
    body: "This client wanted something fun yet professional, in the spirit of a popular illustrated cartoon style in Asian advertising. They have been very pleased with the logo and the vehicle wrap so far. I will continue to help them with branding.",
    media: [
      {
        src: "/branding/wagyu-yume/logo.jpg",
        alt: "Wagyu Yume logo design",
      },
      {
        src: "/branding/wagyu-yume/wrap-layout.png",
        alt: "Wagyu Yume food truck wrap — sides and back layout",
      },
      {
        src: "/branding/wagyu-yume/daytime-front.jpg",
        alt: "Wagyu Yume food truck — daytime front view",
      },
      {
        src: "/branding/wagyu-yume/truck-side.png",
        alt: "Wagyu Yume food truck — side wrap",
      },
      {
        src: "/branding/wagyu-yume/side-door.png",
        alt: "Wagyu Yume food truck — side door wrap",
      },
      {
        src: "/branding/wagyu-yume/food-truck.mp4",
        alt: "Wagyu Yume food truck video",
        type: "video",
      },
    ],
  },
  {
    id: "red-rover",
    title: "RED ROVER",
    subtitle: "DOG OBEDIENCE\nTRAINING",
    body: "This client asked for a logo they could use for their dog-training business. They wanted something professional that would show a solid, dependable organization people could trust. Red was chosen as the main color to convey a serious yet professional presence. The client was extremely happy with the final result. They are now a popular dog-training business in town, with a 5-star rating and more than 211 positive reviews.",
    media: [
      {
        src: "/branding/red-rover/sketch.jpg",
        alt: "Red Rover logo sketch",
      },
      {
        src: "/branding/red-rover/logo.jpg",
        alt: "Red Rover logo",
      },
      {
        src: "/branding/red-rover/shirt.jpg",
        alt: "Red Rover branded shirt",
      },
      {
        src: "/branding/red-rover/ad.jpg",
        alt: "Red Rover advertisement",
      },
      {
        src: "/branding/red-rover/facebook.png",
        alt: "Red Rover Facebook graphic",
      },
      {
        src: "/branding/red-rover/video.mp4",
        alt: "Red Rover social media video",
        type: "video",
      },
    ],
  },
];

export const adsIntro =
  "The art of ad design is about crafting compelling visuals that capture attention, drive engagement, and inspire action. With over 10 years of experience, I bring a strategic blend of creativity and purpose to every project, leveraging powerful imagery, thoughtful layouts, and persuasive messaging to ensure your advertisements make a lasting impression and achieve tangible results.";

/** Sentence-length segments so the intro can wrap like a normal paragraph. */
export const adsIntroLines = [
  "The art of ad design is about crafting compelling visuals that capture attention, drive engagement, and inspire action.",
  "With over 10 years of experience, I bring a strategic blend of creativity and purpose to every project, leveraging powerful imagery, thoughtful layouts, and persuasive messaging to ensure your advertisements make a lasting impression and achieve tangible results.",
] as const;

export const adCategories = ["DIRECT MAIL", "PRINT", "SOCIAL MEDIA"] as const;

function directMailAd(file: string, alt: string): MediaItem {
  return {
    src: `/ads/${encodeURIComponent("Direct Mail")}/${encodeURIComponent(file)}`,
    alt,
  };
}

export const adCases: CaseStudy[] = [
  {
    id: "print",
    title: "PRINT",
    subtitle: "",
    body: "Mailers, print ads, and illustrated pieces made to work in the real world—clear hierarchy, strong imagery, and layouts that still read when they land in a mailbox or on a page.",
    media: [
      directMailAd("Illustration AD.jpg", "J&J Exterminating illustrated print ad"),
      directMailAd(
        "Illustrated and printed AD.jpg",
        "J&J Exterminating illustrated ad in print",
      ),
      directMailAd("Luna Bar & Grill 4TR PG SQ.jpg", "Luna Bar and Grill print ad"),
      directMailAd("Campus Collectables.jpg", "Campus Collectibles vintage shop print ad"),
      directMailAd("Floor Connection.jpg", "Floor Connection print ad"),
      directMailAd("Ichiban.jpg", "Ichiban Restaurant direct mail flyer"),
      directMailAd("Lockhart Jewelers.jpg", "Lockhart Jewelers print ad"),
      directMailAd("Maids of Many.jpg", "Maids of Many print ad"),
      directMailAd("Halls Sml Pwr Wrp.jpg", "Hall’s Fitness Center print ad"),
      directMailAd(
        "Gorham's Potting Soil Nusery Fence Banner_Proof 4 copy.jpg",
        "Gorham’s Potting Soil nursery fence banner",
      ),
      directMailAd(
        "Bossier Olympiad Brochure.jpg",
        "Bossier Olympiad brochure layout",
      ),
    ],
  },
  {
    id: "social-media",
    title: "SOCIAL MEDIA",
    subtitle: "",
    body: "Campaign graphics for feeds and stories—consistent, high-energy visuals built to stop the scroll and stay on brand.",
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
    body: "A Norwegian tech start-up looking for a solid, clean visual identity. The goal was to build trust and fit in with the hotel industry, since that is where hotel guests will use the HUB Tablet. The colors are warm grey and orange. Because the company is based in Norway, the logo and brand feel at home in current Norwegian marketing culture.",
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
    body: "I was asked to design a logo they could use for their dog-training business. They wanted something professional that would show a solid, dependable organization people could trust. Red was chosen as the main color to convey a serious yet professional presence. The client was extremely happy with the final result. They are now a popular dog-training business in town, with a 5-star rating and more than 211 positive reviews.",
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
    body: "A soft script wordmark with supporting stationery — personal and polished for life-coaching brand materials.",
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
    body: "An acquaintance was starting a veteran-owned and operated turnkey exterior-services business focused on equipment rental and construction, fencing, pressure washing, and small concrete driveways, pergolas, and patio decks. They wanted a clever yet professional vibe. 3rd Coast is in the name because that is what Houston is often called, thanks to the Gulf of Mexico at Galveston.",
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
    body: "This client wanted something fun yet professional, in the spirit of a popular illustrated cartoon style in Asian advertising. They have been very pleased with the logo and the vehicle wrap.",
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
    body: "This business specializes in soy candles, soaps, and scrubs, and wanted a vintage look, since they planned to use mason jars as candle containers. Ah, the warm scent seems to pop right off the logo!",
    media: [
      {
        src: "/logos/garrison-creek.jpeg",
        alt: "Garrison Creek Candles logo",
      },
    ],
  },
];

export const contact = {
  title: "CONTACT",
  subtitle: "LET’S WORK\nTOGETHER",
  body: "Have a branding, logo, or advertising project in mind?\nReach out and let’s talk.",
  email: "Design@ashtonhanson.com",
};

export const contactCases: CaseStudy[] = [
  {
    id: "inquiry",
    title: "LET’S WORK\nTOGETHER",
    subtitle: "",
    body: "",
    form: true,
  },
];

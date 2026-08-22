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
  /** One complete line per entry; `\n` wraps to two lines on mobile only. */
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
      src: "/media/home/ai-animation/02-jax-and-the-angry-dog.mov",
      alt: "Jax and the Angry Dog",
      type: "video" as const,
    },
    {
      src: "/media/home/ai-animation/05-nike-ad.mov",
      alt: "Nike Ad",
      type: "video" as const,
    },
    {
      src: "/media/home/ai-animation/06-covert-auto-ad.mov",
      alt: "Covert Auto Ad",
      type: "video" as const,
    },
    {
      src: "/media/home/ai-animation/07-bellas-hair-salon-ad.mov",
      alt: "Bellas Hair Salon Ad",
      type: "video" as const,
    },
    {
      src: "/media/home/ai-animation/08-austin-rowing-club-ad.mov",
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
    body: "In designing this brand I wanted to create something as clean as possible without the use of unnecessary graphics, while at the same time creating a solid visually appealing brand. The client is seeking to stand out as modern, yet classy, being that this piece of tech will be for the hotel industry guest experience. So far we have two hotel branches on board: Smart Hotel and Comfort Xpress, with beta testing and we have also gotten a grant from “Innovasjon Norge”, a Norwegian Federal Government Grant institution. This is a fun piece of work in progress!",
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
    body: "This client was seeking something fun yet professional in efforts to imitate the direction of a currently popular Asian trend within the advertising market, which is a fun cartoonish illustrated branding style. The client has been very pleased with the logo and the vehicle wrap so far. I will continue to assist them with branding.",
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
    body: "This client was requested a logo that they could use for their dog training business. They were seeking something professional that would depict a solid, dependable organization that people could trust. Red was considered as the main color in efforts to convey a serious yet professional presence. The client was extremely happy with the final result. Now they have become a very popular dog training business in town with a 5 star rating and over 211 positive reviews.",
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
  "The art of ad design is about crafting compelling visuals that capture attention, drive engagement, and inspire action. With over 10 years of experience, I bring a strategic blend of creativity and purpose to every project—leveraging powerful imagery, thoughtful layouts, and persuasive messaging to ensure your advertisements make a lasting impression and achieve tangible results.";

/** Sentence-length segments so the intro can wrap like a normal paragraph. */
export const adsIntroLines = [
  "The art of ad design is about crafting compelling visuals that capture attention, drive engagement, and inspire action.",
  "With over 10 years of experience, I bring a strategic blend of creativity and purpose to every project—leveraging powerful imagery, thoughtful layouts, and persuasive messaging to ensure your advertisements make a lasting impression and achieve tangible results.",
] as const;

export const adCategories = ["DIRECT MAIL", "PRINT", "SOCIAL MEDIA"] as const;

export const adCases: CaseStudy[] = [
  {
    id: "ternium",
    title: "TERNIUM",
    subtitle: "AD DESIGN",
    body: "Campaign work across print and digital touchpoints—built for clarity, impact, and brand consistency.",
    media: [
      {
        src: "/ads/ternium/01.jpg",
        alt: "Ternium ad design 01",
      },
      {
        src: "/ads/ternium/02.jpg",
        alt: "Ternium ad design 02",
      },
      {
        src: "/ads/ternium/03.jpg",
        alt: "Ternium ad design 03",
      },
      {
        src: "/ads/ternium/04.jpg",
        alt: "Ternium ad design 04",
      },
      {
        src: "/ads/ternium/05.jpg",
        alt: "Ternium ad design 05",
      },
      {
        src: "/ads/ternium/06.png",
        alt: "Ternium ad design 06",
      },
    ],
  },
  {
    id: "reaux-fitness",
    title: "REAUX FITNESS",
    subtitle: "AD DESIGN",
    body: "High-energy visuals for fitness branding and social promotion.",
    media: [
      {
        src: "/ads/reaux-fitness/01.jpg",
        alt: "Reaux Fitness ad design 01",
      },
      {
        src: "/ads/reaux-fitness/02.jpg",
        alt: "Reaux Fitness ad design 02",
      },
      {
        src: "/ads/reaux-fitness/03.jpg",
        alt: "Reaux Fitness ad design 03",
      },
      {
        src: "/ads/reaux-fitness/04.jpg",
        alt: "Reaux Fitness ad design 04",
      },
      {
        src: "/ads/reaux-fitness/05.jpg",
        alt: "Reaux Fitness ad design 05",
      },
      {
        src: "/ads/reaux-fitness/06.jpg",
        alt: "Reaux Fitness ad design 06",
      },
      {
        src: "/ads/reaux-fitness/07.jpg",
        alt: "Reaux Fitness ad design 07",
      },
    ],
  },
  {
    id: "air-ref",
    title: "AIR REF",
    subtitle: "AD DESIGN",
    body: "Clean, direct advertising for service-focused messaging.",
    media: [
      {
        src: "/ads/air-ref/01.jpg",
        alt: "Air Ref ad design 01",
      },
      {
        src: "/ads/air-ref/02.png",
        alt: "Air Ref ad design 02",
      },
      {
        src: "/ads/air-ref/03.png",
        alt: "Air Ref ad design 03",
      },
      {
        src: "/ads/air-ref/04.png",
        alt: "Air Ref ad design 04",
      },
      {
        src: "/ads/air-ref/05.png",
        alt: "Air Ref ad design 05",
      },
      {
        src: "/ads/air-ref/06.png",
        alt: "Air Ref ad design 06",
      },
    ],
  },
];

export const logosIntro =
  "A logo is the cornerstone of any brand’s identity—a visual symbol that embodies its essence and makes a memorable impact. I specialize in designing logos that are not only visually striking but also deeply meaningful. By combining thoughtful typography, unique design elements, and a strategic approach, I create logos that capture the heart of your brand and leave a lasting impression on your audience.";

/** Sentence-length segments so the intro can wrap like a normal paragraph. */
export const logosIntroLines = [
  "A logo is the cornerstone of any brand’s identity—a visual symbol that embodies its essence and makes a memorable impact.",
  "I specialize in designing logos that are not only visually striking but also deeply meaningful. By combining thoughtful typography, unique design elements, and a strategic approach, I create logos that capture the heart of your brand and leave a lasting impression on your audience.",
] as const;

export const logoCases: CaseStudy[] = [
  {
    id: "hub-tablet",
    title: "HUB TABLET",
    subtitle: "NORWEGIAN\nTECH START-UP",
    body: "A Norwegian tech start-up client seeking to establish a solid/clean visual for their branding. With an intent to establish a foundation of trust and in efforts to “fit in” with the hotel industry. Being that that is where the HUB Tablet will be utilized by hotel guests. The color foundations are warm grey, and orange. Being that this company is based out of Norway, the visual of the logo and the brand really seems to fit the vibe of the current Norwegian marketing culture.",
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
    body: "I was requested to design a logo that they could use for their dog training business. They were seeking something professional that would depict a solid, dependable organization that people could trust. Red was considered as the main color in efforts to convey a serious yet professional presence. The client was extremely happy with the final result. Now they have become a very popular dog training business in town with a 5 star rating and over 211 positive reviews.",
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
    body: "A bold gaming identity built around a metallic wordmark and a neon X emblem—designed to feel premium, competitive, and instantly recognizable.",
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
    body: "A clean medical brand mark on brushed metal—calm, modern, and trustworthy for a direct primary care practice.",
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
    body: "Playful rocket branding for a visuals studio—fun character energy with a sharp, professional type lockup.",
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
    body: "A soft script wordmark with supporting stationery—personal and polished for life coaching brand materials.",
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
    body: "An acquaintance was starting a veteran owned & operated turnkey exterior services business focused on: equipment rental/construction, fencing, pressure washing, small concrete driveway, pergola and patio deck building. They were seeking a clever yet professional vibe. 3rd Coast was used in the name because it is what Houston is now referred to as due to the Gulf of Mexico being in Galveston.",
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
    body: "This client was seeking something fun yet professional in efforts to imitate the direction of a currently popular Asian trend within the advertising market, which is a fun cartoonish illustrated branding style. The client has been very pleased with the logo and the vehicle wrap.",
    media: [
      {
        src: "/logos/wagyu-yume.jpeg",
        alt: "Wagyu Yume logo",
      },
    ],
  },
  {
    id: "garrison-creek",
    title: "GARRISON CREEK CANDELS",
    subtitle: "SOY CANDLES,\nSOAPS & SCRUBS",
    body: "This business specializes in soy candles, soaps and scrubs and was looking for something that looked vintage—since they were planning on using mason jars as their candle containers. Ah, the warm scent seems to just pop up off the logo!",
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

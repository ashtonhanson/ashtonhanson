import type { CaseStudy } from "@/content/types";

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
    body: "In designing this brand I wanted to create something as clean as possible without unnecessary graphics, while still making a solid, visually appealing identity. The client wanted to stand out as modern yet classy, since this piece of tech is for the hotel guest experience. So far two hotel branches are on board, Smart Hotel and Comfort Xpress, with beta testing under way, and we have also received a grant from Innovasjon Norge, a Norwegian federal grant institution. This is a fun piece of work in progress!",
    sections: [
      {
        heading: "OLD HUB TABLET LAYOUT",
        media: [
          {
            src: "/branding/hub-tablet/old-layout/yourec-logo.jpg",
            alt: "YouRec logo, old HUB Tablet layout",
          },
          {
            src: "/branding/hub-tablet/old-layout/yourec-card-1.jpg",
            alt: "YouRec card, old HUB Tablet layout",
          },
          {
            src: "/branding/hub-tablet/old-layout/yourec-card-2.jpg",
            alt: "YouRec card alternate, old HUB Tablet layout",
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
    body: "This client was looking for something fun yet professional, in an effort to follow a popular illustrated, cartoonish branding style in the advertising market. The client has been very pleased with the logo and the vehicle wrap so far. I will continue to assist them with branding.",
    media: [
      {
        src: "/branding/wagyu-yume/logo.jpg",
        alt: "Wagyu Yume logo design",
      },
      {
        src: "/branding/wagyu-yume/wrap-layout.png",
        alt: "Wagyu Yume food truck wrap, sides and back layout",
      },
      {
        src: "/branding/wagyu-yume/daytime-front.jpg",
        alt: "Wagyu Yume food truck, daytime front view",
      },
      {
        src: "/branding/wagyu-yume/truck-side.png",
        alt: "Wagyu Yume food truck, side wrap",
      },
      {
        src: "/branding/wagyu-yume/side-door.png",
        alt: "Wagyu Yume food truck, side door wrap",
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
    body: "This client requested a logo they could use for their dog training business. They wanted something professional that would depict a solid, dependable organization people could trust. Red was chosen as the main color to convey a serious yet professional presence. The client was extremely happy with the final result. They have become a popular dog training business in town, with a 5-star rating and over 211 positive reviews.",
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

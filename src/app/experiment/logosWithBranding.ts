import type { CaseStudy } from "@/lib/content";
import { brandingCases, logoCases } from "@/lib/content";

/** Logo plates plus each company's branding galleries, when those exist. */
export function logosWithBrandingGalleries(): CaseStudy[] {
  const brandingById = new Map(
    brandingCases.map((study) => [study.id, study]),
  );

  return logoCases.map((logo) => {
    const branding = brandingById.get(logo.id);
    if (!branding) return logo;

    const extraSections = branding.sections?.length
      ? branding.sections
      : branding.media?.length
        ? [{ heading: "", media: branding.media }]
        : [];

    if (!extraSections.length) return logo;

    return {
      ...logo,
      sections: [...(logo.sections ?? []), ...extraSections],
    };
  });
}

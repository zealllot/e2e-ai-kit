/**
 * Framework slot section registry. Single source of truth for the 9
 * required slot sections per kit ADR-0001 § Slot contract.
 *
 * A substrate's framework slot lives at
 * `.claude/skills/<framework>/SKILL.md` (in the substrate). Its body
 * MUST contain a heading whose text matches each canonical title
 * below. The lint matches by section title equality — substrates
 * choose their level (H2 vs H3) but the title text is fixed.
 */

export interface SlotSection {
  /** Slot-section identifier (S1-S9). Stable across kit versions. */
  id: string;
  /** Canonical title. Substrates must use this text verbatim. */
  title: string;
  required: boolean;
}

export const SLOT_SECTIONS: ReadonlyArray<SlotSection> = [
  { id: 'S1', title: 'Selector strategy', required: true },
  { id: 'S2', title: 'Wait / readiness strategy', required: true },
  { id: 'S3', title: 'Form input strategy', required: true },
  { id: 'S4', title: 'Action / state-transition driving', required: true },
  { id: 'S5', title: 'Page Object structure convention', required: true },
  { id: 'S6', title: 'Test naming + file layout', required: true },
  { id: 'S7', title: 'Parallelism + data isolation', required: true },
  { id: 'S8', title: 'Anti-patterns', required: true },
  { id: 'S9', title: 'Cost discipline', required: true },
];

export const SLOT_REQUIRED_FRONTMATTER = [
  'name',
  'description',
  'framework',
  'admin_stack',
  'required_sections',
] as const;

export function listRequiredSlotTitles(): ReadonlyArray<string> {
  return SLOT_SECTIONS.filter((s) => s.required).map((s) => s.title);
}

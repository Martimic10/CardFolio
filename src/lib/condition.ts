/**
 * Pluggable grade calculation from the four sub-scores (1–10 scale).
 * Weighted average biased slightly toward corners/surface (common in grading).
 */
export function calculateGrade(input: {
  centering: number;
  corners: number;
  edges: number;
  surface: number;
}): number {
  const { centering, corners, edges, surface } = input;
  const grade =
    centering * 0.2 + corners * 0.3 + edges * 0.2 + surface * 0.3;
  return Math.round(grade * 10) / 10;
}

export function gradeLabel(grade: number): string {
  if (grade >= 9.5) return "GEM-MT";
  if (grade >= 9) return "MINT";
  if (grade >= 8) return "NM-MT";
  if (grade >= 7) return "NM";
  if (grade >= 5) return "EX";
  if (grade >= 3) return "VG";
  return "PR";
}

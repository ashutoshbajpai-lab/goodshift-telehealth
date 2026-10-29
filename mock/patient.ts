export interface PatientProfile {
  id: string;
  name: string;
  firstName: string;
  gender: 'female' | 'male' | 'other';
  age: number;
  heightCm: number;
  startWeightKg: number;
  currentWeightKg: number;
  goalWeightKg: number;
  startBmi: number;
  currentBmi: number;
  weeksOnProgram: number;
  weeklyAvgWeightChangeKg: number;
  adherencePercent: number;
  programName: string;
  currentDoseStep: number;
  medicationName: string;
  lastDoseText: string;
  nextDoseText: string;
  sideEffectsRecent: string[];
  hydrationStatus: 'Low' | 'Normal' | 'Good';
  conditions: string[];
  allergies: string[];
  preferredLanguages: string[];
}

export const mockPatient: PatientProfile = {
  id: 'PAT-IND-8921',
  name: 'Priya Sharma',
  firstName: 'Priya',
  gender: 'female',
  age: 34,
  heightCm: 163,
  startWeightKg: 89,
  currentWeightKg: 83,
  goalWeightKg: 72,
  startBmi: 33.5,
  currentBmi: 31.2,
  weeksOnProgram: 12,
  weeklyAvgWeightChangeKg: -0.5,
  adherencePercent: 82,
  programName: 'Elevate GLP-1 Medical Weight Care',
  currentDoseStep: 2, // e.g. 0.5mg or Step 2
  medicationName: 'Semaglutide 0.5 mg pen',
  lastDoseText: 'Yesterday (Day 6 of cycle)',
  nextDoseText: 'Tomorrow (Scheduled injection)',
  sideEffectsRecent: ['Mild nausea (2x this week, morning after dose)', 'Mild constipation'],
  hydrationStatus: 'Low',
  conditions: ['Polycystic Ovary Syndrome (PCOS)', 'Insulin Resistance'],
  allergies: ['No known drug allergies (NKDA)'],
  preferredLanguages: ['English', 'Hindi'],
};

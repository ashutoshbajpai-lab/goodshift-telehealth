export interface WeightLogEntry {
  week: number;
  date: string;
  weightKg: number;
  doseMg: number;
  notes: string;
  avgDailySteps: number;
  mealsLogged: number;
}

export interface DoseEntry {
  date: string;
  step: number;
  doseMg: number;
  site: string;
  status: 'Taken' | 'Missed' | 'Scheduled';
  notes?: string;
}

export interface SideEffectReport {
  date: string;
  symptom: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  durationHours: number;
  relatedToDose: boolean;
}

export interface MealPhoto {
  id: string;
  title: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  date: string;
  proteinGrams: number;
  calories: number;
  notes: string;
  imageUrl: string;
}

export interface LabResultItem {
  name: string;
  baseline: string;
  latest: string;
  unit: string;
  referenceRange: string;
  status: 'Improved' | 'Stable' | 'Attention';
}

export interface LabReport {
  id: string;
  title: string;
  date: string;
  labName: string;
  results: LabResultItem[];
}

export const mockWeightHistory: WeightLogEntry[] = [
  { week: 1, date: '12 wks ago', weightKg: 89.0, doseMg: 0.25, notes: 'Initiated 0.25mg titration', avgDailySteps: 4800, mealsLogged: 18 },
  { week: 2, date: '11 wks ago', weightKg: 88.4, doseMg: 0.25, notes: 'Mild morning fullness', avgDailySteps: 5200, mealsLogged: 20 },
  { week: 3, date: '10 wks ago', weightKg: 87.8, doseMg: 0.25, notes: 'Appetite reduction noted', avgDailySteps: 6100, mealsLogged: 21 },
  { week: 4, date: '9 wks ago', weightKg: 87.1, doseMg: 0.25, notes: 'End of starting dose', avgDailySteps: 6500, mealsLogged: 21 },
  { week: 5, date: '8 wks ago', weightKg: 86.6, doseMg: 0.5, notes: 'Titrated up to 0.5mg', avgDailySteps: 6200, mealsLogged: 19 },
  { week: 6, date: '7 wks ago', weightKg: 86.0, doseMg: 0.5, notes: 'Mild nausea day 1', avgDailySteps: 5800, mealsLogged: 18 },
  { week: 7, date: '6 wks ago', weightKg: 85.3, doseMg: 0.5, notes: 'Stable appetite control', avgDailySteps: 6700, mealsLogged: 20 },
  { week: 8, date: '5 wks ago', weightKg: 84.7, doseMg: 0.5, notes: 'HbA1c repeat check', avgDailySteps: 7100, mealsLogged: 21 },
  { week: 9, date: '4 wks ago', weightKg: 84.1, doseMg: 0.5, notes: 'Good energy levels', avgDailySteps: 7400, mealsLogged: 21 },
  { week: 10, date: '3 wks ago', weightKg: 83.6, doseMg: 0.5, notes: 'Travel week, hydration dip', avgDailySteps: 6800, mealsLogged: 17 },
  { week: 11, date: '2 wks ago', weightKg: 83.2, doseMg: 0.5, notes: 'Mild nausea repeated', avgDailySteps: 7200, mealsLogged: 20 },
  { week: 12, date: 'Current', weightKg: 83.0, doseMg: 0.5, notes: 'Slight weight plateau last 8 days', avgDailySteps: 7350, mealsLogged: 19 },
];

export const mockDoseLog: DoseEntry[] = [
  { date: 'Oct 28', step: 2, doseMg: 0.5, site: 'Abdomen (Left)', status: 'Taken', notes: 'Inject with morning meal' },
  { date: 'Oct 21', step: 2, doseMg: 0.5, site: 'Abdomen (Right)', status: 'Taken' },
  { date: 'Oct 14', step: 2, doseMg: 0.5, site: 'Thigh (Right)', status: 'Taken' },
  { date: 'Oct 07', step: 2, doseMg: 0.5, site: 'Abdomen (Left)', status: 'Taken' },
  { date: 'Sep 30', step: 2, doseMg: 0.5, site: 'Abdomen (Right)', status: 'Taken' },
  { date: 'Sep 23', step: 1, doseMg: 0.25, site: 'Thigh (Left)', status: 'Taken' },
  { date: 'Nov 04', step: 2, doseMg: 0.5, site: 'Pending', status: 'Scheduled' },
];

export const mockSideEffects: SideEffectReport[] = [
  { date: 'Yesterday (Oct 28)', symptom: 'Nausea', severity: 'Mild', durationHours: 3, relatedToDose: true },
  { date: 'Oct 25', symptom: 'Constipation', severity: 'Mild', durationHours: 24, relatedToDose: false },
  { date: 'Oct 22', symptom: 'Nausea', severity: 'Mild', durationHours: 2, relatedToDose: true },
  { date: 'Oct 11', symptom: 'Fatigue', severity: 'Mild', durationHours: 4, relatedToDose: false },
];

export const mockMealPhotos: MealPhoto[] = [
  {
    id: 'm1',
    title: 'Moong Dal Chilla + Mint Curd',
    mealType: 'Breakfast',
    date: 'Today, 8:45 am',
    proteinGrams: 18,
    calories: 280,
    notes: 'Ate half portion; feeling full quickly',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  },
  {
    id: 'm2',
    title: 'Paneer Tikka Salad with Cucumber',
    mealType: 'Lunch',
    date: 'Yesterday, 1:30 pm',
    proteinGrams: 24,
    calories: 340,
    notes: 'Good satiety, no nausea afterwards',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
  },
  {
    id: 'm3',
    title: 'Warm Spiced Almond Milk',
    mealType: 'Snack',
    date: 'Oct 27, 5:00 pm',
    proteinGrams: 8,
    calories: 140,
    notes: 'Low sugar snack',
    imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&q=80',
  },
  {
    id: 'm4',
    title: 'Grilled Tofu & Steamed Broccoli',
    mealType: 'Dinner',
    date: 'Oct 26, 8:00 pm',
    proteinGrams: 22,
    calories: 310,
    notes: 'Light dinner to prevent evening reflux',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  },
  {
    id: 'm5',
    title: 'Sprouted Methi & Pomegranate Bowl',
    mealType: 'Breakfast',
    date: 'Oct 25, 9:00 am',
    proteinGrams: 14,
    calories: 220,
    notes: 'High fibre for digestion support',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
  },
  {
    id: 'm6',
    title: 'Palak Paneer with 1 Bajra Roti',
    mealType: 'Lunch',
    date: 'Oct 24, 1:15 pm',
    proteinGrams: 21,
    calories: 380,
    notes: 'Balanced carbs and protein',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
  },
];

export const mockLabReports: LabReport[] = [
  {
    id: 'LAB-01',
    title: '12-Week Metabolic & Endocrine Panel',
    date: '10 Oct 2026',
    labName: 'Thyrocare National Diagnostics',
    results: [
      { name: 'HbA1c', baseline: '6.4%', latest: '5.8%', unit: '%', referenceRange: '< 5.7%', status: 'Improved' },
      { name: 'Fasting Plasma Glucose', baseline: '118', latest: '98', unit: 'mg/dL', referenceRange: '70-100', status: 'Improved' },
      { name: 'Total Cholesterol', baseline: '228', latest: '194', unit: 'mg/dL', referenceRange: '< 200', status: 'Improved' },
      { name: 'Triglycerides', baseline: '210', latest: '158', unit: 'mg/dL', referenceRange: '< 150', status: 'Improved' },
      { name: 'HDL (Good) Cholesterol', baseline: '41', latest: '46', unit: 'mg/dL', referenceRange: '> 50', status: 'Stable' },
      { name: 'TSH (Thyroid)', baseline: '2.8', latest: '2.4', unit: 'uIU/mL', referenceRange: '0.4-4.2', status: 'Stable' },
      { name: 'Serum 25-OH Vitamin D', baseline: '16.2', latest: '32.4', unit: 'ng/mL', referenceRange: '30-100', status: 'Improved' },
    ],
  },
  {
    id: 'LAB-00',
    title: 'Baseline Diagnostic Workup (Pre-program)',
    date: '02 Aug 2026',
    labName: 'Dr Lal PathLabs',
    results: [
      { name: 'HbA1c', baseline: '6.4%', latest: '6.4%', unit: '%', referenceRange: '< 5.7%', status: 'Attention' },
      { name: 'Fasting Insulin', baseline: '19.4', latest: '19.4', unit: 'uIU/mL', referenceRange: '2.6-24.9', status: 'Attention' },
      { name: 'ALT (SGPT)', baseline: '38', latest: '38', unit: 'U/L', referenceRange: '< 35', status: 'Attention' },
      { name: 'eGFR (Kidney Function)', baseline: '98', latest: '98', unit: 'mL/min', referenceRange: '> 90', status: 'Stable' },
    ],
  },
];

export const mockLifestyleSummary = {
  avgDailySteps: 7120,
  targetSteps: 8000,
  avgSleepHours: 6.8,
  targetSleepHours: 7.5,
  dailyWaterLitres: 1.8,
  targetWaterLitres: 3.0,
  waterAlert: 'Low hydration (<2L/day) may aggravate GLP-1 nausea',
  recentMoodScore: '4/5 (Motivated)',
};

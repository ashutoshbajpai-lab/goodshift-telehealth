import { mockDoctors } from './doctors';

export interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  indication: string;
}

export interface ConsultationRecord {
  id: string;
  date: string;
  time: string;
  doctorId: string;
  doctorName: string;
  doctorQualification: string;
  doctorRegNumber: string;
  doctorAvatar: string;
  reason: string;
  status: 'Completed' | 'Scheduled' | 'In Progress';
  mode: 'video' | 'audio';
  durationMinutes: number;
  summary: string;
  keyPointers: string[];
  prescription: PrescriptionItem[];
  labTestsOrdered: string[];
  nextFollowUpDate: string;
  recordingWasOn: boolean;
  followUpWindowDaysRemaining?: number;
}

export const mockConsultations: ConsultationRecord[] = [
  {
    id: 'VC-000118',
    date: '25 Oct 2026',
    time: '4:30 PM',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ananya Sen',
    doctorQualification: 'MBBS, MD (Internal Medicine)',
    doctorRegNumber: 'MMC 2017/08/3412',
    doctorAvatar: mockDoctors[0].avatar,
    reason: 'Week 11 GLP-1 Progress & Nausea Management',
    status: 'Completed',
    mode: 'video',
    durationMinutes: 14,
    summary:
      'Patient Priya Sharma presented for week 11 follow-up on Semaglutide 0.5 mg weekly. Reported steady 6 kg loss over 11 weeks. Discussed mild nausea occurring the morning after dose administration. Advised maintaining 2.8-3.0 L hydration with electrolytes. Current dose maintained at 0.5 mg for another 4 weeks before considering titration.',
    keyPointers: [
      'Maintain Semaglutide at 0.5 mg weekly for another 4 weeks.',
      'Sip 500 ml room temperature water before injection; keep total water at 3 L daily.',
      'Split breakfast into two smaller protein-rich portions to avoid nausea.',
      'Avoid fatty or fried foods on injection evening.',
      'Repeat fasting lipid panel before the next monthly review.',
    ],
    prescription: [
      {
        medicineName: 'Semaglutide 0.5 mg / dose prefilled pen',
        dosage: '0.5 mg subcutaneous injection',
        frequency: 'Once weekly',
        duration: '4 weeks',
        instructions: 'Administer every Tuesday morning post breakfast',
        indication: 'GLP-1 Weight Management',
      },
      {
        medicineName: 'Oral Rehydration Salts (ORS) / Electrolyte Sachet',
        dosage: '1 sachet in 1 litre water',
        frequency: 'Daily mornings',
        duration: '14 days',
        instructions: 'Sip throughout the day for hydration',
        indication: 'Hydration & Nausea Prevention',
      },
    ],
    labTestsOrdered: ['Repeat Lipid Profile', 'Urine Microalbumin'],
    nextFollowUpDate: '22 Nov 2026',
    recordingWasOn: true,
    followUpWindowDaysRemaining: 4,
  },
  {
    id: 'VC-000094',
    date: '28 Sep 2026',
    time: '6:00 PM',
    doctorId: 'doc-2',
    doctorName: 'Dr. Rajesh Deshmukh',
    doctorQualification: 'MBBS, MD (General Medicine), DNB (Endo)',
    doctorRegNumber: 'MMC 2014/03/1829',
    doctorAvatar: mockDoctors[1].avatar,
    reason: 'Month 2 Titration Review (0.25 mg to 0.5 mg)',
    status: 'Completed',
    mode: 'video',
    durationMinutes: 18,
    summary:
      'Evaluated patient response after 4 weeks on starting dose of Semaglutide 0.25 mg. Patient tolerated starting dose with minimal gastrointestinal symptoms. Weight down from 89 kg to 86.6 kg. Approved dose escalation to step 2 (0.5 mg weekly). Reviewed injection technique and lifestyle metrics.',
    keyPointers: [
      'Titrated dose up to Step 2: 0.5 mg subcutaneous weekly.',
      'Monitor gastrointestinal symptoms closely during the first 72 hours.',
      'Target at least 70g daily dietary protein to preserve lean muscle mass.',
      'Continue brisk walking 30 minutes daily.',
    ],
    prescription: [
      {
        medicineName: 'Semaglutide 0.5 mg / dose prefilled pen',
        dosage: '0.5 mg subcutaneous injection',
        frequency: 'Once weekly',
        duration: '4 weeks',
        instructions: 'Administer every Tuesday morning',
        indication: 'Dose Titration Step 2',
      },
    ],
    labTestsOrdered: ['HbA1c', 'Serum Creatinine'],
    nextFollowUpDate: '25 Oct 2026',
    recordingWasOn: true,
  },
  {
    id: 'VC-000042',
    date: '03 Aug 2026',
    time: '11:15 AM',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ananya Sen',
    doctorQualification: 'MBBS, MD (Internal Medicine)',
    doctorRegNumber: 'MMC 2017/08/3412',
    doctorAvatar: mockDoctors[0].avatar,
    reason: 'Initial Program Onboarding & Medical Eligibility',
    status: 'Completed',
    mode: 'video',
    durationMinutes: 22,
    summary:
      'Comprehensive onboarding consultation for 34yo female with BMI 33.5 kg/m2 and background of PCOS. Baseline blood tests reviewed: HbA1c 6.4%, normal renal and liver profiles. No personal or family history of medullary thyroid carcinoma or pancreatitis. Approved initiation of GLP-1 medical weight loss with starting dose 0.25 mg.',
    keyPointers: [
      'Approved for GLP-1 therapy under clinical supervision.',
      'Start Semaglutide 0.25 mg weekly for first 4 weeks.',
      'Log daily meals, water intake, and weekly weigh-in every Friday.',
      'Consult emergency immediately if severe acute abdominal pain occurs.',
    ],
    prescription: [
      {
        medicineName: 'Semaglutide 0.25 mg / dose prefilled pen',
        dosage: '0.25 mg subcutaneous injection',
        frequency: 'Once weekly',
        duration: '4 weeks',
        instructions: 'Administer every Tuesday morning',
        indication: 'GLP-1 Initiation Step 1',
      },
    ],
    labTestsOrdered: ['Baseline Comprehensive Metabolic Panel (Completed)'],
    nextFollowUpDate: '28 Sep 2026',
    recordingWasOn: true,
  },
];

export interface Doctor {
  id: string;
  name: string;
  avatar: string;
  qualification: string;
  specialization: string;
  registrationNumber: string;
  languages: string[];
  verified: boolean;
  yearsOfExperience: number;
  availableNow: boolean;
  rating: number;
  reviewsCount: number;
  hospitalAffiliation: string;
}

export const mockDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Ananya Sen',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
    qualification: 'MBBS, MD (Internal Medicine)',
    specialization: 'Endocrinology & Metabolic Health Specialist',
    registrationNumber: 'MMC 2017/08/3412',
    languages: ['English', 'Hindi', 'Bengali'],
    verified: true,
    yearsOfExperience: 11,
    availableNow: true,
    rating: 4.9,
    reviewsCount: 420,
    hospitalAffiliation: 'Apollo Medical Center, Mumbai',
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Deshmukh',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
    qualification: 'MBBS, MD (General Medicine), DNB (Endo)',
    specialization: 'Consultant Diabetologist & Weight Management',
    registrationNumber: 'MMC 2014/03/1829',
    languages: ['English', 'Hindi', 'Marathi'],
    verified: true,
    yearsOfExperience: 14,
    availableNow: true,
    rating: 4.95,
    reviewsCount: 610,
    hospitalAffiliation: 'Lilavati Hospital, Mumbai',
  },
  {
    id: 'doc-3',
    name: 'Dr. Meera Nambiar',
    avatar: 'https://images.unsplash.com/photo-1594824813590-78148b68832a?w=400&q=80',
    qualification: 'MBBS, MD (Pharmacology), C.Diab',
    specialization: 'Clinical Obesity & GLP-1 Care Lead',
    registrationNumber: 'KMC 2019/04/1234',
    languages: ['English', 'Hindi', 'Malayalam'],
    verified: true,
    yearsOfExperience: 8,
    availableNow: false,
    rating: 4.88,
    reviewsCount: 310,
    hospitalAffiliation: 'Fortis Escorts, New Delhi',
  },
  {
    id: 'doc-4',
    name: 'Dr. Vikram Malhotra',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80',
    qualification: 'MBBS, DNB (Internal Medicine)',
    specialization: 'Cardiometabolic Lifestyle Physician',
    registrationNumber: 'DMC 2016/11/9021',
    languages: ['English', 'Hindi', 'Punjabi'],
    verified: true,
    yearsOfExperience: 10,
    availableNow: true,
    rating: 4.85,
    reviewsCount: 290,
    hospitalAffiliation: 'Max Super Speciality Hospital, Delhi NCR',
  },
];

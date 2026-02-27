// Tipos para el sistema de ofertas de trabajo

export interface JobOffer {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  experience: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  publishedDate: string;
  expiryDate: string;
  isActive: boolean;
  applicationsCount: number;
  urgency: 'low' | 'medium' | 'high';
  category: string;
}

export interface JobApplication {
  id: string;
  jobOfferId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  coverLetter: string;
  cv: File | null;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
}

export interface JobCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}
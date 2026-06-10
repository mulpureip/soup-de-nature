export interface SoapProduct {
  id: string;
  name: string;
  skinType: '건성 피부' | '지성 피부' | '민감성 피부' | '복합성 피부';
  ingredients: string[];
  benefits: string[];
  description: string;
  image: string; // Placeholder or illustrative SVG structure
  priceInfo?: string; 
  reasons: string;
}

export interface Ingredient {
  id: string;
  name: string;
  location: string;
  benefit: string;
  fullDesc: string;
  color: string;
  iconName: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  skinType: string;
  product: string;
  content: string;
  beforeText: string;
  afterText: string;
  date: string;
}

export interface DiagnosisResult {
  skinType: string;
  summary: string;
  analysis: string;
  recommendedSoaps: {
    name: string;
    keyBenefits: string;
    reason: string;
  }[];
  skincareGuide: string[];
}

export interface Article {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  readingTime: string;
  date: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

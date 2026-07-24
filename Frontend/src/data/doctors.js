/**
 * Sehat-Sathi Doctor Directory Data
 * Comprehensive mock doctor profiles with all required fields.
 * Architecture is ready for real backend data to replace this.
 */

export const SPECIALIZATIONS = [
  "All",
  "Cardiologist",
  "Dermatologist",
  "Diabetologist",
  "ENT Specialist",
  "Gastroenterologist",
  "General Physician",
  "Gynecologist",
  "Neurologist",
  "Oncologist",
  "Ophthalmologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Psychiatrist",
  "Pulmonologist",
  "Radiologist",
  "Urologist",
];

export const CONSULTATION_TYPES = ["All", "Online", "Offline", "Both"];
export const EXPERIENCE_RANGES = ["All", "1-5 years", "5-10 years", "10-15 years", "15+ years"];
export const AVAILABILITY_OPTIONS = ["All", "Available Today", "This Week"];
export const RATING_OPTIONS = ["All", "4.5+", "4.0+", "3.5+"];

export const MOCK_DOCTORS = [
  {
    id: "doc1",
    name: "Dr. Anjali Sharma",
    qualification: "MBBS, MD (Cardiology)",
    specialization: "Cardiologist",
    hospital: "Apollo Hospital, New Delhi",
    city: "New Delhi",
    experience_years: 14,
    languages: ["Hindi", "English"],
    consultation_fee: 1200,
    availability: "Available Today",
    rating: 4.9,
    review_count: 342,
    verified: true,
    consultation_types: ["Online", "Offline"],
    about: "Specialized in interventional cardiology with 14+ years of experience treating complex cardiac conditions. Former Head of Cardiology at AIIMS Delhi.",
    education: ["MBBS – AIIMS New Delhi", "MD Cardiology – AIIMS New Delhi", "Fellowship – Johns Hopkins USA"],
    certifications: ["FSCAI", "FACC", "Board Certified Cardiologist"],
    clinic_address: "Apollo Hospital, Sarita Vihar, New Delhi – 110076",
    profile_photo: null,
    next_available: "Today 2:30 PM",
    total_patients: 2800,
  },
  {
    id: "doc2",
    name: "Dr. Rahul Mehta",
    qualification: "MBBS, MS (Orthopedics)",
    specialization: "Orthopedic Surgeon",
    hospital: "Medanta Hospital, Gurgaon",
    city: "Gurgaon",
    experience_years: 11,
    languages: ["Hindi", "English", "Punjabi"],
    consultation_fee: 900,
    availability: "Available Today",
    rating: 4.7,
    review_count: 215,
    verified: true,
    consultation_types: ["Offline"],
    about: "Expert in joint replacement surgeries, sports injuries, and spine disorders. Performed 1,200+ successful knee and hip replacements.",
    education: ["MBBS – KEM Hospital, Mumbai", "MS Orthopedics – PGI Chandigarh"],
    certifications: ["Member – Indian Orthopedic Association", "Certified Joint Replacement Surgeon"],
    clinic_address: "Medanta – The Medicity, Sector 38, Gurgaon – 122001",
    profile_photo: null,
    next_available: "Today 11:00 AM",
    total_patients: 1600,
  },
  {
    id: "doc3",
    name: "Dr. Priya Nair",
    qualification: "MBBS, DNB (Pediatrics)",
    specialization: "Pediatrician",
    hospital: "Rainbow Children's Hospital, Bangalore",
    city: "Bangalore",
    experience_years: 8,
    languages: ["English", "Kannada", "Malayalam"],
    consultation_fee: 600,
    availability: "This Week",
    rating: 4.8,
    review_count: 489,
    verified: true,
    consultation_types: ["Online", "Offline"],
    about: "Passionate pediatrician with expertise in newborn care, vaccination, childhood illnesses, and developmental assessments.",
    education: ["MBBS – Kasturba Medical College, Manipal", "DNB Pediatrics – Rainbow Hospital, Hyderabad"],
    certifications: ["IAP Fellow", "NRP Certified", "Member – Indian Academy of Pediatrics"],
    clinic_address: "Rainbow Children's Hospital, Marathahalli, Bangalore – 560037",
    profile_photo: null,
    next_available: "Tomorrow 10:00 AM",
    total_patients: 3200,
  },
  {
    id: "doc4",
    name: "Dr. Vikram Singh",
    qualification: "MBBS, DM (Neurology)",
    specialization: "Neurologist",
    hospital: "Fortis Hospital, Mumbai",
    city: "Mumbai",
    experience_years: 16,
    languages: ["Hindi", "English", "Marathi"],
    consultation_fee: 1500,
    availability: "Available Today",
    rating: 4.9,
    review_count: 178,
    verified: true,
    consultation_types: ["Online", "Offline"],
    about: "Senior neurologist specializing in stroke management, epilepsy, Parkinson's, and movement disorders. Trained at National Institute of Mental Health, USA.",
    education: ["MBBS – Grant Medical College, Mumbai", "MD Medicine – KEM Hospital", "DM Neurology – NIMHANS"],
    certifications: ["FIAN", "Member – Indian Academy of Neurology"],
    clinic_address: "Fortis Hospital, Mulund, Mumbai – 400078",
    profile_photo: null,
    next_available: "Today 4:00 PM",
    total_patients: 1900,
  },
  {
    id: "doc5",
    name: "Dr. Sneha Kapoor",
    qualification: "MBBS, MD (Dermatology)",
    specialization: "Dermatologist",
    hospital: "Skin Clinic & Aesthetics, Pune",
    city: "Pune",
    experience_years: 6,
    languages: ["Hindi", "English", "Marathi"],
    consultation_fee: 700,
    availability: "Available Today",
    rating: 4.6,
    review_count: 623,
    verified: true,
    consultation_types: ["Online", "Offline"],
    about: "Expert in medical dermatology, cosmetic procedures, laser treatments, and skin cancer diagnosis. Special interest in acne, psoriasis, and vitiligo.",
    education: ["MBBS – BJ Medical College, Pune", "MD Dermatology – BJ Medical College"],
    certifications: ["IADVL Member", "Certified Dermatosurgeon", "Laser Therapy Certified"],
    clinic_address: "Aundh, Pune – 411007",
    profile_photo: null,
    next_available: "Today 3:00 PM",
    total_patients: 2100,
  },
  {
    id: "doc6",
    name: "Dr. Aakash Gupta",
    qualification: "MBBS, MD (General Medicine), MRCP",
    specialization: "General Physician",
    hospital: "Max Super Speciality Hospital, Delhi",
    city: "New Delhi",
    experience_years: 9,
    languages: ["Hindi", "English"],
    consultation_fee: 500,
    availability: "Available Today",
    rating: 4.5,
    review_count: 891,
    verified: true,
    consultation_types: ["Online", "Offline"],
    about: "Comprehensive general physician with expertise in diabetes, hypertension, thyroid disorders, and preventive healthcare. Available for telehealth consultations.",
    education: ["MBBS – Maulana Azad Medical College", "MD General Medicine – MAMC", "MRCP – Royal College of Physicians, UK"],
    certifications: ["MRCP", "Diabetologist Certified", "API Member"],
    clinic_address: "Max Hospital, Saket, New Delhi – 110017",
    profile_photo: null,
    next_available: "Today 9:30 AM",
    total_patients: 4500,
  },
  {
    id: "doc7",
    name: "Dr. Meera Iyer",
    qualification: "MBBS, MS (Gynecology & Obstetrics)",
    specialization: "Gynecologist",
    hospital: "Motherhood Hospital, Chennai",
    city: "Chennai",
    experience_years: 12,
    languages: ["Tamil", "English", "Telugu"],
    consultation_fee: 800,
    availability: "This Week",
    rating: 4.8,
    review_count: 567,
    verified: true,
    consultation_types: ["Online", "Offline"],
    about: "High-risk pregnancy specialist, fertility consultant, and laparoscopic surgeon. Dedicated to maternal-fetal health and women's wellness.",
    education: ["MBBS – Madras Medical College", "MS Gynecology – Madras Medical College"],
    certifications: ["FOGSI Member", "High-Risk Pregnancy Specialist", "Laparoscopic Surgeon Certified"],
    clinic_address: "Motherhood Hospital, Nungambakkam, Chennai – 600034",
    profile_photo: null,
    next_available: "Thu 11:00 AM",
    total_patients: 2700,
  },
  {
    id: "doc8",
    name: "Dr. Rohan Desai",
    qualification: "MBBS, MD (Psychiatry)",
    specialization: "Psychiatrist",
    hospital: "NIMHANS, Bangalore",
    city: "Bangalore",
    experience_years: 7,
    languages: ["English", "Hindi", "Kannada"],
    consultation_fee: 1000,
    availability: "Available Today",
    rating: 4.7,
    review_count: 204,
    verified: true,
    consultation_types: ["Online", "Offline"],
    about: "Mental health specialist focused on anxiety, depression, ADHD, OCD, and addiction recovery. Believer in evidence-based, compassionate care.",
    education: ["MBBS – JIPMER, Puducherry", "MD Psychiatry – NIMHANS, Bangalore"],
    certifications: ["Member – Indian Psychiatric Society", "CBT Certified Therapist"],
    clinic_address: "NIMHANS Campus, Hosur Road, Bangalore – 560029",
    profile_photo: null,
    next_available: "Today 5:00 PM",
    total_patients: 1100,
  },
];

export const filterDoctors = (doctors, { specialization, consultationType, experience, rating, search, availability }) => {
  return doctors.filter(doc => {
    if (specialization && specialization !== "All" && doc.specialization !== specialization) return false;
    if (consultationType && consultationType !== "All") {
      if (consultationType === "Online" && !doc.consultation_types.includes("Online")) return false;
      if (consultationType === "Offline" && !doc.consultation_types.includes("Offline")) return false;
    }
    if (experience && experience !== "All") {
      const [min, max] = experience.split("-").map(s => parseInt(s));
      if (max) { if (doc.experience_years < min || doc.experience_years > max) return false; }
      else { if (doc.experience_years < min) return false; }
    }
    if (rating && rating !== "All") {
      const minRating = parseFloat(rating.replace("+", ""));
      if (doc.rating < minRating) return false;
    }
    if (availability && availability !== "All") {
      if (availability === "Available Today" && doc.availability !== "Available Today") return false;
    }
    if (search) {
      const s = search.toLowerCase();
      if (!doc.name.toLowerCase().includes(s) && !doc.specialization.toLowerCase().includes(s) && !doc.hospital.toLowerCase().includes(s)) return false;
    }
    return true;
  });
};

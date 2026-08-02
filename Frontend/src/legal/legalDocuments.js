/**
 * Sehat-Sathi — Complete Legal Ecosystem
 * Enterprise-grade bilingual (English + Hindi) legal documentation
 *
 * Version:        1.0
 * Effective Date: 01 August 2026
 * Jurisdiction:   Republic of India
 * Compliance:     IT Act 2000 | DPDP Act 2023 | Telemedicine Guidelines 2020
 *                 Consumer Protection Act 2019 | GDPR-compatible
 *
 * This file exports all NEW legal documents (43 documents).
 * It imports existing documents from ./terms.js.
 * The FULL_DOCUMENT_REGISTRY combines all 50 documents.
 */

import {
  TERMS, PRIVACY, MEDICAL_DISCLAIMER, AI_DISCLAIMER,
  EMERGENCY_DISCLAIMER, COMMUNITY_GUIDELINES, PATIENT_RIGHTS,
  CONSENTS, META
} from "./terms";

// ─────────────────────────────────────────────────────────────────────────────
// 1. COOKIE POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const COOKIE_POLICY = {
  id: "cookie",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Cookie Policy",
    subtitle: "How Sehat-Sathi uses cookies and similar tracking technologies.",
    sections: [
      {
        id: "C1", title: "1. What Are Cookies",
        content: `Cookies are small text files placed on your device when you visit a website. They help the Platform remember your preferences, maintain your session, and improve your experience. Sehat-Sathi uses cookies and similar technologies including local storage, session storage, and web beacons.`
      },
      {
        id: "C2", title: "2. Types of Cookies We Use",
        content: `(a) Essential Cookies: Required for the Platform to function. These cannot be disabled. Examples: authentication tokens, session management, CSRF protection.\n\n(b) Functional Cookies: Remember your preferences (language, theme, region). These improve your experience.\n\n(c) Analytics Cookies: Collect anonymized usage data to help us understand how Users interact with the Platform. We use privacy-respecting analytics.\n\n(d) Security Cookies: Detect fraudulent activity and protect account security.\n\nWe do NOT use advertising or third-party tracking cookies for behavioral profiling.`
      },
      {
        id: "C3", title: "3. Cookie Duration",
        content: `Session cookies: Expire when you close your browser.\nPersistent cookies: Remain for a defined period (maximum 12 months) or until manually deleted.\nAuthentication tokens: Expire after 30 days of inactivity.`
      },
      {
        id: "C4", title: "4. Managing Cookies",
        content: `You may control cookies through your browser settings. Disabling essential cookies will impair Platform functionality. You can clear cookies at any time through your browser. Revoking cookie consent will not affect the lawfulness of processing that occurred before withdrawal.`
      },
      {
        id: "C5", title: "5. Compliance",
        content: `Our cookie practices comply with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023. For users in the European Union, we comply with the ePrivacy Directive to the extent applicable.\n\nContact: legal@sehatsathi.in`
      }
    ]
  },
  hi: {
    title: "कुकी नीति",
    subtitle: "सेहत-साथी कुकीज़ और समान ट्रैकिंग तकनीकों का उपयोग कैसे करता है।",
    sections: [
      {
        id: "C1", title: "1. कुकीज़ क्या हैं",
        content: `कुकीज़ छोटी टेक्स्ट फ़ाइलें हैं जो वेबसाइट विज़िट के दौरान आपके डिवाइस पर रखी जाती हैं। ये प्लेटफ़ॉर्म को आपकी प्राथमिकताएं याद रखने, आपके सत्र को बनाए रखने और आपके अनुभव को बेहतर बनाने में मदद करती हैं।`
      },
      {
        id: "C2", title: "2. हम किस प्रकार की कुकीज़ का उपयोग करते हैं",
        content: `(क) आवश्यक कुकीज़: प्लेटफ़ॉर्म के कार्य के लिए आवश्यक। इन्हें अक्षम नहीं किया जा सकता।\n\n(ख) कार्यात्मक कुकीज़: आपकी प्राथमिकताएं (भाषा, थीम) याद रखती हैं।\n\n(ग) विश्लेषण कुकीज़: गुमनाम उपयोग डेटा एकत्र करती हैं।\n\n(घ) सुरक्षा कुकीज़: धोखाधड़ी गतिविधि का पता लगाती हैं।\n\nहम व्यवहार प्रोफाइलिंग के लिए विज्ञापन कुकीज़ का उपयोग नहीं करते।`
      },
      {
        id: "C3", title: "3. कुकी अवधि",
        content: `सत्र कुकीज़: ब्राउज़र बंद होने पर समाप्त।\nस्थायी कुकीज़: अधिकतम 12 महीने तक।\nप्रमाणीकरण टोकन: 30 दिन की निष्क्रियता के बाद समाप्त।`
      },
      {
        id: "C4", title: "4. कुकीज़ प्रबंधन",
        content: `आप अपनी ब्राउज़र सेटिंग्स के माध्यम से कुकीज़ को नियंत्रित कर सकते हैं। आवश्यक कुकीज़ को अक्षम करने से प्लेटफ़ॉर्म की कार्यक्षमता प्रभावित होगी।`
      },
      {
        id: "C5", title: "5. अनुपालन",
        content: `हमारी कुकी प्रथाएं सूचना प्रौद्योगिकी अधिनियम, 2000 और डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 का अनुपालन करती हैं। संपर्क: legal@sehatsathi.in`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. TELEMEDICINE DISCLAIMER
// ─────────────────────────────────────────────────────────────────────────────
export const TELEMEDICINE_DISCLAIMER = {
  id: "telemedicine",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Telemedicine Disclaimer",
    subtitle: "Important information about online medical consultations facilitated by Sehat-Sathi.",
    sections: [
      {
        id: "T1", title: "1. Nature of Telemedicine",
        content: `Telemedicine consultations on Sehat-Sathi are facilitated in accordance with the Telemedicine Practice Guidelines, 2020 issued by the Board of Governors in supersession of the Medical Council of India. These guidelines govern what types of consultations, advice, and prescriptions are permissible via telemedicine in India.\n\nSehat-Sathi ONLY provides the technology infrastructure for such consultations. Sehat-Sathi is NOT a party to the doctor-patient relationship established during any telemedicine consultation.`
      },
      {
        id: "T2", title: "2. Limitations of Telemedicine",
        content: `Telemedicine has inherent limitations compared to in-person consultation:\n\n(a) A doctor cannot physically examine a patient during a telemedicine session.\n(b) Certain conditions require physical examination for accurate diagnosis.\n(c) Technical issues (connectivity, audio/video quality) may affect consultation quality.\n(d) Telemedicine is NOT appropriate for emergency medical conditions.\n(e) Prescription of certain medication categories is restricted under telemedicine guidelines.\n\nAlways consult an in-person doctor when physical examination is required or when your condition is urgent.`
      },
      {
        id: "T3", title: "3. Doctor's Responsibility",
        content: `Every Doctor conducting telemedicine consultations through the Platform is solely responsible for:\n(a) Assessing whether telemedicine is appropriate for the patient's condition;\n(b) The accuracy of their diagnosis and advice;\n(c) Compliance with the Telemedicine Practice Guidelines 2020;\n(d) Any prescriptions issued — only those medications permitted under telemedicine guidelines may be prescribed;\n(e) Maintaining the standard of care expected of a licensed medical professional.`
      },
      {
        id: "T4", title: "4. Patient's Acknowledgment",
        content: `By using telemedicine services, you acknowledge and agree:\n(a) That telemedicine may not be suitable for all medical conditions;\n(b) That you will seek in-person care if your condition requires physical examination;\n(c) That Sehat-Sathi does not guarantee the outcome of any telemedicine consultation;\n(d) That all medical advice received is the sole responsibility of the consulting Doctor;\n(e) In an emergency, call 112 immediately — do NOT use telemedicine.`
      },
      {
        id: "T5", title: "5. Technical Disclaimer",
        content: `Sehat-Sathi does not guarantee uninterrupted connectivity during telemedicine sessions. If a session is interrupted due to technical issues attributable to the Platform, a full refund or rescheduling will be offered. Sehat-Sathi is not responsible for interruptions caused by your internet service provider, device failure, or other factors outside its control.`
      }
    ]
  },
  hi: {
    title: "टेलीमेडिसिन अस्वीकरण",
    subtitle: "सेहत-साथी द्वारा सुविधाजनक ऑनलाइन चिकित्सा परामर्श के बारे में महत्वपूर्ण जानकारी।",
    sections: [
      {
        id: "T1", title: "1. टेलीमेडिसिन की प्रकृति",
        content: `सेहत-साथी पर टेलीमेडिसिन परामर्श भारतीय चिकित्सा परिषद के अधीक्षण में बोर्ड ऑफ गवर्नर्स द्वारा जारी टेलीमेडिसिन प्रैक्टिस गाइडलाइन्स 2020 के अनुसार सुविधाजनक बनाई जाती है। सेहत-साथी केवल प्रौद्योगिकी ढांचा प्रदान करता है। किसी भी टेलीमेडिसिन परामर्श के दौरान स्थापित डॉक्टर-मरीज संबंध में सेहत-साथी एक पक्ष नहीं है।`
      },
      {
        id: "T2", title: "2. टेलीमेडिसिन की सीमाएं",
        content: `टेलीमेडिसिन में व्यक्तिगत परामर्श की तुलना में अंतर्निहित सीमाएं हैं:\n\n(क) डॉक्टर टेलीमेडिसिन सत्र के दौरान मरीज की शारीरिक जांच नहीं कर सकते।\n(ख) कुछ स्थितियों के लिए सटीक निदान हेतु शारीरिक परीक्षण की आवश्यकता होती है।\n(ग) तकनीकी समस्याएं परामर्श गुणवत्ता को प्रभावित कर सकती हैं।\n(घ) टेलीमेडिसिन आपातकालीन चिकित्सा स्थितियों के लिए उपयुक्त नहीं है।`
      },
      {
        id: "T3", title: "3. डॉक्टर की जिम्मेदारी",
        content: `प्लेटफ़ॉर्म के माध्यम से टेलीमेडिसिन परामर्श आयोजित करने वाला प्रत्येक डॉक्टर अकेले जिम्मेदार है: (क) यह आकलन करने के लिए कि टेलीमेडिसिन मरीज की स्थिति के लिए उचित है या नहीं; (ख) उनके निदान और सलाह की सटीकता; (ग) टेलीमेडिसिन प्रैक्टिस गाइडलाइन्स 2020 का अनुपालन।`
      },
      {
        id: "T4", title: "4. मरीज की स्वीकृति",
        content: `टेलीमेडिसिन सेवाओं का उपयोग करके, आप स्वीकार करते हैं: (क) टेलीमेडिसिन सभी चिकित्सा स्थितियों के लिए उपयुक्त नहीं हो सकती; (ख) आपातकाल में, तुरंत 112 पर कॉल करें — टेलीमेडिसिन का उपयोग न करें।`
      },
      {
        id: "T5", title: "5. तकनीकी अस्वीकरण",
        content: `सेहत-साथी टेलीमेडिसिन सत्रों के दौरान निर्बाध कनेक्टिविटी की गारंटी नहीं देता। यदि प्लेटफ़ॉर्म की ओर से तकनीकी समस्याओं के कारण सत्र बाधित होता है, तो पूर्ण रिफंड या पुनर्निर्धारण प्रदान किया जाएगा।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. USER AGREEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const USER_AGREEMENT = {
  id: "user_agreement",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "User Agreement",
    subtitle: "Binding agreement between Users and Sehat-Sathi governing platform access and usage.",
    sections: [
      {
        id: "UA1", title: "1. Agreement Scope",
        content: `This User Agreement ("Agreement") is a legally binding contract between you ("User") and Sehat-Sathi ("Platform"). By creating an account or using any service, you enter into this Agreement. This Agreement applies to all User roles: Patient, Doctor, Hospital, Laboratory, Pharmacy, Nurse, and Ambulance Partner.`
      },
      {
        id: "UA2", title: "2. Account Obligations",
        content: `You agree to:\n(a) Provide truthful, accurate, and complete information during registration;\n(b) Maintain and update your profile information to keep it current;\n(c) Protect your account credentials — do not share your password;\n(d) Notify Sehat-Sathi immediately at support@sehatsathi.in if you suspect unauthorized access;\n(e) Use the Platform only for lawful purposes;\n(f) Not impersonate any person or entity;\n(g) Not create accounts under false pretenses.`
      },
      {
        id: "UA3", title: "3. Prohibited Conduct",
        content: `Users must NOT:\n(a) Upload fraudulent, fake, or manipulated medical reports or credentials;\n(b) Harass, threaten, or abuse other Users or Healthcare Providers;\n(c) Attempt to breach the Platform's security systems;\n(d) Use automated tools (bots, scrapers) to extract data;\n(e) Transmit malware, viruses, or harmful code;\n(f) Engage in any activity that violates applicable Indian law;\n(g) Share another person's medical data without their explicit written consent;\n(h) Use the Platform to facilitate unauthorized commercial activities.`
      },
      {
        id: "UA4", title: "4. Platform Availability",
        content: `Sehat-Sathi strives for maximum uptime but does not guarantee uninterrupted service. Scheduled maintenance, emergency repairs, or factors beyond our control may cause temporary interruptions. Sehat-Sathi will make reasonable efforts to provide advance notice of scheduled downtime. No liability arises from temporary service interruptions.`
      },
      {
        id: "UA5", title: "5. Consequences of Breach",
        content: `Breach of this Agreement may result in:\n(a) Immediate account suspension or permanent termination;\n(b) Forfeiture of any unused credits or wallet balance (in cases of fraud);\n(c) Reporting to relevant medical authorities (for healthcare professionals);\n(d) Civil or criminal legal action under applicable Indian law;\n(e) Disclosure to law enforcement as required.`
      }
    ]
  },
  hi: {
    title: "उपयोगकर्ता अनुबंध",
    subtitle: "उपयोगकर्ताओं और सेहत-साथी के बीच प्लेटफ़ॉर्म उपयोग को नियंत्रित करने वाला बाध्यकारी समझौता।",
    sections: [
      {
        id: "UA1", title: "1. अनुबंध का दायरा",
        content: `यह उपयोगकर्ता अनुबंध आपके ("उपयोगकर्ता") और सेहत-साथी ("प्लेटफ़ॉर्म") के बीच एक कानूनी रूप से बाध्यकारी अनुबंध है। खाता बनाकर या किसी भी सेवा का उपयोग करके, आप इस अनुबंध में प्रवेश करते हैं।`
      },
      {
        id: "UA2", title: "2. खाता दायित्व",
        content: `आप निम्नलिखित के लिए सहमत हैं:\n(क) पंजीकरण के दौरान सत्य, सटीक और पूर्ण जानकारी प्रदान करना;\n(ख) अपनी प्रोफ़ाइल जानकारी को अद्यतन रखना;\n(ग) अपने खाते की साख की रक्षा करना;\n(घ) अनधिकृत पहुंच का संदेह होने पर तुरंत support@sehatsathi.in पर सूचित करना।`
      },
      {
        id: "UA3", title: "3. प्रतिबंधित आचरण",
        content: `उपयोगकर्ताओं को निम्नलिखित नहीं करना चाहिए:\n(क) धोखाधड़ीपूर्ण, नकली या हेरफेर की गई मेडिकल रिपोर्ट या क्रेडेंशियल अपलोड करना;\n(ख) अन्य उपयोगकर्ताओं को परेशान करना या धमकी देना;\n(ग) प्लेटफ़ॉर्म की सुरक्षा प्रणालियों को तोड़ने का प्रयास करना;\n(घ) लागू भारतीय कानून का उल्लंघन करने वाली किसी भी गतिविधि में संलग्न होना।`
      },
      {
        id: "UA4", title: "4. प्लेटफ़ॉर्म उपलब्धता",
        content: `सेहत-साथी अधिकतम अपटाइम के लिए प्रयास करता है लेकिन निर्बाध सेवा की गारंटी नहीं देता। अस्थायी रुकावटों से कोई दायित्व नहीं उत्पन्न होता।`
      },
      {
        id: "UA5", title: "5. उल्लंघन के परिणाम",
        content: `इस अनुबंध के उल्लंघन के परिणामस्वरूप हो सकता है:\n(क) तत्काल खाता निलंबन या स्थायी समाप्ति;\n(ख) संबंधित चिकित्सा प्राधिकरणों को रिपोर्ट करना;\n(ग) लागू भारतीय कानून के तहत दीवानी या आपराधिक कानूनी कार्रवाई।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. DOCTOR AGREEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const DOCTOR_AGREEMENT = {
  id: "doctor_agreement",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Doctor Agreement",
    subtitle: "Binding agreement for licensed medical practitioners registering on Sehat-Sathi.",
    sections: [
      {
        id: "DA1", title: "1. Eligibility & Registration",
        content: `To register as a Doctor on Sehat-Sathi, you must:\n(a) Hold a valid MBBS or equivalent degree from a recognized institution;\n(b) Possess valid registration with the Medical Council of India (MCI), National Medical Commission (NMC), or the relevant State Medical Council;\n(c) Be in good standing with no active suspension, cancellation, or disciplinary proceedings against your license;\n(d) Upload valid proof of: medical degree, registration certificate, government-issued ID, and any specialty certifications;\n(e) Be at least 25 years of age;\n(f) Possess a valid medical registration number.\n\nAny falsification of credentials constitutes fraud and will result in immediate permanent suspension and reporting to relevant authorities.`
      },
      {
        id: "DA2", title: "2. Doctor's Sole Medical Responsibility",
        content: `As a Doctor on the Platform, you are SOLELY AND EXCLUSIVELY responsible for:\n(a) All medical advice, diagnoses, and treatment plans you provide;\n(b) All prescriptions issued — only those medications permitted under Telemedicine Practice Guidelines 2020 may be prescribed via the Platform;\n(c) The accuracy and completeness of your medical opinions;\n(d) Assessing whether a patient's condition is appropriate for telemedicine;\n(e) Maintaining professional ethics in accordance with MCI/NMC Code of Medical Ethics;\n(f) Patient confidentiality and privacy;\n(g) Referring patients to in-person care when clinically necessary;\n(h) Informing Sehat-Sathi immediately if your license is suspended, cancelled, or subject to disciplinary action.\n\nSehat-Sathi bears NO medical liability whatsoever for your clinical decisions.`
      },
      {
        id: "DA3", title: "3. Platform Obligations",
        content: `Sehat-Sathi will provide:\n(a) A secure technology platform for conducting telemedicine consultations;\n(b) Appointment management and scheduling infrastructure;\n(c) Patient medical history (as uploaded by patients) to inform consultations;\n(d) Secure digital prescription generation tools;\n(e) Payment collection and disbursement services (after applicable platform fees).`
      },
      {
        id: "DA4", title: "4. Prohibited Conduct for Doctors",
        content: `Doctors must NOT:\n(a) Prescribe medications restricted by Telemedicine Practice Guidelines;\n(b) Provide false availability information to patients;\n(c) Engage in unprofessional or unethical conduct with patients;\n(d) Accept consultations for conditions that clearly require in-person care without directing the patient appropriately;\n(e) Share patient medical data with unauthorized third parties;\n(f) Use the Platform for commercial solicitation unrelated to legitimate medical practice;\n(g) Misrepresent qualifications, specializations, or experience.`
      },
      {
        id: "DA5", title: "5. Revenue & Payment",
        content: `Consultation fees are set by the Doctor subject to Platform guidelines. Sehat-Sathi deducts a platform fee (as communicated separately) before disbursing payment. Payments are processed within 7-14 business days after consultation completion. Refunds issued to patients due to Doctor no-show may be debited from the Doctor's account.`
      },
      {
        id: "DA6", title: "6. Indemnification",
        content: `You agree to indemnify, defend, and hold harmless Sehat-Sathi, its officers, directors, and employees from any and all claims, damages, losses, liabilities, costs, and expenses (including legal fees) arising from: (a) Your medical advice, diagnosis, or treatment; (b) Your violation of any applicable law or regulation; (c) Your breach of this Agreement; (d) Any complaint filed against you by a patient.`
      }
    ]
  },
  hi: {
    title: "डॉक्टर अनुबंध",
    subtitle: "सेहत-साथी पर पंजीकरण करने वाले लाइसेंस प्राप्त चिकित्सा व्यवसायियों के लिए बाध्यकारी समझौता।",
    sections: [
      {
        id: "DA1", title: "1. पात्रता और पंजीकरण",
        content: `सेहत-साथी पर डॉक्टर के रूप में पंजीकरण करने के लिए, आपके पास होना चाहिए:\n(क) किसी मान्यता प्राप्त संस्थान से वैध MBBS या समकक्ष डिग्री;\n(ख) भारतीय चिकित्सा परिषद (MCI), राष्ट्रीय चिकित्सा आयोग (NMC) या संबंधित राज्य चिकित्सा परिषद के साथ वैध पंजीकरण;\n(ग) अच्छी स्थिति में होना — आपके लाइसेंस के खिलाफ कोई सक्रिय निलंबन, रद्दीकरण या अनुशासनात्मक कार्यवाही नहीं होनी चाहिए।\n\nप्रमाण-पत्रों की किसी भी मिथ्या जानकारी धोखाधड़ी है और इसके परिणामस्वरूप तत्काल स्थायी निलंबन होगा।`
      },
      {
        id: "DA2", title: "2. डॉक्टर की एकमात्र चिकित्सा जिम्मेदारी",
        content: `प्लेटफ़ॉर्म पर डॉक्टर के रूप में, आप अकेले और विशेष रूप से जिम्मेदार हैं:\n(क) सभी चिकित्सा सलाह, निदान और उपचार योजनाओं के लिए;\n(ख) सभी जारी किए गए नुस्खों के लिए;\n(ग) रोगी गोपनीयता और गोपनीयता के लिए;\n(घ) यह सूचित करने के लिए कि आपका लाइसेंस निलंबित, रद्द किया गया है या अनुशासनात्मक कार्रवाई के अधीन है।\n\nसेहत-साथी आपके नैदानिक निर्णयों के लिए कोई चिकित्सा दायित्व नहीं वहन करता।`
      },
      {
        id: "DA3", title: "3. प्लेटफ़ॉर्म के दायित्व",
        content: `सेहत-साथी प्रदान करेगा:\n(क) टेलीमेडिसिन परामर्श के लिए एक सुरक्षित प्रौद्योगिकी प्लेटफ़ॉर्म;\n(ख) अपॉइंटमेंट प्रबंधन और शेड्यूलिंग ढांचा;\n(ग) डिजिटल प्रिस्क्रिप्शन उत्पन्न करने के उपकरण;\n(घ) भुगतान संग्रह और वितरण सेवाएं।`
      },
      {
        id: "DA4", title: "4. डॉक्टरों के लिए प्रतिबंधित आचरण",
        content: `डॉक्टरों को निम्नलिखित नहीं करना चाहिए:\n(क) टेलीमेडिसिन प्रैक्टिस गाइडलाइन्स द्वारा प्रतिबंधित दवाएं लिखना;\n(ख) मरीजों को झूठी उपलब्धता जानकारी देना;\n(ग) मरीजों के साथ अव्यावसायिक आचरण करना।`
      },
      {
        id: "DA5", title: "5. राजस्व और भुगतान",
        content: `परामर्श शुल्क प्लेटफ़ॉर्म दिशानिर्देशों के अधीन डॉक्टर द्वारा निर्धारित किए जाते हैं। सेहत-साथी भुगतान वितरित करने से पहले एक प्लेटफ़ॉर्म शुल्क काटता है। डॉक्टर की अनुपस्थिति के कारण मरीजों को जारी किए गए रिफंड डॉक्टर के खाते से डेबिट किए जा सकते हैं।`
      },
      {
        id: "DA6", title: "6. क्षतिपूर्ति",
        content: `आप सेहत-साथी, उसके अधिकारियों और कर्मचारियों को किसी भी और सभी दावों, नुकसान, देनदारियों से क्षतिपूर्ति करने और बचाव करने के लिए सहमत हैं जो निम्न से उत्पन्न हों: (क) आपकी चिकित्सा सलाह, निदान या उपचार; (ख) लागू कानून का आपका उल्लंघन।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. HOSPITAL AGREEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const HOSPITAL_AGREEMENT = {
  id: "hospital_agreement",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Hospital Agreement",
    subtitle: "Governing agreement for hospitals listed on the Sehat-Sathi Platform.",
    sections: [
      {
        id: "HA1", title: "1. Listing Services",
        content: `Sehat-Sathi provides Hospital Profile Listing Services — a technology service that allows hospitals to create a discoverable profile on the Platform. Sehat-Sathi is NOT a healthcare provider and does NOT operate, manage, or control hospital operations. The listing is informational and facilitates patient discovery only.`
      },
      {
        id: "HA2", title: "2. Hospital Eligibility",
        content: `To register as a Hospital, you must provide:\n(a) Valid hospital registration certificate from appropriate government authority;\n(b) NABH accreditation (if applicable);\n(c) List of registered doctors with valid MCI/NMC registrations;\n(d) Accurate information on departments, facilities, ICU capacity, blood bank availability;\n(e) Valid emergency contact numbers;\n(f) Proof of valid fire safety, infection control, and building safety certifications.`
      },
      {
        id: "HA3", title: "3. Hospital Responsibilities",
        content: `The Hospital is SOLELY responsible for:\n(a) The accuracy of all information displayed in its profile;\n(b) The qualifications and licensing of all doctors practicing in the hospital;\n(c) The quality of medical care provided to patients;\n(d) Compliance with all applicable healthcare regulations, licenses, and standards;\n(e) Timely updating of profile information (changes in departments, doctors, capacity);\n(f) Emergency handling — Sehat-Sathi does NOT manage emergencies;\n(g) Patient safety within hospital premises;\n(h) NABH/JCI or equivalent quality standard compliance.`
      },
      {
        id: "HA4", title: "4. Sehat-Sathi's Role",
        content: `Sehat-Sathi:\n(a) Provides technology for patient discovery and appointment facilitation;\n(b) Displays hospital profiles based on information provided by the hospital;\n(c) Is NOT responsible for the accuracy of self-reported hospital information;\n(d) Reserves the right to remove listings that violate Platform policies or contain inaccurate information;\n(e) May display patient reviews and ratings — Hospital cannot unilaterally request removal of legitimate reviews.`
      },
      {
        id: "HA5", title: "5. Emergency Disclaimer",
        content: `Sehat-Sathi does NOT guarantee ICU bed availability, emergency response times, or specialist doctor availability. Emergency information displayed on the Platform is provided by the Hospital and may not reflect real-time availability. Patients should call the hospital directly in emergency situations.`
      }
    ]
  },
  hi: {
    title: "अस्पताल अनुबंध",
    subtitle: "सेहत-साथी प्लेटफ़ॉर्म पर सूचीबद्ध अस्पतालों के लिए शासन समझौता।",
    sections: [
      {
        id: "HA1", title: "1. सूचीकरण सेवाएं",
        content: `सेहत-साथी अस्पताल प्रोफ़ाइल सूचीकरण सेवाएं प्रदान करता है — एक प्रौद्योगिकी सेवा जो अस्पतालों को प्लेटफ़ॉर्म पर एक खोज योग्य प्रोफ़ाइल बनाने की अनुमति देती है। सेहत-साथी एक स्वास्थ्य सेवा प्रदाता नहीं है और अस्पताल संचालन को नियंत्रित नहीं करता।`
      },
      {
        id: "HA2", title: "2. अस्पताल की पात्रता",
        content: `अस्पताल के रूप में पंजीकरण करने के लिए, आपको प्रदान करना होगा:\n(क) संबंधित सरकारी प्राधिकरण से वैध अस्पताल पंजीकरण प्रमाण पत्र;\n(ख) NABH प्रत्यायन (यदि लागू हो);\n(ग) वैध MCI/NMC पंजीकरण के साथ पंजीकृत डॉक्टरों की सूची।`
      },
      {
        id: "HA3", title: "3. अस्पताल की जिम्मेदारियां",
        content: `अस्पताल पूरी तरह से जिम्मेदार है:\n(क) उसके प्रोफ़ाइल में प्रदर्शित सभी जानकारी की सटीकता;\n(ख) अस्पताल में अभ्यास करने वाले सभी डॉक्टरों की योग्यता और लाइसेंसिंग;\n(ग) मरीजों को प्रदान की गई चिकित्सा देखभाल की गुणवत्ता।`
      },
      {
        id: "HA4", title: "4. सेहत-साथी की भूमिका",
        content: `सेहत-साथी:\n(क) रोगी खोज और अपॉइंटमेंट सुविधा के लिए प्रौद्योगिकी प्रदान करता है;\n(ख) अस्पताल द्वारा प्रदान की गई जानकारी के आधार पर अस्पताल प्रोफ़ाइल प्रदर्शित करता है;\n(ग) स्व-रिपोर्ट की गई अस्पताल जानकारी की सटीकता के लिए जिम्मेदार नहीं है।`
      },
      {
        id: "HA5", title: "5. आपातकालीन अस्वीकरण",
        content: `सेहत-साथी ICU बेड उपलब्धता, आपातकालीन प्रतिक्रिया समय या विशेषज्ञ डॉक्टर उपलब्धता की गारंटी नहीं देता। आपातकालीन स्थितियों में मरीजों को सीधे अस्पताल को कॉल करना चाहिए।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. LABORATORY AGREEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const LABORATORY_AGREEMENT = {
  id: "lab_agreement",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Laboratory Agreement",
    subtitle: "Agreement for diagnostic laboratories partnering with Sehat-Sathi.",
    sections: [
      {
        id: "LA1", title: "1. Laboratory Eligibility",
        content: `Diagnostic Laboratories must possess:\n(a) Valid registration under the Clinical Establishments Act or applicable state law;\n(b) NABL accreditation (preferred) or equivalent quality certification;\n(c) All applicable pollution control, biomedical waste management licenses;\n(d) Qualified and registered laboratory professionals.\n\nSehat-Sathi provides listing and appointment facilitation. Sehat-Sathi does NOT interpret, verify, or guarantee the accuracy of laboratory test results.`
      },
      {
        id: "LA2", title: "2. Laboratory Responsibilities",
        content: `The Laboratory is SOLELY responsible for:\n(a) The accuracy of all test results reported;\n(b) Quality control and standard operating procedures;\n(c) Safe collection, handling, and disposal of samples;\n(d) Maintaining NABL or equivalent quality standards;\n(e) Timely delivery of reports to patients;\n(f) Data privacy of patient samples and results;\n(g) Compliance with biomedical waste regulations.`
      },
      {
        id: "LA3", title: "3. Report Upload",
        content: `Laboratories that upload digital reports to the Platform:\n(a) Are solely responsible for report accuracy;\n(b) Grant Sehat-Sathi a limited license to display reports to the respective patient;\n(c) Must not upload reports without patient consent;\n(d) Must ensure reports are not tampered with after upload.`
      }
    ]
  },
  hi: {
    title: "प्रयोगशाला अनुबंध",
    subtitle: "सेहत-साथी के साथ साझेदारी करने वाली नैदानिक प्रयोगशालाओं के लिए समझौता।",
    sections: [
      {
        id: "LA1", title: "1. प्रयोगशाला पात्रता",
        content: `नैदानिक प्रयोगशालाओं के पास होना चाहिए:\n(क) क्लिनिकल एस्टेब्लिशमेंट एक्ट या लागू राज्य कानून के तहत वैध पंजीकरण;\n(ख) NABL प्रत्यायन (अधिमानतः) या समकक्ष गुणवत्ता प्रमाणन।\n\nसेहत-साथी प्रयोगशाला परीक्षण परिणामों की सटीकता की व्याख्या, सत्यापन या गारंटी नहीं देता।`
      },
      {
        id: "LA2", title: "2. प्रयोगशाला की जिम्मेदारियां",
        content: `प्रयोगशाला पूरी तरह से जिम्मेदार है:\n(क) सभी रिपोर्ट किए गए परीक्षण परिणामों की सटीकता;\n(ख) गुणवत्ता नियंत्रण और मानक संचालन प्रक्रियाएं;\n(ग) नमूनों का सुरक्षित संग्रह, संभालना और निपटान;\n(घ) मरीजों को समय पर रिपोर्ट वितरित करना।`
      },
      {
        id: "LA3", title: "3. रिपोर्ट अपलोड",
        content: `प्लेटफ़ॉर्म पर डिजिटल रिपोर्ट अपलोड करने वाली प्रयोगशालाएं रिपोर्ट की सटीकता के लिए अकेले जिम्मेदार हैं। मरीज की सहमति के बिना रिपोर्ट अपलोड न करें।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. PHARMACY AGREEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const PHARMACY_AGREEMENT = {
  id: "pharmacy_agreement",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Pharmacy Agreement",
    subtitle: "Agreement for pharmacies and medicine retailers partnering with Sehat-Sathi.",
    sections: [
      {
        id: "PA1", title: "1. Pharmacy Eligibility",
        content: `Pharmacies must hold:\n(a) Valid Retail Drug License issued under the Drugs and Cosmetics Act, 1940;\n(b) Pharmacist registration from the State Pharmacy Council;\n(c) GST registration;\n(d) Any applicable local municipal licenses.\n\nSehat-Sathi facilitates prescription discovery and medicine ordering. Sehat-Sathi does NOT dispense medications, provide pharmaceutical advice, or substitute for a licensed pharmacist.`
      },
      {
        id: "PA2", title: "2. Pharmacy Responsibilities",
        content: `The Pharmacy is SOLELY responsible for:\n(a) Verifying the authenticity of every prescription before dispensing;\n(b) Dispensing only medications listed on valid prescriptions;\n(c) Compliance with the Drugs and Cosmetics Act, 1940 and CDSCO guidelines;\n(d) Not dispensing Schedule H, Schedule H1, or Schedule X drugs without a valid prescription;\n(e) Maintaining proper cold chain for temperature-sensitive medications;\n(f) Accurate labeling of all dispensed medications;\n(g) Patient medication safety and counseling.`
      },
      {
        id: "PA3", title: "3. Platform's Role",
        content: `Sehat-Sathi provides prescription transmission and order facilitation only. Any medication dispensed incorrectly, without valid prescription, or in violation of CDSCO guidelines is the SOLE responsibility of the Pharmacy. Sehat-Sathi bears no liability for medication errors, adverse drug reactions, or dispensing mistakes.`
      }
    ]
  },
  hi: {
    title: "फार्मेसी अनुबंध",
    subtitle: "सेहत-साथी के साथ साझेदारी करने वाली फार्मेसी और दवा खुदरा विक्रेताओं के लिए समझौता।",
    sections: [
      {
        id: "PA1", title: "1. फार्मेसी पात्रता",
        content: `फार्मेसियों के पास होना चाहिए:\n(क) ड्रग्स एंड कॉस्मेटिक्स एक्ट, 1940 के तहत जारी वैध रिटेल ड्रग लाइसेंस;\n(ख) राज्य फार्मेसी परिषद से फार्मासिस्ट पंजीकरण।\n\nसेहत-साथी दवाएं नहीं देता और लाइसेंस प्राप्त फार्मासिस्ट का विकल्प नहीं है।`
      },
      {
        id: "PA2", title: "2. फार्मेसी की जिम्मेदारियां",
        content: `फार्मेसी पूरी तरह से जिम्मेदार है:\n(क) वितरण से पहले प्रत्येक नुस्खे की प्रामाणिकता सत्यापित करना;\n(ख) केवल वैध नुस्खों पर सूचीबद्ध दवाएं वितरित करना;\n(ग) वैध नुस्खे के बिना Schedule H, H1 या X दवाएं न देना।`
      },
      {
        id: "PA3", title: "3. प्लेटफ़ॉर्म की भूमिका",
        content: `सेहत-साथी केवल प्रिस्क्रिप्शन ट्रांसमिशन और ऑर्डर सुविधा प्रदान करता है। दवा संबंधी किसी भी त्रुटि के लिए सेहत-साथी का कोई दायित्व नहीं है।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. NURSE AGREEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const NURSE_AGREEMENT = {
  id: "nurse_agreement",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Nurse Agreement",
    subtitle: "Agreement for registered nurses and nursing professionals on Sehat-Sathi.",
    sections: [
      {
        id: "NA1", title: "1. Eligibility",
        content: `Nurses must hold valid registration with the Indian Nursing Council (INC) or State Nursing Council. Sehat-Sathi facilitates discovery of nursing professionals for home care and hospital-based services.`
      },
      {
        id: "NA2", title: "2. Nurse Responsibilities",
        content: `Nurses are SOLELY responsible for:\n(a) The quality and standard of nursing care provided;\n(b) Compliance with Indian Nursing Council ethics and professional standards;\n(c) Maintaining patient dignity, confidentiality, and safety;\n(d) Accurate documentation of care provided;\n(e) Not performing procedures beyond their licensed scope of practice;\n(f) Reporting adverse events to the attending doctor immediately.`
      },
      {
        id: "NA3", title: "3. Liability",
        content: `Sehat-Sathi is NOT liable for any nursing care outcome, patient injury, or adverse event arising from services provided by nurses connected through the Platform. All nursing care liability rests exclusively with the registered nurse.`
      }
    ]
  },
  hi: {
    title: "नर्स अनुबंध",
    subtitle: "सेहत-साथी पर पंजीकृत नर्सों और नर्सिंग पेशेवरों के लिए समझौता।",
    sections: [
      {
        id: "NA1", title: "1. पात्रता",
        content: `नर्सों के पास भारतीय नर्सिंग परिषद (INC) या राज्य नर्सिंग परिषद के साथ वैध पंजीकरण होना चाहिए।`
      },
      {
        id: "NA2", title: "2. नर्स की जिम्मेदारियां",
        content: `नर्स पूरी तरह से जिम्मेदार हैं:\n(क) प्रदान की गई नर्सिंग देखभाल की गुणवत्ता;\n(ख) मरीज की गरिमा, गोपनीयता और सुरक्षा;\n(ग) अपने लाइसेंस प्राप्त अभ्यास के दायरे से परे प्रक्रियाएं न करना।`
      },
      {
        id: "NA3", title: "3. दायित्व",
        content: `प्लेटफ़ॉर्म के माध्यम से जुड़ी नर्सों द्वारा प्रदान की गई सेवाओं से उत्पन्न किसी भी नर्सिंग देखभाल परिणाम के लिए सेहत-साथी जिम्मेदार नहीं है।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. AMBULANCE PARTNER AGREEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const AMBULANCE_AGREEMENT = {
  id: "ambulance_agreement",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Ambulance Partner Agreement",
    subtitle: "Agreement for ambulance service providers listed on Sehat-Sathi.",
    sections: [
      {
        id: "AM1", title: "1. Service Nature & Platform Role",
        content: `Sehat-Sathi provides an information listing service for ambulance providers. Sehat-Sathi does NOT own, operate, or manage any ambulance. Sehat-Sathi does NOT guarantee ambulance availability, response time, equipment standard, or clinical outcome. Sehat-Sathi is NOT an emergency medical service provider.\n\nIN ALL EMERGENCIES: Call 112 (National Emergency Number) IMMEDIATELY. Do not rely solely on this Platform for emergency response.`
      },
      {
        id: "AM2", title: "2. Ambulance Partner Eligibility",
        content: `Ambulance providers must hold:\n(a) Motor Vehicle Registration for each ambulance;\n(b) Appropriate state authority permits for ambulance operation;\n(c) Proof of trained paramedics/EMTs on each vehicle;\n(d) Valid ALS or BLS certification for each vehicle;\n(e) Insurance coverage for passenger liability.`
      },
      {
        id: "AM3", title: "3. Ambulance Provider Responsibilities",
        content: `The ambulance provider is SOLELY responsible for:\n(a) Response times and availability;\n(b) Vehicle maintenance and equipment standards;\n(c) Staff qualifications and training;\n(d) Patient safety during transport;\n(e) Accuracy of availability information on the Platform.`
      },
      {
        id: "AM4", title: "4. Critical Liability Disclaimer",
        content: `SEHAT-SATHI EXPRESSLY DISCLAIMS ALL LIABILITY FOR:\n(a) Ambulance response time;\n(b) Clinical outcomes during transport;\n(c) Equipment failure;\n(d) Accidents or injuries during transport;\n(e) Loss of life resulting from delayed or unavailable ambulance service.\n\nAll ambulance service liability rests exclusively with the ambulance provider.`
      }
    ]
  },
  hi: {
    title: "एम्बुलेंस भागीदार अनुबंध",
    subtitle: "सेहत-साथी पर सूचीबद्ध एम्बुलेंस सेवा प्रदाताओं के लिए समझौता।",
    sections: [
      {
        id: "AM1", title: "1. सेवा प्रकृति और प्लेटफ़ॉर्म भूमिका",
        content: `सेहत-साथी एम्बुलेंस प्रदाताओं के लिए एक सूचना सूचीकरण सेवा प्रदान करता है। सेहत-साथी कोई एम्बुलेंस नहीं चलाता। सेहत-साथी एम्बुलेंस उपलब्धता या प्रतिक्रिया समय की गारंटी नहीं देता।\n\nसभी आपातकालीन स्थितियों में: तुरंत 112 (राष्ट्रीय आपातकालीन नंबर) पर कॉल करें।`
      },
      {
        id: "AM2", title: "2. एम्बुलेंस भागीदार पात्रता",
        content: `एम्बुलेंस प्रदाताओं के पास होना चाहिए:\n(क) प्रत्येक एम्बुलेंस के लिए मोटर वाहन पंजीकरण;\n(ख) एम्बुलेंस संचालन के लिए संबंधित राज्य प्राधिकरण परमिट;\n(ग) प्रत्येक वाहन पर प्रशिक्षित पैरामेडिक्स का प्रमाण।`
      },
      {
        id: "AM3", title: "3. एम्बुलेंस प्रदाता की जिम्मेदारियां",
        content: `एम्बुलेंस प्रदाता पूरी तरह से जिम्मेदार है:\n(क) प्रतिक्रिया समय और उपलब्धता;\n(ख) वाहन रखरखाव और उपकरण मानक;\n(ग) परिवहन के दौरान रोगी सुरक्षा।`
      },
      {
        id: "AM4", title: "4. महत्वपूर्ण दायित्व अस्वीकरण",
        content: `सेहत-साथी स्पष्ट रूप से इसके लिए सभी दायित्व अस्वीकार करता है:\n(क) एम्बुलेंस प्रतिक्रिया समय;\n(ख) परिवहन के दौरान नैदानिक परिणाम;\n(ग) एम्बुलेंस सेवा में देरी या अनुपलब्धता के कारण जीवन की हानि।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. DIAGNOSTIC CENTER AGREEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const DIAGNOSTIC_CENTER_AGREEMENT = {
  id: "diagnostic_center_agreement",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Diagnostic Center Agreement",
    subtitle: "Agreement for imaging and diagnostic centers partnering with Sehat-Sathi.",
    sections: [
      {
        id: "DC1", title: "1. Eligibility",
        content: `Diagnostic Centers offering imaging (X-Ray, MRI, CT Scan, Ultrasound) must hold AERB (Atomic Energy Regulatory Board) license for radiation-based equipment, NABL accreditation (preferred), valid Clinical Establishment registration, and qualified radiologists for report interpretation.`
      },
      {
        id: "DC2", title: "2. Responsibilities",
        content: `Diagnostic Centers are SOLELY responsible for the accuracy of all imaging reports, radiation safety protocols, equipment calibration and maintenance, qualified radiologist interpretations, and timely delivery of results.`
      },
      {
        id: "DC3", title: "3. Sehat-Sathi Disclaimer",
        content: `Sehat-Sathi does NOT interpret medical imaging or diagnostic reports. Report accuracy is the exclusive responsibility of the diagnostic center and its qualified professionals.`
      }
    ]
  },
  hi: {
    title: "डायग्नोस्टिक सेंटर अनुबंध",
    subtitle: "सेहत-साथी के साथ साझेदारी करने वाले इमेजिंग और डायग्नोस्टिक सेंटर के लिए समझौता।",
    sections: [
      {
        id: "DC1", title: "1. पात्रता",
        content: `इमेजिंग प्रदान करने वाले डायग्नोस्टिक सेंटर के पास AERB लाइसेंस, NABL प्रत्यायन और योग्य रेडियोलॉजिस्ट होने चाहिए।`
      },
      {
        id: "DC2", title: "2. जिम्मेदारियां",
        content: `डायग्नोस्टिक सेंटर सभी इमेजिंग रिपोर्टों की सटीकता, विकिरण सुरक्षा प्रोटोकॉल और उपकरण अंशांकन के लिए पूरी तरह से जिम्मेदार हैं।`
      },
      {
        id: "DC3", title: "3. सेहत-साथी अस्वीकरण",
        content: `सेहत-साथी मेडिकल इमेजिंग या डायग्नोस्टिक रिपोर्ट की व्याख्या नहीं करता।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. HEALTHCARE ORGANIZATION AGREEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const HEALTHCARE_ORG_AGREEMENT = {
  id: "healthcare_org_agreement",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Healthcare Organization Agreement",
    subtitle: "Agreement for healthcare trusts, NGOs, and large healthcare organizations.",
    sections: [
      {
        id: "HO1", title: "1. Scope",
        content: `This agreement applies to healthcare trusts, NGOs, insurance TPAs, and large multi-specialty healthcare organizations that integrate with Sehat-Sathi's API or white-label services. Specific integration terms will be documented in a separate Service Level Agreement (SLA).`
      },
      {
        id: "HO2", title: "2. Data Sharing",
        content: `Healthcare organizations accessing patient data through API integrations must sign a Data Processing Agreement (DPA) in compliance with the Digital Personal Data Protection Act, 2023. Patient consent must be obtained before sharing any health data.`
      },
      {
        id: "HO3", title: "3. Liability",
        content: `The healthcare organization assumes full liability for services provided to patients and members. Sehat-Sathi's role is limited to technology infrastructure provision.`
      }
    ]
  },
  hi: {
    title: "स्वास्थ्य सेवा संगठन अनुबंध",
    subtitle: "स्वास्थ्य सेवा ट्रस्ट, NGO और बड़े स्वास्थ्य सेवा संगठनों के लिए समझौता।",
    sections: [
      {
        id: "HO1", title: "1. दायरा",
        content: `यह समझौता स्वास्थ्य सेवा ट्रस्ट, NGO और बड़े संगठनों पर लागू होता है जो सेहत-साथी के API एकीकरण का उपयोग करते हैं। विशिष्ट एकीकरण शर्तें एक अलग SLA में प्रलेखित की जाएंगी।`
      },
      {
        id: "HO2", title: "2. डेटा साझाकरण",
        content: `API एकीकरण के माध्यम से रोगी डेटा तक पहुंचने वाले संगठनों को DPDP Act 2023 के अनुरूप डेटा प्रसंस्करण समझौते पर हस्ताक्षर करना होगा।`
      },
      {
        id: "HO3", title: "3. दायित्व",
        content: `स्वास्थ्य सेवा संगठन रोगियों और सदस्यों को प्रदान की गई सेवाओं के लिए पूर्ण दायित्व ग्रहण करता है।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. CLINIC AGREEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const CLINIC_AGREEMENT = {
  id: "clinic_agreement",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Clinic Agreement",
    subtitle: "Agreement for standalone clinics and polyclinics listing on Sehat-Sathi.",
    sections: [
      {
        id: "CL1", title: "1. Eligibility",
        content: `Clinics must possess valid Clinical Establishment registration under applicable state law, registered doctors with valid MCI/NMC registration, and all applicable municipal and state licenses.`
      },
      {
        id: "CL2", title: "2. Responsibilities",
        content: `Clinics are responsible for the accuracy of all profile information, quality of medical services, doctor credentials, infrastructure safety, and compliance with all healthcare regulations.`
      },
      {
        id: "CL3", title: "3. Platform Role",
        content: `Sehat-Sathi provides a listing and appointment facilitation service only. Sehat-Sathi does not manage clinic operations or supervise medical practice.`
      }
    ]
  },
  hi: {
    title: "क्लिनिक अनुबंध",
    subtitle: "सेहत-साथी पर सूचीबद्ध स्वतंत्र क्लीनिक और पॉलीक्लीनिक के लिए समझौता।",
    sections: [
      {
        id: "CL1", title: "1. पात्रता",
        content: `क्लीनिक के पास लागू राज्य कानून के तहत वैध क्लिनिकल एस्टेब्लिशमेंट पंजीकरण होना चाहिए।`
      },
      {
        id: "CL2", title: "2. जिम्मेदारियां",
        content: `क्लीनिक सभी प्रोफ़ाइल जानकारी की सटीकता, चिकित्सा सेवाओं की गुणवत्ता और सभी स्वास्थ्य सेवा नियमों का अनुपालन करने के लिए जिम्मेदार हैं।`
      },
      {
        id: "CL3", title: "3. प्लेटफ़ॉर्म भूमिका",
        content: `सेहत-साथी केवल एक सूचीकरण और अपॉइंटमेंट सुविधा सेवा प्रदान करता है।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. CORPORATE PARTNER AGREEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const CORPORATE_PARTNER_AGREEMENT = {
  id: "corporate_partner_agreement",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Corporate Partner Agreement",
    subtitle: "Agreement for businesses offering Sehat-Sathi as an employee health benefit.",
    sections: [
      {
        id: "CP1", title: "1. Corporate Health Plans",
        content: `Sehat-Sathi partners with businesses to provide employee health benefits including telemedicine access, health report analysis, and wellness programs. Corporate partners must execute a separate Corporate Services Agreement before onboarding employees.`
      },
      {
        id: "CP2", title: "2. Employee Data",
        content: `Employee health data collected through corporate programs is subject to the same privacy protections as individual users. Corporate entities may NOT access individual employee health data without explicit written employee consent. Aggregate, anonymized health data may be shared with corporate partners for program analytics.`
      },
      {
        id: "CP3", title: "3. Billing",
        content: `Corporate partners are billed on a per-employee or plan basis as agreed in the Corporate Services Agreement. Sehat-Sathi issues GST-compliant invoices. Corporate partners are responsible for employee enrollment and offboarding.`
      }
    ]
  },
  hi: {
    title: "कॉर्पोरेट भागीदार अनुबंध",
    subtitle: "कर्मचारी स्वास्थ्य लाभ के रूप में सेहत-साथी प्रदान करने वाले व्यवसायों के लिए समझौता।",
    sections: [
      {
        id: "CP1", title: "1. कॉर्पोरेट स्वास्थ्य योजनाएं",
        content: `सेहत-साथी टेलीमेडिसिन, स्वास्थ्य रिपोर्ट विश्लेषण और कल्याण कार्यक्रमों सहित कर्मचारी स्वास्थ्य लाभ प्रदान करने के लिए व्यवसायों के साथ साझेदारी करता है।`
      },
      {
        id: "CP2", title: "2. कर्मचारी डेटा",
        content: `कॉर्पोरेट कार्यक्रमों के माध्यम से एकत्र किए गए कर्मचारी स्वास्थ्य डेटा को व्यक्तिगत उपयोगकर्ताओं के समान गोपनीयता सुरक्षा प्राप्त है। कॉर्पोरेट संस्थाएं स्पष्ट लिखित कर्मचारी सहमति के बिना व्यक्तिगत कर्मचारी स्वास्थ्य डेटा तक नहीं पहुंच सकतीं।`
      },
      {
        id: "CP3", title: "3. बिलिंग",
        content: `कॉर्पोरेट भागीदारों को कॉर्पोरेट सेवा समझौते में सहमत प्रति-कर्मचारी या योजना आधार पर बिल किया जाता है।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 14. REFUND POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const REFUND_POLICY = {
  id: "refund_policy",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Refund Policy",
    subtitle: "Detailed policy governing refunds for all paid services on Sehat-Sathi.",
    sections: [
      {
        id: "RP1", title: "1. Refund Eligibility",
        content: `Refunds are processed ONLY in the following circumstances:\n\n(a) Doctor No-Show: If a booked Doctor fails to attend the consultation and has not rescheduled within 24 hours, you are entitled to a FULL refund within 5–7 business days.\n\n(b) Platform Technical Failure: If the consultation cannot be completed due to a verified, Platform-side technical failure, a full refund or complimentary rescheduling will be offered.\n\n(c) Cancellation by Patient (>2 hours before): Cancellations made more than 2 hours before the scheduled appointment time qualify for a FULL refund.\n\n(d) Cancellation by Patient (≤2 hours before): No refund will be issued.\n\n(e) Double Charge: If you have been charged twice for the same transaction, the duplicate charge will be fully refunded within 3 business days.\n\n(f) Service Not Delivered: If a paid service is not delivered due to provider unavailability and no substitute or rescheduling is offered, a full refund is due.`
      },
      {
        id: "RP2", title: "2. Non-Refundable Situations",
        content: `NO refund will be issued in the following situations:\n\n(a) Completed consultations — regardless of perceived medical outcome;\n(b) Patient dissatisfaction with a Doctor's medical opinion;\n(c) Cancellation made within 2 hours of scheduled appointment by patient;\n(d) Failed transactions where the amount was not debited (re-attempt required);\n(e) Misuse or violation of Platform terms;\n(f) AI Report Analysis services once the analysis has been delivered;\n(g) Subscription services after the first 24 hours of activation.`
      },
      {
        id: "RP3", title: "3. Refund Process",
        content: `To request a refund:\n1. Contact support@sehatsathi.in within 48 hours of the incident.\n2. Provide your Transaction ID, appointment date, and reason.\n3. Sehat-Sathi will verify the claim within 3 business days.\n4. Approved refunds are credited to the original payment method within 5–7 business days.\n\nRefunds cannot be processed to a different account than the original payment source.`
      },
      {
        id: "RP4", title: "4. Platform Fee",
        content: `Platform fees (if applicable) are non-refundable unless the refund is due to Platform-side failure. The platform fee is the fee charged by Sehat-Sathi for facilitating the service, distinct from the healthcare provider's consultation fee.`
      }
    ]
  },
  hi: {
    title: "रिफंड नीति",
    subtitle: "सेहत-साथी पर सभी सशुल्क सेवाओं के लिए रिफंड को नियंत्रित करने वाली विस्तृत नीति।",
    sections: [
      {
        id: "RP1", title: "1. रिफंड पात्रता",
        content: `रिफंड केवल निम्नलिखित परिस्थितियों में संसाधित किए जाते हैं:\n\n(क) डॉक्टर की अनुपस्थिति: यदि बुक किया गया डॉक्टर परामर्श में उपस्थित नहीं होता और 24 घंटे के भीतर पुनर्निर्धारण नहीं करता, तो 5-7 व्यावसायिक दिनों के भीतर पूर्ण रिफंड।\n\n(ख) प्लेटफ़ॉर्म तकनीकी विफलता: सत्यापित प्लेटफ़ॉर्म-पक्षीय विफलता पर पूर्ण रिफंड।\n\n(ग) मरीज द्वारा रद्दीकरण (2 घंटे से अधिक): अनुसूचित नियुक्ति समय से 2 घंटे से अधिक पहले रद्द करने पर पूर्ण रिफंड।\n\n(घ) मरीज द्वारा रद्दीकरण (≤2 घंटे): कोई रिफंड नहीं।`
      },
      {
        id: "RP2", title: "2. गैर-वापसी योग्य स्थितियां",
        content: `निम्नलिखित स्थितियों में कोई रिफंड जारी नहीं किया जाएगा:\n(क) पूर्ण हुए परामर्श;\n(ख) डॉक्टर की चिकित्सा राय से रोगी की असंतुष्टि;\n(ग) AI रिपोर्ट विश्लेषण सेवाएं एक बार विश्लेषण वितरित होने के बाद।`
      },
      {
        id: "RP3", title: "3. रिफंड प्रक्रिया",
        content: `रिफंड का अनुरोध करने के लिए:\n1. घटना के 48 घंटों के भीतर support@sehatsathi.in से संपर्क करें।\n2. अपना ट्रांजैक्शन ID, नियुक्ति तिथि और कारण प्रदान करें।\n3. सेहत-साथी 3 व्यावसायिक दिनों के भीतर दावे की जांच करेगा।`
      },
      {
        id: "RP4", title: "4. प्लेटफ़ॉर्म शुल्क",
        content: `प्लेटफ़ॉर्म शुल्क (यदि लागू) वापस नहीं किए जाते जब तक कि रिफंड प्लेटफ़ॉर्म-पक्षीय विफलता के कारण न हो।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 15. CANCELLATION POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const CANCELLATION_POLICY = {
  id: "cancellation_policy",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Cancellation Policy",
    subtitle: "Rules governing cancellation of appointments and services on Sehat-Sathi.",
    sections: [
      {
        id: "CP1", title: "1. Patient Cancellation",
        content: `Patients may cancel appointments subject to the following:\n\n• More than 24 hours before appointment: Full refund\n• 2–24 hours before appointment: Full refund\n• Less than 2 hours before appointment: No refund\n• No-show by patient: No refund\n\nTo cancel: Use the appointment management section in your dashboard or email support@sehatsathi.in.`
      },
      {
        id: "CP2", title: "2. Doctor Cancellation",
        content: `Doctors who cancel consultations must do so at least 2 hours before the scheduled time. Repeated cancellations (more than 3 per month) may result in account review. Patients affected by Doctor cancellations will receive full refunds automatically within 5 business days.`
      },
      {
        id: "CP3", title: "3. Platform-Initiated Cancellation",
        content: `Sehat-Sathi reserves the right to cancel appointments in cases of: Force majeure events, safety emergencies, verified provider misconduct, regulatory orders. Full refunds will be issued for Platform-initiated cancellations.`
      },
      {
        id: "CP4", title: "4. Rescheduling",
        content: `Appointments may be rescheduled free of charge up to 1 hour before the scheduled time. Rescheduling within 1 hour of the appointment is treated as cancellation and is subject to the cancellation policy above.`
      }
    ]
  },
  hi: {
    title: "रद्दीकरण नीति",
    subtitle: "सेहत-साथी पर नियुक्तियों और सेवाओं के रद्दीकरण को नियंत्रित करने वाले नियम।",
    sections: [
      {
        id: "CP1", title: "1. मरीज का रद्दीकरण",
        content: `मरीज निम्नलिखित के अधीन नियुक्तियां रद्द कर सकते हैं:\n• नियुक्ति से 24 घंटे से अधिक पहले: पूर्ण रिफंड\n• 2-24 घंटे पहले: पूर्ण रिफंड\n• 2 घंटे से कम: कोई रिफंड नहीं\n• मरीज की अनुपस्थिति: कोई रिफंड नहीं`
      },
      {
        id: "CP2", title: "2. डॉक्टर का रद्दीकरण",
        content: `परामर्श रद्द करने वाले डॉक्टरों को निर्धारित समय से कम से कम 2 घंटे पहले ऐसा करना होगा। डॉक्टर के रद्दीकरण से प्रभावित मरीजों को 5 व्यावसायिक दिनों के भीतर पूर्ण रिफंड मिलेगा।`
      },
      {
        id: "CP3", title: "3. प्लेटफ़ॉर्म द्वारा रद्दीकरण",
        content: `सेहत-साथी फोर्स मेजर, सुरक्षा आपात स्थिति या नियामक आदेशों के मामलों में नियुक्तियां रद्द करने का अधिकार सुरक्षित रखता है।`
      },
      {
        id: "CP4", title: "4. पुनर्निर्धारण",
        content: `निर्धारित समय से 1 घंटे पहले तक नियुक्तियों को निःशुल्क पुनर्निर्धारित किया जा सकता है।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 16. PAYMENT POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const PAYMENT_POLICY = {
  id: "payment_policy",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Payment Policy",
    subtitle: "Comprehensive policy governing all financial transactions on Sehat-Sathi.",
    sections: [
      {
        id: "PP1", title: "1. Payment Gateway",
        content: `All payments are processed by a PCI-DSS compliant third-party payment gateway. Sehat-Sathi does NOT store your full credit/debit card details. Payment data is encrypted using industry-standard TLS protocols. Supported payment methods: UPI, Net Banking, Credit Card, Debit Card, and Sehat-Sathi Wallet (where available).`
      },
      {
        id: "PP2", title: "2. Transaction Security",
        content: `All transactions are protected by:\n(a) PCI-DSS Level 1 compliant payment processing;\n(b) 3D Secure (3DS) authentication for card payments;\n(c) OTP verification for UPI transactions;\n(d) Tokenization of payment credentials.\n\nReport unauthorized transactions immediately to support@sehatsathi.in and your bank.`
      },
      {
        id: "PP3", title: "3. Failed Transactions",
        content: `If a payment fails but your account has been debited:\n(a) The amount typically auto-reverses within 5–7 business days by your bank;\n(b) Contact support@sehatsathi.in with your transaction reference if auto-reversal does not occur;\n(c) Sehat-Sathi will coordinate with the payment gateway to resolve the issue.`
      },
      {
        id: "PP4", title: "4. Taxes",
        content: `All applicable Goods and Services Tax (GST) at current prevailing rates will be added to service fees. GST-compliant invoices will be issued for all transactions. Platform fees are subject to GST as per applicable Indian tax law.`
      },
      {
        id: "PP5", title: "5. Wallet",
        content: `Sehat-Sathi Wallet credits may be added via payment gateway and used for Platform services. Wallet balance is non-transferable and non-redeemable for cash. Wallet credits expire 365 days from the date of top-up. On account termination (due to policy violation), unused wallet balance is forfeited.`
      },
      {
        id: "PP6", title: "6. Currency",
        content: `All transactions on the Platform are processed in Indian Rupees (INR). International card holders will be subject to their bank's foreign exchange and international transaction policies.`
      }
    ]
  },
  hi: {
    title: "भुगतान नीति",
    subtitle: "सेहत-साथी पर सभी वित्तीय लेनदेन को नियंत्रित करने वाली व्यापक नीति।",
    sections: [
      {
        id: "PP1", title: "1. भुगतान गेटवे",
        content: `सभी भुगतान PCI-DSS अनुपालन तृतीय-पक्ष भुगतान गेटवे द्वारा संसाधित किए जाते हैं। सेहत-साथी आपके पूर्ण क्रेडिट/डेबिट कार्ड विवरण संग्रहीत नहीं करता। समर्थित भुगतान विधियां: UPI, नेट बैंकिंग, क्रेडिट कार्ड, डेबिट कार्ड और सेहत-साथी वॉलेट।`
      },
      {
        id: "PP2", title: "2. लेनदेन सुरक्षा",
        content: `सभी लेनदेन PCI-DSS Level 1 अनुपालन और 3D सिक्योर प्रमाणीकरण द्वारा सुरक्षित हैं। अनधिकृत लेनदेन की तुरंत support@sehatsathi.in और अपने बैंक को रिपोर्ट करें।`
      },
      {
        id: "PP3", title: "3. विफल लेनदेन",
        content: `यदि भुगतान विफल होता है लेकिन खाते से डेबिट हो गया है, तो राशि आमतौर पर आपके बैंक द्वारा 5-7 व्यावसायिक दिनों के भीतर स्वतः वापस हो जाती है।`
      },
      {
        id: "PP4", title: "4. कर",
        content: `सभी लागू GST वर्तमान प्रचलित दरों पर सेवा शुल्क में जोड़ा जाएगा। सभी लेनदेन के लिए GST-अनुपालन चालान जारी किए जाएंगे।`
      },
      {
        id: "PP5", title: "5. वॉलेट",
        content: `सेहत-साथी वॉलेट क्रेडिट गैर-हस्तांतरणीय हैं और नकद के लिए भुनाए नहीं जा सकते। वॉलेट क्रेडिट टॉप-अप की तारीख से 365 दिनों में समाप्त हो जाते हैं।`
      },
      {
        id: "PP6", title: "6. मुद्रा",
        content: `प्लेटफ़ॉर्म पर सभी लेनदेन भारतीय रुपए (INR) में संसाधित किए जाते हैं।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 17. DATA RETENTION POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const DATA_RETENTION_POLICY = {
  id: "data_retention",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Data Retention Policy",
    subtitle: "How long Sehat-Sathi retains your personal and medical data.",
    sections: [
      {
        id: "DR1", title: "1. Retention Periods",
        content: `Sehat-Sathi retains data for the following periods:\n\n• Medical Records & Reports: 7 years from date of upload (as required by applicable medical record regulations)\n• Consultation Notes & Prescriptions: 7 years\n• Account Information: Duration of account + 2 years post-deletion\n• Payment Records: 8 years (as required by tax regulations)\n• Audit Logs & Security Logs: 2 years\n• Cookies & Session Data: Session cookies expire at session end; persistent cookies maximum 12 months\n• Location Data: Not retained beyond session duration\n• Chat/Communication Records: 3 years`
      },
      {
        id: "DR2", title: "2. Data Deletion",
        content: `You may request deletion of your personal data by contacting support@sehatsathi.in. Deletion requests will be processed within 30 days. The following data CANNOT be deleted before the legally mandated retention period:\n(a) Medical records required for continuity of care;\n(b) Financial transaction records;\n(c) Data involved in active legal proceedings;\n(d) Data required for regulatory compliance.`
      },
      {
        id: "DR3", title: "3. Data After Account Deletion",
        content: `Upon account deletion, your identifiable profile data is deleted. Medical records are anonymized and retained for the legally required period. Financial records are retained as required by tax law. Anonymized analytics data may be retained indefinitely.`
      },
      {
        id: "DR4", title: "4. Legal Compliance",
        content: `This policy complies with the Digital Personal Data Protection Act, 2023 (India), the Indian Medical Council regulations on medical record maintenance, and ICMR guidelines on health data retention.`
      }
    ]
  },
  hi: {
    title: "डेटा प्रतिधारण नीति",
    subtitle: "सेहत-साथी आपके व्यक्तिगत और चिकित्सा डेटा को कितने समय तक रखता है।",
    sections: [
      {
        id: "DR1", title: "1. प्रतिधारण अवधि",
        content: `सेहत-साथी निम्नलिखित अवधियों के लिए डेटा रखता है:\n• चिकित्सा रिकॉर्ड और रिपोर्ट: अपलोड तिथि से 7 वर्ष\n• परामर्श नोट्स और नुस्खे: 7 वर्ष\n• खाता जानकारी: खाता अवधि + 2 वर्ष\n• भुगतान रिकॉर्ड: 8 वर्ष\n• ऑडिट लॉग: 2 वर्ष`
      },
      {
        id: "DR2", title: "2. डेटा हटाना",
        content: `आप support@sehatsathi.in से संपर्क करके अपने व्यक्तिगत डेटा को हटाने का अनुरोध कर सकते हैं। हटाने के अनुरोध 30 दिनों के भीतर संसाधित किए जाएंगे।`
      },
      {
        id: "DR3", title: "3. खाता हटाने के बाद डेटा",
        content: `खाता हटाने पर, आपका पहचान योग्य प्रोफ़ाइल डेटा हटा दिया जाता है। चिकित्सा रिकॉर्ड को अज्ञात किया जाता है और कानूनी रूप से आवश्यक अवधि के लिए रखा जाता है।`
      },
      {
        id: "DR4", title: "4. कानूनी अनुपालन",
        content: `यह नीति डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 का अनुपालन करती है।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 18. CODE OF CONDUCT
// ─────────────────────────────────────────────────────────────────────────────
export const CODE_OF_CONDUCT = {
  id: "code_of_conduct",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Code of Conduct",
    subtitle: "Standards of behavior expected from all Sehat-Sathi Users.",
    sections: [
      {
        id: "CC1", title: "1. Core Principles",
        content: `All Users of Sehat-Sathi — including Patients, Doctors, Hospitals, and Partner Organizations — must uphold these core principles:\n\n(a) INTEGRITY: Be truthful in all interactions, submissions, and communications;\n(b) RESPECT: Treat all users with dignity, regardless of background;\n(c) RESPONSIBILITY: Take ownership of your actions and their consequences;\n(d) SAFETY: Prioritize patient and community safety above all;\n(e) PROFESSIONALISM: Healthcare providers must maintain professional standards at all times;\n(f) NON-DISCRIMINATION: Services must be accessible without discrimination based on caste, religion, gender, sexual orientation, or economic status.`
      },
      {
        id: "CC2", title: "2. Patient Conduct",
        content: `Patients must:\n(a) Provide honest medical history;\n(b) Treat healthcare professionals respectfully;\n(c) Follow up with licensed doctors after AI consultations;\n(d) Not falsify medical reports;\n(e) Not share other patients' data;\n(f) Report genuinely observed misconduct by healthcare providers.`
      },
      {
        id: "CC3", title: "3. Healthcare Professional Conduct",
        content: `Healthcare professionals must:\n(a) Maintain the highest standards of medical ethics;\n(b) Communicate respectfully with patients;\n(c) Not exploit vulnerable patients;\n(d) Not recommend unnecessary tests or medications;\n(e) Maintain confidentiality;\n(f) Not discriminate against patients.`
      },
      {
        id: "CC4", title: "4. Enforcement",
        content: `Violations of this Code of Conduct may result in:\n(a) Warning and counseling;\n(b) Temporary account suspension;\n(c) Permanent account termination;\n(d) Reporting to relevant medical/legal authorities;\n(e) Civil or criminal legal action where applicable.`
      }
    ]
  },
  hi: {
    title: "आचार संहिता",
    subtitle: "सभी सेहत-साथी उपयोगकर्ताओं से अपेक्षित व्यवहार के मानक।",
    sections: [
      {
        id: "CC1", title: "1. मूल सिद्धांत",
        content: `सेहत-साथी के सभी उपयोगकर्ताओं को इन मूल सिद्धांतों को बनाए रखना चाहिए:\n(क) ईमानदारी: सभी इंटरैक्शन में सत्यवादी रहें;\n(ख) सम्मान: सभी के साथ गरिमा के साथ व्यवहार करें;\n(ग) जिम्मेदारी: अपने कार्यों का स्वामित्व लें;\n(घ) सुरक्षा: रोगी और समुदाय की सुरक्षा को प्राथमिकता दें;\n(ङ) गैर-भेदभाव: जाति, धर्म, लिंग या आर्थिक स्थिति के आधार पर भेदभाव न करें।`
      },
      {
        id: "CC2", title: "2. मरीज का आचरण",
        content: `मरीजों को चाहिए:\n(क) ईमानदार चिकित्सा इतिहास प्रदान करना;\n(ख) स्वास्थ्य पेशेवरों के साथ सम्मानपूर्वक व्यवहार करना;\n(ग) मेडिकल रिपोर्ट को जाली न बनाना।`
      },
      {
        id: "CC3", title: "3. स्वास्थ्य पेशेवर का आचरण",
        content: `स्वास्थ्य पेशेवरों को चाहिए:\n(क) चिकित्सा नैतिकता के उच्चतम मानकों को बनाए रखना;\n(ख) मरीजों के साथ सम्मानपूर्वक संवाद करना;\n(ग) मरीजों के साथ भेदभाव न करना।`
      },
      {
        id: "CC4", title: "4. प्रवर्तन",
        content: `इस आचार संहिता के उल्लंघन के परिणामस्वरूप चेतावनी, अस्थायी खाता निलंबन, स्थायी खाता समाप्ति या संबंधित चिकित्सा/कानूनी प्राधिकरणों को रिपोर्टिंग हो सकती है।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 19. CONTENT POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const CONTENT_POLICY = {
  id: "content_policy",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Content Policy",
    subtitle: "Rules governing content uploaded, posted, or shared on Sehat-Sathi.",
    sections: [
      {
        id: "CON1", title: "1. Prohibited Content",
        content: `The following content is strictly prohibited on Sehat-Sathi:\n(a) Fake, manipulated, or fraudulent medical reports;\n(b) False medical credentials or fabricated qualifications;\n(c) Sexually explicit or pornographic material;\n(d) Hate speech targeting individuals based on race, religion, gender, caste, or disability;\n(e) Misinformation about medical treatments, medications, or vaccines;\n(f) Content promoting unauthorized medical practices, quackery, or fake remedies;\n(g) Personal information of third parties without consent;\n(h) Content that violates any Indian law including the IT Act, IPC, or POCSO Act;\n(i) Defamatory content about healthcare providers or platform users.`
      },
      {
        id: "CON2", title: "2. Medical Content Standards",
        content: `Medical content shared through consultations or messaging must:\n(a) Be accurate to the best of the provider's professional knowledge;\n(b) Not make claims not substantiated by evidence;\n(c) Clearly distinguish opinion from medical fact;\n(d) Not endorse unproven treatments or products;\n(e) Comply with advertising standards for medical services.`
      },
      {
        id: "CON3", title: "3. Review & Enforcement",
        content: `Sehat-Sathi reserves the right to review, moderate, or remove content that violates this policy. Content removal does not require advance notice. Repeat violations may result in account termination. To report policy-violating content, contact: report@sehatsathi.in`
      }
    ]
  },
  hi: {
    title: "सामग्री नीति",
    subtitle: "सेहत-साथी पर अपलोड, पोस्ट या साझा की गई सामग्री को नियंत्रित करने वाले नियम।",
    sections: [
      {
        id: "CON1", title: "1. प्रतिबंधित सामग्री",
        content: `सेहत-साथी पर निम्नलिखित सामग्री सख्त रूप से प्रतिबंधित है:\n(क) नकली, हेरफेर की गई या धोखाधड़ीपूर्ण मेडिकल रिपोर्ट;\n(ख) झूठे चिकित्सा क्रेडेंशियल;\n(ग) चिकित्सा उपचार, दवाओं या टीकों के बारे में गलत जानकारी;\n(घ) अनधिकृत चिकित्सा प्रथाओं, नीम-हकीमी को बढ़ावा देने वाली सामग्री।`
      },
      {
        id: "CON2", title: "2. चिकित्सा सामग्री मानक",
        content: `परामर्श के माध्यम से साझा की गई चिकित्सा सामग्री डॉक्टर के पेशेवर ज्ञान के अनुसार सटीक होनी चाहिए और अप्रमाणित उपचार या उत्पादों का समर्थन नहीं करनी चाहिए।`
      },
      {
        id: "CON3", title: "3. समीक्षा और प्रवर्तन",
        content: `सेहत-साथी इस नीति का उल्लंघन करने वाली सामग्री की समीक्षा, नियंत्रण या हटाने का अधिकार सुरक्षित रखता है। उल्लंघन की रिपोर्ट करें: report@sehatsathi.in`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 20. MEDICAL RECORD USAGE POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const MEDICAL_RECORD_POLICY = {
  id: "medical_record_policy",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Medical Record Usage Policy",
    subtitle: "How Sehat-Sathi handles, stores, and shares medical records.",
    sections: [
      {
        id: "MR1", title: "1. Record Ownership",
        content: `All medical records, reports, and health data uploaded by you remain YOUR PROPERTY at all times. Sehat-Sathi does not claim ownership of your medical data. You grant Sehat-Sathi a limited, non-exclusive license to store, process, and display your records solely for providing the services you have requested.`
      },
      {
        id: "MR2", title: "2. Permitted Uses",
        content: `Your medical records will ONLY be used for:\n(a) Sharing with a Doctor you have booked a consultation with;\n(b) AI-based analysis when you explicitly request it;\n(c) Displaying to you through your patient portal;\n(d) Compliance with court orders or lawful government directives;\n(e) Emergency situations where disclosure is necessary to prevent serious harm.`
      },
      {
        id: "MR3", title: "3. Prohibited Uses",
        content: `Sehat-Sathi WILL NOT:\n(a) Sell your medical records to any third party;\n(b) Share your records with advertisers, insurance companies, or employers without explicit consent;\n(c) Use records for AI training without explicit, separate consent;\n(d) Disclose records to unauthorized individuals;\n(e) Use records for any purpose beyond service provision.`
      },
      {
        id: "MR4", title: "4. Security Measures",
        content: `Medical records are protected by:\n(a) AES-256 encryption at rest;\n(b) TLS 1.3 encryption in transit;\n(c) Role-based access control — only authorized users can access specific records;\n(d) Audit trails for all record access events;\n(e) Regular penetration testing and security audits.`
      },
      {
        id: "MR5", title: "5. Right to Portability",
        content: `You have the right to download all your medical records in a standard format (PDF/FHIR) at any time from your patient dashboard. This right cannot be waived by Sehat-Sathi.`
      }
    ]
  },
  hi: {
    title: "चिकित्सा रिकॉर्ड उपयोग नीति",
    subtitle: "सेहत-साथी चिकित्सा रिकॉर्ड को कैसे संभालता, संग्रहीत और साझा करता है।",
    sections: [
      {
        id: "MR1", title: "1. रिकॉर्ड स्वामित्व",
        content: `आपके द्वारा अपलोड किए गए सभी चिकित्सा रिकॉर्ड हर समय आपकी संपत्ति हैं। सेहत-साथी आपके चिकित्सा डेटा पर स्वामित्व का दावा नहीं करता।`
      },
      {
        id: "MR2", title: "2. अनुमत उपयोग",
        content: `आपके चिकित्सा रिकॉर्ड केवल इनके लिए उपयोग किए जाएंगे:\n(क) आपके द्वारा बुक किए गए डॉक्टर के साथ साझा करना;\n(ख) AI-आधारित विश्लेषण जब आप स्पष्ट रूप से अनुरोध करें;\n(ग) आपको आपके पोर्टल के माध्यम से प्रदर्शित करना।`
      },
      {
        id: "MR3", title: "3. प्रतिबंधित उपयोग",
        content: `सेहत-साथी नहीं करेगा:\n(क) आपके चिकित्सा रिकॉर्ड किसी तृतीय पक्ष को बेचना;\n(ख) बिना स्पष्ट सहमति के विज्ञापनदाताओं, बीमा कंपनियों या नियोक्ताओं के साथ आपके रिकॉर्ड साझा करना।`
      },
      {
        id: "MR4", title: "4. सुरक्षा उपाय",
        content: `चिकित्सा रिकॉर्ड AES-256 एन्क्रिप्शन, TLS 1.3, और भूमिका-आधारित पहुंच नियंत्रण द्वारा सुरक्षित हैं।`
      },
      {
        id: "MR5", title: "5. पोर्टेबिलिटी का अधिकार",
        content: `आपको अपने पेशेंट डैशबोर्ड से किसी भी समय एक मानक प्रारूप (PDF) में अपने सभी चिकित्सा रिकॉर्ड डाउनलोड करने का अधिकार है।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 21-28. ADDITIONAL CONSENT FORMS
// ─────────────────────────────────────────────────────────────────────────────
export const ADDITIONAL_CONSENTS = {
  audio_consultation: {
    en: {
      title: "Audio Consultation Consent",
      body: `By initiating an audio consultation, I consent to: (1) The audio session being recorded for quality assurance purposes; (2) The Doctor accessing my health information shared on the Platform for the purpose of providing medical advice; (3) Understanding that audio consultation has technical limitations and may not capture all clinical nuances; (4) Understanding that this consultation does not replace in-person examination; (5) The Doctor recommending an in-person visit if deemed clinically necessary.`
    },
    hi: {
      title: "ऑडियो परामर्श सहमति",
      body: `ऑडियो परामर्श शुरू करके, मैं सहमति देता/देती हूं: (1) गुणवत्ता आश्वासन के लिए ऑडियो सत्र की रिकॉर्डिंग; (2) चिकित्सा सलाह प्रदान करने के उद्देश्य से डॉक्टर द्वारा मेरी स्वास्थ्य जानकारी का प्रसंस्करण; (3) यह समझना कि ऑडियो परामर्श की तकनीकी सीमाएं हैं; (4) यदि नैदानिक रूप से आवश्यक हो तो डॉक्टर व्यक्तिगत विज़िट की सिफारिश कर सकते हैं।`
    }
  },
  report_upload: {
    en: {
      title: "Medical Report Upload Consent",
      body: `By uploading a medical report, I consent to: (1) The report being stored on Sehat-Sathi's secure servers with AES-256 encryption; (2) The report being shared with Doctors I book consultations with; (3) AI analysis of the report when I explicitly request it; (4) Understanding that uploaded reports remain my property; (5) Confirming that I have the right to upload this report (it is my own medical document or I have legal authority to upload it); (6) Understanding that uploading a fraudulent or tampered report is a violation of Platform terms and may constitute fraud under Indian law.`
    },
    hi: {
      title: "मेडिकल रिपोर्ट अपलोड सहमति",
      body: `एक मेडिकल रिपोर्ट अपलोड करके, मैं सहमति देता/देती हूं: (1) रिपोर्ट को AES-256 एन्क्रिप्शन के साथ सुरक्षित सर्वर पर संग्रहीत करना; (2) जिन डॉक्टरों से मैं परामर्श बुक करता/करती हूं उनके साथ रिपोर्ट साझा करना; (3) यह पुष्टि करना कि यह मेरा अपना चिकित्सा दस्तावेज है; (4) यह समझना कि धोखाधड़ीपूर्ण रिपोर्ट अपलोड करना प्लेटफ़ॉर्म नियमों का उल्लंघन है।`
    }
  },
  google_maps: {
    en: {
      title: "Google Maps & Location Services Consent",
      body: `By allowing map and location features, I consent to: (1) Sehat-Sathi using Google Maps API to display nearby healthcare facilities; (2) My location coordinates being used to calculate distances to hospitals, clinics, and pharmacies; (3) Understanding that Google Maps is a third-party service governed by Google's Privacy Policy and Terms of Service; (4) Location data being processed in real-time for service delivery and NOT stored beyond the session; (5) The ability to revoke location access at any time through device settings.`
    },
    hi: {
      title: "Google Maps और स्थान सेवाएं सहमति",
      body: `मानचित्र और स्थान सुविधाओं की अनुमति देकर, मैं सहमति देता/देती हूं: (1) निकटवर्ती स्वास्थ्य सुविधाएं प्रदर्शित करने के लिए Google Maps API का उपयोग; (2) Google Maps एक तृतीय-पक्ष सेवा है जो Google की गोपनीयता नीति द्वारा नियंत्रित है; (3) स्थान डेटा वास्तविक समय में संसाधित किया जाता है और सत्र से परे संग्रहीत नहीं किया जाता; (4) मैं डिवाइस सेटिंग्स के माध्यम से किसी भी समय स्थान पहुंच रद्द कर सकता/सकती हूं।`
    }
  },
  notifications: {
    en: {
      title: "Notification Consent",
      body: `By enabling notifications, I consent to: (1) Receiving push notifications for appointment reminders, consultation updates, and prescription alerts; (2) Receiving health tips and wellness content (optional — can be disabled separately); (3) Emergency alerts related to healthcare services near me; (4) Understanding that I can manage or disable notifications at any time through device settings or Platform preferences.`
    },
    hi: {
      title: "अधिसूचना सहमति",
      body: `सूचनाएं सक्षम करके, मैं सहमति देता/देती हूं: (1) नियुक्ति अनुस्मारक, परामर्श अपडेट और प्रिस्क्रिप्शन अलर्ट के लिए पुश नोटिफिकेशन प्राप्त करना; (2) मैं डिवाइस सेटिंग्स या प्लेटफ़ॉर्म प्राथमिकताओं के माध्यम से किसी भी समय नोटिफिकेशन प्रबंधित या अक्षम कर सकता/सकती हूं।`
    }
  },
  email: {
    en: {
      title: "Email Communication Consent",
      body: `By providing my email address, I consent to: (1) Receiving transactional emails for appointment confirmations, receipts, and account updates; (2) Receiving service notifications and security alerts; (3) Receiving health information newsletters (optional — can be unsubscribed at any time); (4) Understanding that transactional emails are necessary for service delivery and cannot be fully opted out of while maintaining an account.`
    },
    hi: {
      title: "ईमेल संचार सहमति",
      body: `अपना ईमेल पता प्रदान करके, मैं सहमति देता/देती हूं: (1) नियुक्ति पुष्टि, रसीदें और खाता अपडेट के लिए लेनदेन संबंधी ईमेल प्राप्त करना; (2) स्वास्थ्य जानकारी न्यूज़लेटर (वैकल्पिक — किसी भी समय अनसब्सक्राइब किया जा सकता है)।`
    }
  },
  sms: {
    en: {
      title: "SMS Communication Consent",
      body: `By providing my phone number, I consent to: (1) Receiving SMS OTPs for account verification and secure login; (2) Receiving appointment reminders via SMS; (3) Receiving urgent alerts and prescription pickup notifications; (4) Understanding that I can opt out of marketing SMS at any time by replying STOP; (5) Note: Transactional OTP SMS cannot be opted out of while maintaining an active account.`
    },
    hi: {
      title: "SMS संचार सहमति",
      body: `अपना फोन नंबर प्रदान करके, मैं सहमति देता/देती हूं: (1) खाता सत्यापन के लिए SMS OTP प्राप्त करना; (2) SMS के माध्यम से नियुक्ति अनुस्मारक प्राप्त करना; (3) STOP जवाब देकर किसी भी समय मार्केटिंग SMS से बाहर निकल सकता/सकती हूं।`
    }
  },
  whatsapp: {
    en: {
      title: "WhatsApp Communication Consent",
      body: `By opting in to WhatsApp communication, I consent to: (1) Receiving appointment reminders and health alerts via WhatsApp; (2) Receiving digital prescriptions via WhatsApp when requested; (3) Understanding that WhatsApp is a third-party service governed by Meta's Terms of Service and Privacy Policy; (4) Understanding that I can opt out of WhatsApp communications at any time through Platform settings; (5) Not sharing confidential medical information via WhatsApp outside the Platform's secure channel.`
    },
    hi: {
      title: "WhatsApp संचार सहमति",
      body: `WhatsApp संचार के लिए ऑप्ट-इन करके, मैं सहमति देता/देती हूं: (1) WhatsApp के माध्यम से नियुक्ति अनुस्मारक और स्वास्थ्य अलर्ट प्राप्त करना; (2) WhatsApp एक तृतीय-पक्ष सेवा है जो Meta की सेवा शर्तों द्वारा नियंत्रित है; (3) मैं प्लेटफ़ॉर्म सेटिंग्स के माध्यम से किसी भी समय WhatsApp संचार से बाहर निकल सकता/सकती हूं।`
    }
  },
  marketing: {
    en: {
      title: "Marketing Communication Consent",
      body: `I voluntarily consent to receive marketing communications from Sehat-Sathi including: (1) New feature announcements and product updates; (2) Healthcare partner promotions and offers; (3) Health awareness campaigns and newsletters; (4) Seasonal health tips and preventive care content.\n\nThis consent is OPTIONAL and separate from transactional communications. I may withdraw this consent at any time by clicking "Unsubscribe" in any marketing email, replying STOP to marketing SMS, or updating preferences in my Platform account settings. Withdrawal does not affect transactional communications required for service delivery.`
    },
    hi: {
      title: "मार्केटिंग संचार सहमति",
      body: `मैं स्वेच्छा से सेहत-साथी से मार्केटिंग संचार प्राप्त करने के लिए सहमति देता/देती हूं जिसमें नई सुविधा घोषणाएं, स्वास्थ्य जागरूकता अभियान शामिल हैं।\n\nयह सहमति वैकल्पिक है। मैं किसी भी मार्केटिंग ईमेल में "अनसब्सक्राइब" क्लिक करके इस सहमति को किसी भी समय वापस ले सकता/सकती हूं।`
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 29. DOCTOR RIGHTS
// ─────────────────────────────────────────────────────────────────────────────
export const DOCTOR_RIGHTS = {
  id: "doctor_rights",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Doctor Rights",
    subtitle: "Rights of licensed doctors registered on the Sehat-Sathi Platform.",
    sections: [
      {
        id: "DRC1", title: "1. Professional Autonomy",
        content: `Doctors retain full clinical autonomy. Sehat-Sathi does not direct, supervise, or control clinical decisions. Doctors have the right to decline consultations they deem inappropriate for telemedicine.`
      },
      {
        id: "DRC2", title: "2. Platform Rights",
        content: `Doctors have the right to:\n(a) Set their own consultation fees (within Platform guidelines);\n(b) Set their own availability schedule;\n(c) Access their complete consultation history and patient records;\n(d) Request account deletion with data portability;\n(e) Lodge complaints against patients who behave abusively;\n(f) Receive timely payment for completed consultations;\n(g) Receive support from Sehat-Sathi in verifying their credentials.`
      },
      {
        id: "DRC3", title: "3. Protection from Abuse",
        content: `Sehat-Sathi provides Doctors with:\n(a) Anonymous complaint filing against abusive patients;\n(b) Account flagging for patients with repeated inappropriate conduct;\n(c) Legal support information for cases of patient harassment.`
      }
    ]
  },
  hi: {
    title: "डॉक्टर के अधिकार",
    subtitle: "सेहत-साथी प्लेटफ़ॉर्म पर पंजीकृत लाइसेंस प्राप्त डॉक्टरों के अधिकार।",
    sections: [
      {
        id: "DRC1", title: "1. पेशेवर स्वायत्तता",
        content: `डॉक्टर पूर्ण नैदानिक स्वायत्तता बनाए रखते हैं। सेहत-साथी नैदानिक निर्णयों को निर्देशित या नियंत्रित नहीं करता।`
      },
      {
        id: "DRC2", title: "2. प्लेटफ़ॉर्म अधिकार",
        content: `डॉक्टरों को अधिकार है:\n(क) अपने स्वयं के परामर्श शुल्क निर्धारित करना;\n(ख) अपनी स्वयं की उपलब्धता अनुसूची निर्धारित करना;\n(ग) पूर्ण परामर्शों के लिए समय पर भुगतान प्राप्त करना।`
      },
      {
        id: "DRC3", title: "3. दुर्व्यवहार से सुरक्षा",
        content: `सेहत-साथी डॉक्टरों को दुर्व्यवहार करने वाले मरीजों के खिलाफ गुमनाम शिकायत दर्ज करने की सुविधा प्रदान करता है।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 30. HOSPITAL RIGHTS
// ─────────────────────────────────────────────────────────────────────────────
export const HOSPITAL_RIGHTS = {
  id: "hospital_rights",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Hospital Rights",
    subtitle: "Rights of hospitals listed on Sehat-Sathi.",
    sections: [
      {
        id: "HR1", title: "1. Listing Control",
        content: `Hospitals have the right to:\n(a) Update their profile information at any time;\n(b) Add or remove listed departments and doctors;\n(c) Set appointment availability for their associated doctors;\n(d) Respond to patient reviews through official channels;\n(e) Request removal of demonstrably false patient reviews through the Platform's review dispute process.`
      },
      {
        id: "HR2", title: "2. Data Access",
        content: `Hospitals have the right to access aggregated analytics about their profile views, appointment bookings, and patient demographics (anonymized). Individual patient health data remains private and is not accessible to the hospital entity except where explicitly authorized by the patient.`
      },
      {
        id: "HR3", title: "3. Dispute Resolution",
        content: `Hospitals may dispute Platform decisions regarding their listing through the Dispute Resolution process at legal@sehatsathi.in.`
      }
    ]
  },
  hi: {
    title: "अस्पताल के अधिकार",
    subtitle: "सेहत-साथी पर सूचीबद्ध अस्पतालों के अधिकार।",
    sections: [
      {
        id: "HR1", title: "1. सूचीकरण नियंत्रण",
        content: `अस्पतालों को अधिकार है:\n(क) किसी भी समय अपनी प्रोफ़ाइल जानकारी अपडेट करना;\n(ख) सूचीबद्ध विभागों और डॉक्टरों को जोड़ना या हटाना;\n(ग) आधिकारिक चैनलों के माध्यम से रोगी समीक्षाओं का जवाब देना।`
      },
      {
        id: "HR2", title: "2. डेटा पहुंच",
        content: `अस्पतालों को अपनी प्रोफ़ाइल दृश्यों, नियुक्ति बुकिंग के बारे में एकत्रित विश्लेषण तक पहुंचने का अधिकार है। व्यक्तिगत रोगी स्वास्थ्य डेटा निजी रहता है।`
      },
      {
        id: "HR3", title: "3. विवाद समाधान",
        content: `अस्पताल legal@sehatsathi.in पर विवाद समाधान प्रक्रिया के माध्यम से अपनी सूचीकरण के बारे में प्लेटफ़ॉर्म निर्णयों का विवाद कर सकते हैं।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 31. PATIENT RESPONSIBILITIES (Expanded)
// ─────────────────────────────────────────────────────────────────────────────
export const PATIENT_RESPONSIBILITIES = {
  id: "patient_responsibilities",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Patient Responsibilities",
    subtitle: "Obligations and responsibilities of patients using Sehat-Sathi.",
    sections: [
      {
        id: "PR1", title: "1. Information Accuracy",
        content: `Patients are responsible for providing accurate, complete, and truthful medical information. This includes: (a) Accurate medical history; (b) Current medications and allergies; (c) Existing diagnoses; (d) Truthful symptom descriptions. False or incomplete information that leads to incorrect medical advice is the patient's sole responsibility.`
      },
      {
        id: "PR2", title: "2. Report Authenticity",
        content: `Patients MUST NOT upload manipulated, fake, forged, or fraudulent medical reports. Uploading fraudulent documents is a violation of these Terms, may constitute fraud under the Indian Penal Code, and will result in: permanent account suspension, reporting to relevant authorities, and possible civil or criminal action.`
      },
      {
        id: "PR3", title: "3. Emergency Protocol",
        content: `In any medical emergency, patients must immediately contact official emergency services (dial 112). Patients must NOT rely exclusively on Sehat-Sathi for emergency medical response. The Platform cannot guarantee ambulance or emergency response.`
      },
      {
        id: "PR4", title: "4. Consultation Follow-Through",
        content: `After receiving any consultation or AI analysis, patients are responsible for following up with a licensed doctor for clinical interpretation and treatment decisions. AI insights are informational only.`
      }
    ]
  },
  hi: {
    title: "मरीज़ की जिम्मेदारियां",
    subtitle: "सेहत-साथी का उपयोग करने वाले मरीजों के दायित्व।",
    sections: [
      {
        id: "PR1", title: "1. जानकारी की सटीकता",
        content: `मरीज सटीक, पूर्ण और सत्य चिकित्सा जानकारी प्रदान करने के लिए जिम्मेदार हैं। गलत या अधूरी जानकारी के कारण गलत चिकित्सा सलाह मरीज की एकमात्र जिम्मेदारी है।`
      },
      {
        id: "PR2", title: "2. रिपोर्ट की प्रामाणिकता",
        content: `मरीजों को हेरफेर की गई, नकली, जाली या धोखाधड़ीपूर्ण मेडिकल रिपोर्ट अपलोड नहीं करनी चाहिए। धोखाधड़ीपूर्ण दस्तावेज अपलोड करना भारतीय दंड संहिता के तहत धोखाधड़ी हो सकता है।`
      },
      {
        id: "PR3", title: "3. आपातकालीन प्रोटोकॉल",
        content: `किसी भी चिकित्सा आपातकाल में, मरीजों को तुरंत आधिकारिक आपातकालीन सेवाओं (112 डायल करें) से संपर्क करना चाहिए।`
      },
      {
        id: "PR4", title: "4. परामर्श अनुवर्ती कार्रवाई",
        content: `किसी भी परामर्श या AI विश्लेषण के बाद, मरीज नैदानिक व्याख्या के लिए एक लाइसेंस प्राप्त डॉक्टर से अनुवर्ती कार्रवाई करने के लिए जिम्मेदार हैं।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 32. DOCTOR RESPONSIBILITIES (Expanded)
// ─────────────────────────────────────────────────────────────────────────────
export const DOCTOR_RESPONSIBILITIES = {
  id: "doctor_responsibilities",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Doctor Responsibilities",
    subtitle: "Professional obligations of doctors using Sehat-Sathi.",
    sections: [
      {
        id: "DRES1", title: "1. Medical Standards",
        content: `All doctors must: (a) Practice within the scope of their registered specialty; (b) Maintain the standard of care expected of a reasonably skilled physician; (c) Clearly communicate limitations of telemedicine to patients; (d) Refer patients for in-person care when clinically appropriate; (e) Keep clinical knowledge current through continuing medical education.`
      },
      {
        id: "DRES2", title: "2. Licensing & Registration",
        content: `Doctors must: (a) Maintain valid, active medical registration at all times; (b) Immediately notify Sehat-Sathi if their license is suspended, cancelled, or under investigation; (c) Not practice after license expiry or suspension; (d) Keep registration documents updated on the Platform.`
      },
      {
        id: "DRES3", title: "3. Patient Care",
        content: `Doctors must: (a) Provide consultation within their booked time slot; (b) Maintain professional conduct at all times; (c) Protect patient confidentiality; (d) Issue prescriptions only where clinically warranted; (e) Inform patients of fees before consultation; (f) Maintain clear, complete consultation records.`
      }
    ]
  },
  hi: {
    title: "डॉक्टर की जिम्मेदारियां",
    subtitle: "सेहत-साथी का उपयोग करने वाले डॉक्टरों के पेशेवर दायित्व।",
    sections: [
      {
        id: "DRES1", title: "1. चिकित्सा मानक",
        content: `सभी डॉक्टरों को: (क) अपने पंजीकृत विशेषता के दायरे में अभ्यास करना; (ख) टेलीमेडिसिन की सीमाओं को मरीजों को स्पष्ट रूप से बताना; (ग) जब नैदानिक रूप से उचित हो तो व्यक्तिगत देखभाल के लिए रोगियों को संदर्भित करना।`
      },
      {
        id: "DRES2", title: "2. लाइसेंसिंग और पंजीकरण",
        content: `डॉक्टरों को: (क) हर समय वैध, सक्रिय चिकित्सा पंजीकरण बनाए रखना; (ख) यदि लाइसेंस निलंबित, रद्द या जांच के तहत है तो तुरंत सेहत-साथी को सूचित करना।`
      },
      {
        id: "DRES3", title: "3. रोगी देखभाल",
        content: `डॉक्टरों को: (क) बुक किए गए समय स्लॉट के भीतर परामर्श प्रदान करना; (ख) रोगी गोपनीयता की रक्षा करना; (ग) केवल नैदानिक रूप से उचित होने पर नुस्खे जारी करना।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 33. HOSPITAL RESPONSIBILITIES (Expanded)
// ─────────────────────────────────────────────────────────────────────────────
export const HOSPITAL_RESPONSIBILITIES = {
  id: "hospital_responsibilities",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Hospital Responsibilities",
    subtitle: "Obligations of hospitals listed on Sehat-Sathi.",
    sections: [
      {
        id: "HRES1", title: "1. Profile Accuracy",
        content: `Hospitals must ensure all profile information (departments, doctors, facilities, bed capacity, ICU capacity) is accurate and updated within 48 hours of any change.`
      },
      {
        id: "HRES2", title: "2. Doctor Verification",
        content: `Hospitals are responsible for ensuring all doctors listed under their profile hold valid MCI/NMC registrations. Listing unlicensed practitioners constitutes a violation of this Agreement.`
      },
      {
        id: "HRES3", title: "3. Compliance",
        content: `Hospitals must maintain compliance with all applicable laws including: Clinical Establishments Act, NABH standards (where accredited), fire safety, biomedical waste management, and infection control regulations.`
      }
    ]
  },
  hi: {
    title: "अस्पताल की जिम्मेदारियां",
    subtitle: "सेहत-साथी पर सूचीबद्ध अस्पतालों के दायित्व।",
    sections: [
      {
        id: "HRES1", title: "1. प्रोफ़ाइल की सटीकता",
        content: `अस्पतालों को यह सुनिश्चित करना चाहिए कि सभी प्रोफ़ाइल जानकारी (विभाग, डॉक्टर, बेड क्षमता) सटीक है और किसी भी परिवर्तन के 48 घंटों के भीतर अपडेट की गई है।`
      },
      {
        id: "HRES2", title: "2. डॉक्टर सत्यापन",
        content: `अस्पताल यह सुनिश्चित करने के लिए जिम्मेदार हैं कि उनकी प्रोफ़ाइल के तहत सूचीबद्ध सभी डॉक्टरों के पास वैध MCI/NMC पंजीकरण है।`
      },
      {
        id: "HRES3", title: "3. अनुपालन",
        content: `अस्पतालों को क्लिनिकल एस्टेब्लिशमेंट एक्ट, NABH मानकों और संक्रमण नियंत्रण नियमों सहित सभी लागू कानूनों का अनुपालन बनाए रखना चाहिए।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 34. DISPUTE RESOLUTION POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const DISPUTE_RESOLUTION = {
  id: "dispute_resolution",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Dispute Resolution Policy",
    subtitle: "Process for resolving disputes between users and Sehat-Sathi.",
    sections: [
      {
        id: "DIS1", title: "1. Internal Grievance Redressal",
        content: `Step 1 — Grievance Officer: All disputes must first be reported to our Grievance Officer.\n\nGrievance Officer Contact:\nEmail: grievance@sehatsathi.in\nResponse Time: Within 15 working days\n\nThe grievance must be submitted with: (a) Name and contact details; (b) Date and nature of incident; (c) Transaction ID (if payment-related); (d) Copies of supporting evidence.\n\nSehat-Sathi will investigate and respond within 15 working days. This is MANDATORY as a first step before escalation.`
      },
      {
        id: "DIS2", title: "2. Consumer Forum",
        content: `If the internal grievance resolution is unsatisfactory, Users may escalate to:\n(a) The National Consumer Helpline: 1800-11-4000;\n(b) The appropriate Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019;\n(c) Online Dispute Resolution (ODR) platforms approved by DPIIT.`
      },
      {
        id: "DIS3", title: "3. Regulatory Complaints",
        content: `For complaints regarding:\n• Medical negligence by a Doctor: Contact MCI/NMC or the relevant State Medical Council\n• Data privacy violations: Contact the Data Protection Board of India (when operational)\n• Cybercrime: Contact the Cyber Crime Cell at cybercrime.gov.in`
      },
      {
        id: "DIS4", title: "4. Limitation Period",
        content: `All disputes must be raised within 90 days of the incident. Disputes raised after 90 days may not be investigated due to evidentiary limitations. Payment disputes must be raised within 48 hours of the transaction.`
      }
    ]
  },
  hi: {
    title: "विवाद समाधान नीति",
    subtitle: "उपयोगकर्ताओं और सेहत-साथी के बीच विवादों को सुलझाने की प्रक्रिया।",
    sections: [
      {
        id: "DIS1", title: "1. आंतरिक शिकायत निवारण",
        content: `चरण 1 — शिकायत अधिकारी: सभी विवाद पहले हमारे शिकायत अधिकारी को रिपोर्ट किए जाने चाहिए।\n\nशिकायत अधिकारी संपर्क:\nईमेल: grievance@sehatsathi.in\nप्रतिक्रिया समय: 15 कार्य दिवसों के भीतर\n\nसेहत-साथी 15 कार्य दिवसों के भीतर जांच करेगा और जवाब देगा।`
      },
      {
        id: "DIS2", title: "2. उपभोक्ता फोरम",
        content: `यदि आंतरिक शिकायत समाधान असंतोषजनक है, तो उपयोगकर्ता उपभोक्ता संरक्षण अधिनियम, 2019 के तहत उचित उपभोक्ता विवाद निवारण आयोग में जा सकते हैं।`
      },
      {
        id: "DIS3", title: "3. नियामक शिकायतें",
        content: `डॉक्टर द्वारा चिकित्सा लापरवाही के लिए: MCI/NMC या संबंधित राज्य चिकित्सा परिषद से संपर्क करें। साइबर अपराध के लिए: cybercrime.gov.in पर संपर्क करें।`
      },
      {
        id: "DIS4", title: "4. सीमा अवधि",
        content: `सभी विवाद घटना के 90 दिनों के भीतर उठाए जाने चाहिए। भुगतान विवाद लेनदेन के 48 घंटों के भीतर उठाए जाने चाहिए।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 35. ARBITRATION CLAUSE
// ─────────────────────────────────────────────────────────────────────────────
export const ARBITRATION_CLAUSE = {
  id: "arbitration",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Arbitration Clause",
    subtitle: "Binding arbitration terms for unresolved disputes.",
    sections: [
      {
        id: "ARB1", title: "1. Mandatory Pre-Arbitration Steps",
        content: `Before initiating arbitration, you MUST: (1) Submit a written grievance to grievance@sehatsathi.in; (2) Allow Sehat-Sathi 30 days to respond; (3) Attempt good-faith negotiation. Arbitration may only be initiated if the dispute remains unresolved after this process.`
      },
      {
        id: "ARB2", title: "2. Arbitration Process",
        content: `Any dispute that cannot be resolved through the Grievance Redressal Mechanism shall be settled by binding arbitration under the Arbitration and Conciliation Act, 1996 (as amended).\n\n• Number of Arbitrators: One (sole arbitrator)\n• Appointment: Mutually agreed by parties; failing agreement, appointed by the arbitration institution\n• Seat of Arbitration: India\n• Language: English (Hindi translation available on request)\n• Governing Law: Laws of the Republic of India\n• Arbitration Rules: Institutional rules as agreed\n• Costs: Each party bears its own costs unless the arbitrator orders otherwise.`
      },
      {
        id: "ARB3", title: "3. Exceptions to Arbitration",
        content: `The following disputes are NOT subject to arbitration and may be brought before competent courts:\n(a) Emergency injunctive relief to prevent imminent harm;\n(b) Intellectual property rights disputes;\n(c) Consumer protection claims before Consumer Forums as statutorily provided;\n(d) Regulatory enforcement matters.`
      },
      {
        id: "ARB4", title: "4. Class Action Waiver",
        content: `You agree that disputes will be resolved on an individual basis only. Class actions, class arbitrations, or consolidated proceedings are NOT permitted under this clause unless required by applicable law.`
      }
    ]
  },
  hi: {
    title: "मध्यस्थता खंड",
    subtitle: "अनसुलझे विवादों के लिए बाध्यकारी मध्यस्थता शर्तें।",
    sections: [
      {
        id: "ARB1", title: "1. अनिवार्य पूर्व-मध्यस्थता कदम",
        content: `मध्यस्थता शुरू करने से पहले, आपको: (1) grievance@sehatsathi.in को लिखित शिकायत जमा करनी होगी; (2) सेहत-साथी को 30 दिन जवाब देने का मौका देना होगा।`
      },
      {
        id: "ARB2", title: "2. मध्यस्थता प्रक्रिया",
        content: `कोई भी विवाद जो शिकायत निवारण तंत्र के माध्यम से हल नहीं किया जा सकता, उसे मध्यस्थता और सुलह अधिनियम, 1996 के तहत बाध्यकारी मध्यस्थता द्वारा सुलझाया जाएगा। मध्यस्थता की भाषा: अंग्रेजी। शासी कानून: भारत गणराज्य के कानून।`
      },
      {
        id: "ARB3", title: "3. मध्यस्थता के अपवाद",
        content: `उपभोक्ता संरक्षण दावे उपभोक्ता फोरम के समक्ष कानूनी प्रावधानों के अनुसार लाए जा सकते हैं।`
      },
      {
        id: "ARB4", title: "4. वर्ग कार्रवाई माफी",
        content: `आप सहमत हैं कि विवादों को केवल व्यक्तिगत आधार पर सुलझाया जाएगा।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 36. INTELLECTUAL PROPERTY POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const IP_POLICY = {
  id: "ip_policy",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Intellectual Property Policy",
    subtitle: "Protection of Sehat-Sathi's intellectual property and user content rights.",
    sections: [
      {
        id: "IP1", title: "1. Platform Ownership",
        content: `All intellectual property on the Sehat-Sathi Platform — including but not limited to software code, user interface design, graphics, logos, trademarks, service marks, algorithms, AI models, data structures, databases, and all associated documentation — is the exclusive property of Sehat-Sathi and is protected under:\n\n(a) Copyright Act, 1957 (India)\n(b) Trade Marks Act, 1999 (India)\n(c) Information Technology Act, 2000\n(d) Patents Act, 1970 (India)\n(e) Applicable international IP conventions to which India is a signatory\n\nAll rights are reserved. Unauthorized use constitutes infringement.`
      },
      {
        id: "IP2", title: "2. User Content License",
        content: `By uploading content (medical reports, profile information, reviews), you grant Sehat-Sathi a non-exclusive, worldwide, royalty-free, sublicensable license to: store, reproduce, process, and display your content solely for providing Platform services. This license terminates upon account deletion (subject to legally mandated retention periods). You retain all ownership rights to your content.`
      },
      {
        id: "IP3", title: "3. Restricted Use",
        content: `The following are expressly prohibited without prior written consent from Sehat-Sathi:\n(a) Reproducing, copying, or distributing any Platform content;\n(b) Creating derivative works based on Platform technology;\n(c) Reverse engineering the Platform's software or algorithms;\n(d) Using Sehat-Sathi's name, logos, or trademarks in any commercial context;\n(e) Scraping or automated data collection from the Platform;\n(f) Developing competing services using Platform data or insights.`
      },
      {
        id: "IP4", title: "4. Infringement Reports",
        content: `If you believe your intellectual property has been infringed on the Platform, please contact: legal@sehatsathi.in with details of the allegedly infringing content. We will investigate and respond within 15 business days.`
      }
    ]
  },
  hi: {
    title: "बौद्धिक संपदा नीति",
    subtitle: "सेहत-साथी की बौद्धिक संपदा और उपयोगकर्ता सामग्री अधिकारों का संरक्षण।",
    sections: [
      {
        id: "IP1", title: "1. प्लेटफ़ॉर्म स्वामित्व",
        content: `सेहत-साथी प्लेटफ़ॉर्म की सभी बौद्धिक संपदा — सॉफ्टवेयर कोड, UI डिज़ाइन, लोगो, ट्रेडमार्क, AI मॉडल सहित — सेहत-साथी की एकमात्र संपत्ति है और कॉपीराइट अधिनियम, 1957 और ट्रेड मार्क्स अधिनियम, 1999 के तहत संरक्षित है।`
      },
      {
        id: "IP2", title: "2. उपयोगकर्ता सामग्री लाइसेंस",
        content: `सामग्री अपलोड करके, आप सेहत-साथी को सेवाएं प्रदान करने के लिए आपकी सामग्री को संग्रहीत और प्रसंस्कृत करने का गैर-विशिष्ट लाइसेंस प्रदान करते हैं। आप अपनी सामग्री के सभी स्वामित्व अधिकार बनाए रखते हैं।`
      },
      {
        id: "IP3", title: "3. प्रतिबंधित उपयोग",
        content: `सेहत-साथी की पूर्व लिखित सहमति के बिना निम्नलिखित स्पष्ट रूप से प्रतिबंधित है:\n(क) किसी भी प्लेटफ़ॉर्म सामग्री का पुनरुत्पादन या वितरण;\n(ख) प्लेटफ़ॉर्म सॉफ्टवेयर का रिवर्स इंजीनियरिंग;\n(ग) किसी भी व्यावसायिक संदर्भ में सेहत-साथी के नाम का उपयोग।`
      },
      {
        id: "IP4", title: "4. उल्लंघन रिपोर्ट",
        content: `यदि आप मानते हैं कि प्लेटफ़ॉर्म पर आपकी बौद्धिक संपदा का उल्लंघन किया गया है, तो legal@sehatsathi.in से संपर्क करें।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 37. TRADEMARK POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const TRADEMARK_POLICY = {
  id: "trademark_policy",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Trademark Policy",
    subtitle: "Rules governing use of Sehat-Sathi's trademarks and brand assets.",
    sections: [
      {
        id: "TM1", title: "1. Protected Marks",
        content: `The following are protected trademarks of Sehat-Sathi:\n• "Sehat-Sathi" (name)\n• "SehatSathi" (name variant)\n• The Sehat-Sathi logo and symbol\n• "सेहत-साथी" (Hindi name)\n\nThese marks are registered or pending registration under the Trade Marks Act, 1999 (India). Unauthorized use constitutes trademark infringement.`
      },
      {
        id: "TM2", title: "2. Permitted Use",
        content: `You may reference Sehat-Sathi by name in truthful, factual statements (e.g., "I used Sehat-Sathi to book a doctor appointment"). No other use of our marks is permitted without written authorization.`
      },
      {
        id: "TM3", title: "3. Prohibited Use",
        content: `You may NOT:\n(a) Use Sehat-Sathi's name or logo as part of your own brand or product name;\n(b) Register domain names or social media handles incorporating Sehat-Sathi marks;\n(c) Create marketing materials suggesting endorsement by Sehat-Sathi;\n(d) Use marks in a manner that implies affiliation not approved by Sehat-Sathi.`
      }
    ]
  },
  hi: {
    title: "ट्रेडमार्क नीति",
    subtitle: "सेहत-साथी के ट्रेडमार्क और ब्रांड संपत्तियों के उपयोग को नियंत्रित करने वाले नियम।",
    sections: [
      {
        id: "TM1", title: "1. संरक्षित मार्क",
        content: `"Sehat-Sathi", "SehatSathi", सेहत-साथी लोगो और "सेहत-साथी" (हिंदी नाम) सेहत-साथी के संरक्षित ट्रेडमार्क हैं। ये मार्क ट्रेड मार्क्स अधिनियम, 1999 के तहत पंजीकृत हैं।`
      },
      {
        id: "TM2", title: "2. अनुमत उपयोग",
        content: `आप सत्यापित तथ्यात्मक बयानों में नाम से सेहत-साथी का संदर्भ दे सकते हैं।`
      },
      {
        id: "TM3", title: "3. प्रतिबंधित उपयोग",
        content: `आप अपने स्वयं के ब्रांड नाम में सेहत-साथी के नाम या लोगो का उपयोग नहीं कर सकते।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 38. COPYRIGHT POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const COPYRIGHT_POLICY = {
  id: "copyright_policy",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Copyright Policy",
    subtitle: "Protection of copyrighted works on and related to Sehat-Sathi.",
    sections: [
      {
        id: "CR1", title: "1. Platform Copyright",
        content: `All original content on the Platform — text, graphics, UI elements, code, data compilations, blog articles, health content — is copyright © Sehat-Sathi 2026. All rights reserved. No portion may be reproduced without prior written permission.`
      },
      {
        id: "CR2", title: "2. DMCA / Copyright Infringement Takedown",
        content: `If you believe your copyrighted work appears on the Platform without authorization, send a written notice to legal@sehatsathi.in including:\n(a) Identification of the copyrighted work;\n(b) Location of the allegedly infringing material on the Platform;\n(c) Your contact information;\n(d) A statement of good faith belief that the use is unauthorized;\n(e) Your signature.\n\nWe will investigate and remove infringing content within 15 business days where infringement is verified.`
      },
      {
        id: "CR3", title: "3. User Content Copyright",
        content: `You warrant that you own or have appropriate rights to all content you upload to the Platform. Sehat-Sathi is not responsible for copyright infringement by users. Repeat infringers will have their accounts terminated.`
      }
    ]
  },
  hi: {
    title: "कॉपीराइट नीति",
    subtitle: "सेहत-साथी से संबंधित कॉपीराइट कार्यों की सुरक्षा।",
    sections: [
      {
        id: "CR1", title: "1. प्लेटफ़ॉर्म कॉपीराइट",
        content: `प्लेटफ़ॉर्म पर सभी मूल सामग्री कॉपीराइट © सेहत-साथी 2026 है। पूर्व लिखित अनुमति के बिना किसी भी भाग को पुनरुत्पादित नहीं किया जा सकता।`
      },
      {
        id: "CR2", title: "2. कॉपीराइट उल्लंघन निष्कासन",
        content: `यदि आप मानते हैं कि आपकी कॉपीराइट की गई रचना प्लेटफ़ॉर्म पर बिना अनुमति के दिखती है, तो legal@sehatsathi.in पर लिखित नोटिस भेजें।`
      },
      {
        id: "CR3", title: "3. उपयोगकर्ता सामग्री कॉपीराइट",
        content: `आप गारंटी देते हैं कि आप उस सभी सामग्री के स्वामी हैं या उसके उपयुक्त अधिकार रखते हैं जो आप प्लेटफ़ॉर्म पर अपलोड करते हैं।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 39. PLATFORM USAGE POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const PLATFORM_USAGE_POLICY = {
  id: "platform_usage_policy",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Platform Usage Policy",
    subtitle: "Acceptable use standards for all Sehat-Sathi services.",
    sections: [
      {
        id: "PU1", title: "1. Acceptable Use",
        content: `The Platform is designed exclusively for healthcare-related purposes. Acceptable uses include: (a) Booking medical appointments; (b) Conducting telemedicine consultations; (c) Uploading and reviewing medical reports; (d) Communicating with Healthcare Providers; (e) Accessing health information; (f) AI-powered health assistance.`
      },
      {
        id: "PU2", title: "2. Prohibited Uses",
        content: `The following uses are strictly prohibited:\n(a) Commercial solicitation unrelated to legitimate healthcare;\n(b) Spamming or unsolicited mass communications;\n(c) Unauthorized data collection or profiling;\n(d) API abuse or excessive automated requests;\n(e) Using the Platform to facilitate illegal activities;\n(f) Attempting to gain unauthorized access to other users' data;\n(g) Impersonating Platform staff or healthcare authorities.`
      },
      {
        id: "PU3", title: "3. Fair Use",
        content: `Sehat-Sathi reserves the right to implement rate limiting, access controls, and usage caps to ensure fair access for all users. Accounts exhibiting abnormal usage patterns may be reviewed and suspended.`
      },
      {
        id: "PU4", title: "4. API Usage",
        content: `API access is subject to a separate API License Agreement. Unauthorized API access constitutes a violation of IT Act 2000. API rate limits are enforced to protect system stability.`
      }
    ]
  },
  hi: {
    title: "प्लेटफ़ॉर्म उपयोग नीति",
    subtitle: "सभी सेहत-साथी सेवाओं के लिए स्वीकार्य उपयोग मानक।",
    sections: [
      {
        id: "PU1", title: "1. स्वीकार्य उपयोग",
        content: `प्लेटफ़ॉर्म विशेष रूप से स्वास्थ्य सेवा से संबंधित उद्देश्यों के लिए डिज़ाइन किया गया है। स्वीकार्य उपयोग में शामिल हैं: चिकित्सा नियुक्तियां बुक करना, टेलीमेडिसिन परामर्श आयोजित करना, AI-संचालित स्वास्थ्य सहायता।`
      },
      {
        id: "PU2", title: "2. प्रतिबंधित उपयोग",
        content: `निम्नलिखित उपयोग सख्त रूप से प्रतिबंधित हैं:\n(क) वैध स्वास्थ्य सेवा से असंबंधित व्यावसायिक आग्रह;\n(ख) अनधिकृत डेटा संग्रह;\n(ग) प्लेटफ़ॉर्म स्टाफ का प्रतिरूपण।`
      },
      {
        id: "PU3", title: "3. उचित उपयोग",
        content: `सेहत-साथी सभी उपयोगकर्ताओं के लिए उचित पहुंच सुनिश्चित करने के लिए दर सीमा और उपयोग सीमा लागू करने का अधिकार सुरक्षित रखता है।`
      },
      {
        id: "PU4", title: "4. API उपयोग",
        content: `API पहुंच एक अलग API लाइसेंस अनुबंध के अधीन है। अनधिकृत API पहुंच IT Act 2000 का उल्लंघन है।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 40. SECURITY POLICY
// ─────────────────────────────────────────────────────────────────────────────
export const SECURITY_POLICY = {
  id: "security_policy",
  meta: { version: "1.0", effectiveDate: "01 August 2026" },
  en: {
    title: "Security Policy",
    subtitle: "Sehat-Sathi's security architecture and user security responsibilities.",
    sections: [
      {
        id: "SEC1", title: "1. Platform Security Architecture",
        content: `Sehat-Sathi implements enterprise-grade security measures:\n\n(a) ENCRYPTION:\n• Data at rest: AES-256 encryption for all medical records and personal data\n• Data in transit: TLS 1.3 for all API communications\n• End-to-end encryption for video/audio consultations\n\n(b) AUTHENTICATION:\n• JWT-based authentication with short-lived access tokens\n• Optional two-factor authentication (2FA) for all accounts\n• Mandatory 2FA for Doctor, Hospital, and Admin accounts\n• Google OAuth integration with secure token exchange\n\n(c) ACCESS CONTROL:\n• Role-Based Access Control (RBAC) — each user role has scoped permissions\n• Patient data is only accessible to the patient and their explicitly authorized doctors\n• Admin access is logged and audited\n• Principle of least privilege applied throughout`
      },
      {
        id: "SEC2", title: "2. Security Auditing",
        content: `Sehat-Sathi conducts:\n(a) Regular penetration testing by qualified security professionals;\n(b) Automated vulnerability scanning on all production systems;\n(c) Comprehensive audit logs for all data access and modification events;\n(d) Security code reviews before major platform releases;\n(e) Annual third-party security audits.`
      },
      {
        id: "SEC3", title: "3. Incident Response",
        content: `In the event of a security breach:\n(a) Sehat-Sathi will notify affected users within 72 hours of discovery;\n(b) The nature, extent, and potential impact of the breach will be communicated;\n(c) Remediation steps will be provided;\n(d) Relevant regulatory authorities will be notified as required by law;\n(e) Post-incident analysis and improvements will be implemented.`
      },
      {
        id: "SEC4", title: "4. User Security Responsibilities",
        content: `Users are responsible for:\n(a) Using strong, unique passwords;\n(b) Enabling 2FA where available;\n(c) Not sharing login credentials;\n(d) Logging out from shared devices;\n(e) Reporting suspected security issues to: security@sehatsathi.in;\n(f) Keeping their device software and browser updated.`
      },
      {
        id: "SEC5", title: "5. Responsible Disclosure",
        content: `If you discover a security vulnerability in the Platform, we encourage responsible disclosure. Please report it to security@sehatsathi.in before public disclosure. We commit to: acknowledging receipt within 48 hours, investigating within 10 business days, and crediting reporters where appropriate. We will not take legal action against good-faith security researchers.`
      }
    ]
  },
  hi: {
    title: "सुरक्षा नीति",
    subtitle: "सेहत-साथी की सुरक्षा वास्तुकला और उपयोगकर्ता सुरक्षा जिम्मेदारियां।",
    sections: [
      {
        id: "SEC1", title: "1. प्लेटफ़ॉर्म सुरक्षा वास्तुकला",
        content: `सेहत-साथी एंटरप्राइज़-ग्रेड सुरक्षा उपाय लागू करता है:\n\n(क) एन्क्रिप्शन:\n• विराम पर डेटा: AES-256 एन्क्रिप्शन\n• पारगमन में डेटा: TLS 1.3\n\n(ख) प्रमाणीकरण:\n• JWT-आधारित प्रमाणीकरण\n• वैकल्पिक दो-कारक प्रमाणीकरण (2FA)\n• डॉक्टर, अस्पताल और Admin खातों के लिए अनिवार्य 2FA\n\n(ग) पहुंच नियंत्रण:\n• भूमिका-आधारित पहुंच नियंत्रण (RBAC)\n• रोगी डेटा केवल रोगी और उनके स्पष्ट रूप से अधिकृत डॉक्टरों तक पहुंचने योग्य है`
      },
      {
        id: "SEC2", title: "2. सुरक्षा ऑडिटिंग",
        content: `सेहत-साथी नियमित पेनेट्रेशन परीक्षण, स्वचालित भेद्यता स्कैनिंग और सभी डेटा पहुंच घटनाओं के लिए व्यापक ऑडिट लॉग आयोजित करता है।`
      },
      {
        id: "SEC3", title: "3. घटना प्रतिक्रिया",
        content: `सुरक्षा उल्लंघन की स्थिति में, सेहत-साथी खोज के 72 घंटों के भीतर प्रभावित उपयोगकर्ताओं को सूचित करेगा और कानून द्वारा आवश्यकतानुसार नियामक प्राधिकरणों को सूचित करेगा।`
      },
      {
        id: "SEC4", title: "4. उपयोगकर्ता सुरक्षा जिम्मेदारियां",
        content: `उपयोगकर्ता जिम्मेदार हैं: मजबूत, अद्वितीय पासवर्ड का उपयोग करना, जहां उपलब्ध हो 2FA सक्षम करना, संदिग्ध सुरक्षा समस्याओं की security@sehatsathi.in पर रिपोर्ट करना।`
      },
      {
        id: "SEC5", title: "5. जिम्मेदार प्रकटीकरण",
        content: `यदि आप प्लेटफ़ॉर्म में सुरक्षा भेद्यता खोजते हैं, तो सार्वजनिक प्रकटीकरण से पहले इसे security@sehatsathi.in को रिपोर्ट करें।`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FULL DOCUMENT REGISTRY — All 50 Legal Documents
// ─────────────────────────────────────────────────────────────────────────────
export const FULL_DOCUMENT_REGISTRY = [
  // GROUP 1: Core Platform Documents
  {
    id: "terms", group: "Core", groupHi: "मुख्य दस्तावेज़",
    label: "Terms & Conditions", labelHi: "नियम एवं शर्तें",
    icon: "📋", data: TERMS
  },
  {
    id: "privacy", group: "Core", groupHi: "मुख्य दस्तावेज़",
    label: "Privacy Policy", labelHi: "गोपनीयता नीति",
    icon: "🔒", data: PRIVACY
  },
  {
    id: "cookie", group: "Core", groupHi: "मुख्य दस्तावेज़",
    label: "Cookie Policy", labelHi: "कुकी नीति",
    icon: "🍪", data: COOKIE_POLICY
  },
  {
    id: "medical", group: "Core", groupHi: "मुख्य दस्तावेज़",
    label: "Medical Disclaimer", labelHi: "चिकित्सा अस्वीकरण",
    icon: "⚕️", data: MEDICAL_DISCLAIMER
  },
  {
    id: "ai", group: "Core", groupHi: "मुख्य दस्तावेज़",
    label: "AI Disclaimer", labelHi: "AI अस्वीकरण",
    icon: "🤖", data: AI_DISCLAIMER
  },
  {
    id: "telemedicine", group: "Core", groupHi: "मुख्य दस्तावेज़",
    label: "Telemedicine Disclaimer", labelHi: "टेलीमेडिसिन अस्वीकरण",
    icon: "📹", data: TELEMEDICINE_DISCLAIMER
  },
  {
    id: "emergency", group: "Core", groupHi: "मुख्य दस्तावेज़",
    label: "Emergency Disclaimer", labelHi: "आपातकालीन अस्वीकरण",
    icon: "🚨", data: EMERGENCY_DISCLAIMER
  },
  {
    id: "user_agreement", group: "Core", groupHi: "मुख्य दस्तावेज़",
    label: "User Agreement", labelHi: "उपयोगकर्ता अनुबंध",
    icon: "📄", data: USER_AGREEMENT
  },
  {
    id: "platform_usage_policy", group: "Core", groupHi: "मुख्य दस्तावेज़",
    label: "Platform Usage Policy", labelHi: "प्लेटफ़ॉर्म उपयोग नीति",
    icon: "🖥️", data: PLATFORM_USAGE_POLICY
  },
  {
    id: "security_policy", group: "Core", groupHi: "मुख्य दस्तावेज़",
    label: "Security Policy", labelHi: "सुरक्षा नीति",
    icon: "🛡️", data: SECURITY_POLICY
  },

  // GROUP 2: Partner Agreements
  {
    id: "doctor_agreement", group: "Partner Agreements", groupHi: "भागीदार समझौते",
    label: "Doctor Agreement", labelHi: "डॉक्टर अनुबंध",
    icon: "👨‍⚕️", data: DOCTOR_AGREEMENT
  },
  {
    id: "hospital_agreement", group: "Partner Agreements", groupHi: "भागीदार समझौते",
    label: "Hospital Agreement", labelHi: "अस्पताल अनुबंध",
    icon: "🏥", data: HOSPITAL_AGREEMENT
  },
  {
    id: "lab_agreement", group: "Partner Agreements", groupHi: "भागीदार समझौते",
    label: "Laboratory Agreement", labelHi: "प्रयोगशाला अनुबंध",
    icon: "🔬", data: LABORATORY_AGREEMENT
  },
  {
    id: "pharmacy_agreement", group: "Partner Agreements", groupHi: "भागीदार समझौते",
    label: "Pharmacy Agreement", labelHi: "फार्मेसी अनुबंध",
    icon: "💊", data: PHARMACY_AGREEMENT
  },
  {
    id: "nurse_agreement", group: "Partner Agreements", groupHi: "भागीदार समझौते",
    label: "Nurse Agreement", labelHi: "नर्स अनुबंध",
    icon: "👩‍⚕️", data: NURSE_AGREEMENT
  },
  {
    id: "ambulance_agreement", group: "Partner Agreements", groupHi: "भागीदार समझौते",
    label: "Ambulance Partner Agreement", labelHi: "एम्बुलेंस भागीदार अनुबंध",
    icon: "🚑", data: AMBULANCE_AGREEMENT
  },
  {
    id: "diagnostic_center_agreement", group: "Partner Agreements", groupHi: "भागीदार समझौते",
    label: "Diagnostic Center Agreement", labelHi: "डायग्नोस्टिक सेंटर अनुबंध",
    icon: "🏨", data: DIAGNOSTIC_CENTER_AGREEMENT
  },
  {
    id: "healthcare_org_agreement", group: "Partner Agreements", groupHi: "भागीदार समझौते",
    label: "Healthcare Organization Agreement", labelHi: "स्वास्थ्य सेवा संगठन अनुबंध",
    icon: "🏛️", data: HEALTHCARE_ORG_AGREEMENT
  },
  {
    id: "clinic_agreement", group: "Partner Agreements", groupHi: "भागीदार समझौते",
    label: "Clinic Agreement", labelHi: "क्लिनिक अनुबंध",
    icon: "🩺", data: CLINIC_AGREEMENT
  },
  {
    id: "corporate_partner_agreement", group: "Partner Agreements", groupHi: "भागीदार समझौते",
    label: "Corporate Partner Agreement", labelHi: "कॉर्पोरेट भागीदार अनुबंध",
    icon: "🏢", data: CORPORATE_PARTNER_AGREEMENT
  },

  // GROUP 3: Financial Policies
  {
    id: "refund_policy", group: "Policies", groupHi: "नीतियां",
    label: "Refund Policy", labelHi: "रिफंड नीति",
    icon: "↩️", data: REFUND_POLICY
  },
  {
    id: "cancellation_policy", group: "Policies", groupHi: "नीतियां",
    label: "Cancellation Policy", labelHi: "रद्दीकरण नीति",
    icon: "❌", data: CANCELLATION_POLICY
  },
  {
    id: "payment_policy", group: "Policies", groupHi: "नीतियां",
    label: "Payment Policy", labelHi: "भुगतान नीति",
    icon: "💳", data: PAYMENT_POLICY
  },
  {
    id: "data_retention", group: "Policies", groupHi: "नीतियां",
    label: "Data Retention Policy", labelHi: "डेटा प्रतिधारण नीति",
    icon: "🗂️", data: DATA_RETENTION_POLICY
  },
  {
    id: "community", group: "Policies", groupHi: "नीतियां",
    label: "Community Guidelines", labelHi: "सामुदायिक दिशानिर्देश",
    icon: "🤝", data: COMMUNITY_GUIDELINES
  },
  {
    id: "code_of_conduct", group: "Policies", groupHi: "नीतियां",
    label: "Code of Conduct", labelHi: "आचार संहिता",
    icon: "⚖️", data: CODE_OF_CONDUCT
  },
  {
    id: "content_policy", group: "Policies", groupHi: "नीतियां",
    label: "Content Policy", labelHi: "सामग्री नीति",
    icon: "📝", data: CONTENT_POLICY
  },
  {
    id: "medical_record_policy", group: "Policies", groupHi: "नीतियां",
    label: "Medical Record Usage Policy", labelHi: "चिकित्सा रिकॉर्ड उपयोग नीति",
    icon: "📋", data: MEDICAL_RECORD_POLICY
  },

  // GROUP 4: Consent Forms
  {
    id: "video_consent", group: "Consent Forms", groupHi: "सहमति प्रपत्र",
    label: "Video Consultation Consent", labelHi: "वीडियो परामर्श सहमति",
    icon: "📹", data: { en: CONSENTS?.video?.en, hi: CONSENTS?.video?.hi }
  },
  {
    id: "audio_consent", group: "Consent Forms", groupHi: "सहमति प्रपत्र",
    label: "Audio Consultation Consent", labelHi: "ऑडियो परामर्श सहमति",
    icon: "🎙️", data: ADDITIONAL_CONSENTS.audio_consultation
  },
  {
    id: "ai_consent", group: "Consent Forms", groupHi: "सहमति प्रपत्र",
    label: "AI Report Analysis Consent", labelHi: "AI रिपोर्ट विश्लेषण सहमति",
    icon: "🤖", data: { en: CONSENTS?.ai_report_analysis?.en, hi: CONSENTS?.ai_report_analysis?.hi }
  },
  {
    id: "report_upload_consent", group: "Consent Forms", groupHi: "सहमति प्रपत्र",
    label: "Medical Report Upload Consent", labelHi: "मेडिकल रिपोर्ट अपलोड सहमति",
    icon: "📤", data: ADDITIONAL_CONSENTS.report_upload
  },
  {
    id: "location_consent", group: "Consent Forms", groupHi: "सहमति प्रपत्र",
    label: "Location Permission Consent", labelHi: "स्थान अनुमति सहमति",
    icon: "📍", data: { en: CONSENTS?.location?.en, hi: CONSENTS?.location?.hi }
  },
  {
    id: "maps_consent", group: "Consent Forms", groupHi: "सहमति प्रपत्र",
    label: "Google Maps Consent", labelHi: "Google Maps सहमति",
    icon: "🗺️", data: ADDITIONAL_CONSENTS.google_maps
  },
  {
    id: "notification_consent", group: "Consent Forms", groupHi: "सहमति प्रपत्र",
    label: "Notification Consent", labelHi: "अधिसूचना सहमति",
    icon: "🔔", data: ADDITIONAL_CONSENTS.notifications
  },
  {
    id: "email_consent", group: "Consent Forms", groupHi: "सहमति प्रपत्र",
    label: "Email Communication Consent", labelHi: "ईमेल संचार सहमति",
    icon: "📧", data: ADDITIONAL_CONSENTS.email
  },
  {
    id: "sms_consent", group: "Consent Forms", groupHi: "सहमति प्रपत्र",
    label: "SMS Communication Consent", labelHi: "SMS संचार सहमति",
    icon: "💬", data: ADDITIONAL_CONSENTS.sms
  },
  {
    id: "whatsapp_consent", group: "Consent Forms", groupHi: "सहमति प्रपत्र",
    label: "WhatsApp Communication Consent", labelHi: "WhatsApp संचार सहमति",
    icon: "📱", data: ADDITIONAL_CONSENTS.whatsapp
  },
  {
    id: "marketing_consent", group: "Consent Forms", groupHi: "सहमति प्रपत्र",
    label: "Marketing Communication Consent", labelHi: "मार्केटिंग संचार सहमति",
    icon: "📢", data: ADDITIONAL_CONSENTS.marketing
  },

  // GROUP 5: Rights & Responsibilities
  {
    id: "rights", group: "Rights & Responsibilities", groupHi: "अधिकार और जिम्मेदारियां",
    label: "Patient Rights", labelHi: "मरीज़ के अधिकार",
    icon: "🛡️", data: PATIENT_RIGHTS
  },
  {
    id: "doctor_rights", group: "Rights & Responsibilities", groupHi: "अधिकार और जिम्मेदारियां",
    label: "Doctor Rights", labelHi: "डॉक्टर के अधिकार",
    icon: "⚕️", data: DOCTOR_RIGHTS
  },
  {
    id: "hospital_rights", group: "Rights & Responsibilities", groupHi: "अधिकार और जिम्मेदारियां",
    label: "Hospital Rights", labelHi: "अस्पताल के अधिकार",
    icon: "🏥", data: HOSPITAL_RIGHTS
  },
  {
    id: "patient_responsibilities", group: "Rights & Responsibilities", groupHi: "अधिकार और जिम्मेदारियां",
    label: "Patient Responsibilities", labelHi: "मरीज़ की जिम्मेदारियां",
    icon: "✅", data: PATIENT_RESPONSIBILITIES
  },
  {
    id: "doctor_responsibilities", group: "Rights & Responsibilities", groupHi: "अधिकार और जिम्मेदारियां",
    label: "Doctor Responsibilities", labelHi: "डॉक्टर की जिम्मेदारियां",
    icon: "👨‍⚕️", data: DOCTOR_RESPONSIBILITIES
  },
  {
    id: "hospital_responsibilities", group: "Rights & Responsibilities", groupHi: "अधिकार और जिम्मेदारियां",
    label: "Hospital Responsibilities", labelHi: "अस्पताल की जिम्मेदारियां",
    icon: "🏨", data: HOSPITAL_RESPONSIBILITIES
  },

  // GROUP 6: Legal & Compliance
  {
    id: "dispute_resolution", group: "Legal & Compliance", groupHi: "कानूनी और अनुपालन",
    label: "Dispute Resolution Policy", labelHi: "विवाद समाधान नीति",
    icon: "⚖️", data: DISPUTE_RESOLUTION
  },
  {
    id: "arbitration", group: "Legal & Compliance", groupHi: "कानूनी और अनुपालन",
    label: "Arbitration Clause", labelHi: "मध्यस्थता खंड",
    icon: "🏛️", data: ARBITRATION_CLAUSE
  },
  {
    id: "ip_policy", group: "Legal & Compliance", groupHi: "कानूनी और अनुपालन",
    label: "Intellectual Property Policy", labelHi: "बौद्धिक संपदा नीति",
    icon: "©️", data: IP_POLICY
  },
  {
    id: "trademark_policy", group: "Legal & Compliance", groupHi: "कानूनी और अनुपालन",
    label: "Trademark Policy", labelHi: "ट्रेडमार्क नीति",
    icon: "™️", data: TRADEMARK_POLICY
  },
  {
    id: "copyright_policy", group: "Legal & Compliance", groupHi: "कानूनी और अनुपालन",
    label: "Copyright Policy", labelHi: "कॉपीराइट नीति",
    icon: "©️", data: COPYRIGHT_POLICY
  },
];

export default FULL_DOCUMENT_REGISTRY;

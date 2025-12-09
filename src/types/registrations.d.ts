interface ParticipantPersonal {
  maritalStatus:
    | "Single"
    | "Married"
    | "Divorced"
    | "Widowed"
    | "SecondUnion"
    | string;
  pregnancy:
    | "None"
    | "FirstTrimester"
    | "SecondTrimester"
    | "ThirdTrimester"
    | string;
  shirtSize: "PP" | "P" | "M" | "G" | "GG" | "XGG" | string;
  weightKg: number;
  heightCm: number;
  profession: string;
  streetAndNumber: string;
  neighborhood: string;
  state: string;
}

interface ParticipantContacts {
  whatsapp: string | null;
  facebookUsername: string | null;
  instagramHandle: string | null;
  neighborPhone: string | null;
  relativePhone: string | null;
}

interface ParticipantFamilyInfo {
  fatherStatus: "Alive" | "Deceased" | "Unknown" | string;
  fatherName: string | null;
  fatherPhone: string | null;
  motherStatus: "Alive" | "Deceased" | "Unknown" | string;
  motherName: string | null;
  motherPhone: string | null;
  hadFamilyLossLast6Months: boolean;
  familyLossDetails: string | null;
  hasRelativeOrFriendSubmitted: boolean;
  submitterRelationship: "None" | "Relative" | "Friend" | string;
  submitterNames: string | null;
}

interface ParticipantReligionHistory {
  religion: string;
  previousUncalledApplications: string;
  rahaminVidaCompleted: string;
}

interface ParticipantHealth {
  alcoholUse: "None" | "Daily" | "Weekends" | "AlcoholDependent;";
  smoker: boolean;
  usesDrugs: boolean;
  drugUseFrequency: string | null;
  hasAllergies: boolean;
  allergiesDetails: string | null;
  hasMedicalRestriction: boolean;
  medicalRestrictionDetails: string | null;
  takesMedication: boolean;
  medicationsDetails: string | null;
  physicalLimitationDetails: string | null;
  recentSurgeryOrProcedureDetails: string | null;
}

interface ParticipantConsents {
  termsAccepted: boolean;
  termsAcceptedAt: string | null;
  termsVersion: string | null;
  marketingOptIn: boolean;
  marketingOptInAt: string | null;
  clientIp: string | null;
  userAgent: string | null;
}

interface ParticipantMedia {
  photoStorageKey: string | null;
  photoContentType: string | null;
  photoSizeBytes: number | null;
  photoUploadedAt: string | null;
  photoUrl: string | null;
  idDocumentType: string | null;
  idDocumentNumber: string | null;
  idDocumentStorageKey: string | null;
  idDocumentContentType: string | null;
  idDocumentSizeBytes: number | null;
  idDocumentUploadedAt: string | null;
  idDocumentUrl: string | null;
}

interface ParticipantFamily {
  familyId: string;
  name: string;
  color?: string;
}

interface Participant {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  city: string;
  gender: "Male" | "Female";
  status:
    | "Selected"
    | "NotSelected"
    | "PendingPayment"
    | "PaymentConfirmed"
    | "Confirmed"
    | "Canceled";
  enabled: boolean;
  retreatId: string;
  tentId: string | null;
  teamId: string | null;
  birthDate: string;
  photoUrl: string | null;
  completedRetreat: boolean;
  registrationDate: string;
  family: ParticipantFamily | null;
  age: number;
  personal: ParticipantPersonal;
  contacts: ParticipantContacts;
  familyInfo: ParticipantFamilyInfo;
  religionHistory: ParticipantReligionHistory;
  health: ParticipantHealth;
  consents: ParticipantConsents;
  media: ParticipantMedia;
}

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockDoctors, Doctor } from '../mock/doctors';
import { mockPatient, PatientProfile } from '../mock/patient';
import { mockConsultations, ConsultationRecord, PrescriptionItem } from '../mock/consultations';
export type { PrescriptionItem, ConsultationRecord };
import { mockLabReports, mockMealPhotos, mockWeightHistory } from '../mock/metrics';

export type CallState =
  | 'idle'
  | 'checking'
  | 'queued'
  | 'matched'
  | 'connecting'
  | 'inCall'
  | 'reconnecting'
  | 'ended';

export type CallMode = 'video' | 'audio';
export type NetworkQuality = 'good' | 'fair' | 'weak' | 'offline';

export interface CallEvent {
  consultationId: string;
  eventType:
    | 'call started'
    | 'switched to audio'
    | 'switched to video'
    | 'paused video'
    | 'resumed video'
    | 'dropped'
    | 'reconnected'
    | 'recording off'
    | 'recording on'
    | 'document uploaded'
    | 'reaction sent'
    | 'chat message'
    | 'doctor shared content'
    | 'call ended';
  timestamp: number;
  triggeredBy: 'patient' | 'doctor' | 'automatic';
  networkQuality: NetworkQuality;
  modeAfter: CallMode | 'none';
  metadata?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor';
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
  readByDoctor?: boolean;
}

export interface UploadedDoc {
  id: string;
  title: string;
  url: string;
  uploadedAt: string;
  isNew: boolean;
  reviewed: boolean;
  type: 'prescription' | 'lab' | 'photo';
}

export interface ScheduledBooking {
  doctorId: string;
  doctorName: string;
  doctorAvatar: string;
  doctorQualification: string;
  dateStr: string;
  timeSlot: string;
  language: string;
  timestamp: number;
  consultationId: string;
}

export interface DoctorSOAPNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  lastSavedAt: string;
}

export interface ConsultationStoreState {
  // Active role
  currentRole: 'patient' | 'doctor';
  setCurrentRole: (role: 'patient' | 'doctor') => void;

  // Language
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;

  // Patient profile
  patient: PatientProfile;

  // Call engine state
  callState: CallState;
  callMode: CallMode;
  networkQuality: NetworkQuality;
  isRecordingOn: boolean;
  activeDoctor: Doctor | null;
  currentConsultationId: string;
  callDurationSeconds: number;
  reconnectTimeSeconds: number;

  // Patient in-call states
  isPatientMuted: boolean;
  isPatientCameraOff: boolean;
  isPatientVideoPaused: boolean;
  patientPauseCountdown: number;
  facingMode: 'front' | 'back';
  activeReaction: string | null;

  // Doctor in-call states
  isDoctorMuted: boolean;
  isDoctorCameraOff: boolean;
  doctorBrandedBackgroundOn: boolean;
  doctorSharedItem: {
    type: 'graph' | 'plan';
    title: string;
    details: string;
  } | null;

  // Queue state
  queuePosition: number;
  queueWaitSeconds: number;
  isPriorityConnect: boolean;
  isLongWaitTriggered: boolean;

  // Data Sharing Consent
  consentOptions: Record<string, boolean>;
  consentTimestamp: number | null;
  setConsentOption: (key: string, value: boolean) => void;
  saveConsent: () => void;

  // Chat & Documents
  chatMessages: ChatMessage[];
  uploadedDocs: UploadedDoc[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  addUploadedDoc: (doc: Omit<UploadedDoc, 'id' | 'uploadedAt' | 'isNew' | 'reviewed'>) => void;
  markDocReviewed: (id: string) => void;

  // Doctor clinical workspace
  soapNotes: DoctorSOAPNotes;
  updateSOAPNotes: (field: keyof DoctorSOAPNotes, value: string) => void;
  selectedReasons: string[];
  toggleReason: (reason: string) => void;
  prescriptionList: PrescriptionItem[];
  addPrescriptionItem: (item: PrescriptionItem) => void;
  removePrescriptionItem: (index: number) => void;
  keyPointersList: string[];
  addKeyPointer: (point: string) => void;
  removeKeyPointer: (index: number) => void;
  selectedMetricTab: string;
  setSelectedMetricTab: (tab: string) => void;

  // Scheduled bookings & history
  scheduledBooking: ScheduledBooking | null;
  consultationHistory: ConsultationRecord[];
  bookSchedule: (booking: ScheduledBooking) => Promise<void>;
  cancelSchedule: () => Promise<void>;
  loadPersistedData: () => Promise<void>;

  // Call events log
  eventLogs: CallEvent[];
  logEvent: (event: Omit<CallEvent, 'timestamp' | 'consultationId' | 'networkQuality'>) => void;
  getCallStatistics: () => {
    switchesCount: number;
    videoMinutes: number;
    audioMinutes: number;
    dropsCount: number;
    avgReconnectSecs: number;
  };

  // Feedback responses
  feedbackAnswers: {
    problemResolved?: 'Yes' | 'Partly' | 'No';
    guidanceRating?: number;
    doctorUnderstood?: 'Yes' | 'No';
    confidenceRating?: number;
    nextSteps?: string[];
    confidenceFeedback?: string;
    callQuality?: 'Good' | 'Some issues' | 'Poor';
    npsScore?: number;
    submittedAt?: number;
  };
  setFeedbackAnswer: (key: string, val: any) => void;

  // Dev overrides & triggers
  devSimulatePermissionDenied: boolean;
  devRedFlagTriggered: boolean;
  setDevSimulatePermissionDenied: (val: boolean) => void;
  triggerDevRedFlag: () => void;
  clearDevRedFlag: () => void;
  setNetworkQuality: (net: NetworkQuality) => void;
  triggerCallDrop: () => void;
  forceDoctorJoinsNow: () => void;
  forceLongQueue: () => void;
  resetAllState: () => void;

  // State actions
  setCallState: (st: CallState) => void;
  setCallMode: (mode: CallMode, triggeredBy?: 'patient' | 'doctor' | 'automatic') => void;
  setIsRecordingOn: (on: boolean, triggeredBy?: 'patient' | 'doctor' | 'automatic') => void;
  togglePatientMute: () => void;
  togglePatientCamera: () => void;
  pausePatientVideo: () => void;
  resumePatientVideo: () => void;
  flipCamera: () => void;
  sendReaction: (emoji: string) => void;
  toggleDoctorMute: () => void;
  toggleDoctorCamera: () => void;
  setDoctorBrandedBackground: (on: boolean) => void;
  setDoctorSharedItem: (item: any) => void;
  endCall: (triggeredBy?: 'patient' | 'doctor') => void;
  startLiveCallProcess: (isPriority?: boolean) => void;
  incrementCallDuration: () => void;
}

const STORAGE_KEYS = {
  SCHEDULED_BOOKING: '@elevate_scheduled_booking_v1',
  HISTORY: '@elevate_history_v1',
  CONSENT: '@elevate_consent_v1',
};

const DEFAULT_CONSENT: Record<string, boolean> = {
  // Mandatory
  demographics: true,
  weightHistory: true,
  conditionsAllergies: true,
  medicinesDoseLog: true,
  sideEffects: true,
  // Optional
  foodLogs: true,
  stepsActivity: true,
  sleep: true,
  water: true,
  mood: true,
  labsPrescriptions: true,
  deviceData: true,
};

const DEFAULT_SOAP: DoctorSOAPNotes = {
  subjective: 'Patient reports mild nausea for 2 days post injection. Hydration average 1.8L. Weight steady at 83kg.',
  objective: 'Weight: 83.0 kg (-6kg from baseline). BMI: 31.2. Dose step 2 (0.5mg). Adherence 82%. Hydration low.',
  assessment: 'GLP-1 therapy response favorable. Mild drug-induced nausea exacerbated by suboptimal fluid intake.',
  plan: 'Continue 0.5mg Semaglutide weekly. Increase hydration to 3L daily with electrolyte packs. Review in 4 weeks.',
  lastSavedAt: 'Just now',
};

export const useConsultationStore = create<ConsultationStoreState>((set, get) => ({
  currentRole: 'patient',
  setCurrentRole: (role) => set({ currentRole: role }),

  language: 'en',
  setLanguage: (lang) => set({ language: lang }),

  patient: mockPatient,

  callState: 'idle',
  callMode: 'video',
  networkQuality: 'good',
  isRecordingOn: true,
  activeDoctor: mockDoctors[0],
  currentConsultationId: 'VC-000123',
  callDurationSeconds: 0,
  reconnectTimeSeconds: 60,

  isPatientMuted: false,
  isPatientCameraOff: false,
  isPatientVideoPaused: false,
  patientPauseCountdown: 120,
  facingMode: 'front',
  activeReaction: null,

  isDoctorMuted: false,
  isDoctorCameraOff: false,
  doctorBrandedBackgroundOn: true,
  doctorSharedItem: null,

  queuePosition: 3,
  queueWaitSeconds: 360,
  isPriorityConnect: false,
  isLongWaitTriggered: false,

  consentOptions: DEFAULT_CONSENT,
  consentTimestamp: null,
  setConsentOption: (key, value) => {
    // Prevent unticking mandatory items
    const mandatoryKeys = ['demographics', 'weightHistory', 'conditionsAllergies', 'medicinesDoseLog', 'sideEffects'];
    if (mandatoryKeys.includes(key) && !value) return;

    set((state) => ({
      consentOptions: { ...state.consentOptions, [key]: value },
    }));
  },
  saveConsent: () => {
    const ts = Date.now();
    set({ consentTimestamp: ts });
    AsyncStorage.setItem(STORAGE_KEYS.CONSENT, JSON.stringify({ options: get().consentOptions, ts }));
  },

  chatMessages: [
    {
      id: 'm-init',
      sender: 'doctor',
      text: 'Hello Priya, welcome to your consultation. How are you feeling today?',
      timestamp: 'Just now',
      readByDoctor: true,
    },
  ],
  uploadedDocs: [
    {
      id: 'doc-init',
      title: 'Previous HbA1c & Lipid Panel.pdf',
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&q=80',
      uploadedAt: '10 mins ago',
      isNew: false,
      reviewed: true,
      type: 'lab',
    },
  ],

  addChatMessage: (msg) => {
    const newMessage: ChatMessage = {
      ...msg,
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readByDoctor: msg.sender === 'doctor',
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, newMessage],
    }));
    get().logEvent({
      eventType: 'chat message',
      triggeredBy: msg.sender,
      modeAfter: get().callMode,
      metadata: { text: msg.text },
    });
  },

  addUploadedDoc: (doc) => {
    const newDoc: UploadedDoc = {
      ...doc,
      id: `upload-${Date.now()}`,
      uploadedAt: 'Just now',
      isNew: true,
      reviewed: false,
    };
    set((state) => ({
      uploadedDocs: [newDoc, ...state.uploadedDocs],
    }));
    get().logEvent({
      eventType: 'document uploaded',
      triggeredBy: 'patient',
      modeAfter: get().callMode,
      metadata: { title: doc.title },
    });
  },

  markDocReviewed: (id) => {
    set((state) => ({
      uploadedDocs: state.uploadedDocs.map((d) => (d.id === id ? { ...d, reviewed: true, isNew: false } : d)),
    }));
  },

  soapNotes: DEFAULT_SOAP,
  updateSOAPNotes: (field, value) => {
    set((state) => ({
      soapNotes: {
        ...state.soapNotes,
        [field]: value,
        lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    }));
  },

  selectedReasons: ['GLP-1 dose review', 'Side effects'],
  toggleReason: (reason) => {
    set((state) => {
      const exists = state.selectedReasons.includes(reason);
      return {
        selectedReasons: exists
          ? state.selectedReasons.filter((r) => r !== reason)
          : [...state.selectedReasons, reason],
      };
    });
  },

  prescriptionList: [
    {
      medicineName: 'Semaglutide 0.5 mg pen',
      dosage: '0.5 mg subcutaneous injection',
      frequency: 'Once weekly',
      duration: '4 weeks',
      instructions: 'Inject Tuesday morning after breakfast',
      indication: 'Weight Management GLP-1',
    },
    {
      medicineName: 'Oral Rehydration Salts (ORS)',
      dosage: '1 sachet daily in 1L water',
      frequency: 'Daily morning',
      duration: '14 days',
      instructions: 'Sip steadily throughout morning',
      indication: 'Hydration & Nausea Management',
    },
  ],
  addPrescriptionItem: (item) => {
    set((state) => ({
      prescriptionList: [...state.prescriptionList, item],
    }));
  },
  removePrescriptionItem: (index) => {
    set((state) => ({
      prescriptionList: state.prescriptionList.filter((_, i) => i !== index),
    }));
  },

  keyPointersList: [
    'Drink 3 litres of water daily to reduce nausea.',
    'Take Semaglutide 0.5 mg once weekly every Tuesday.',
    'Eat smaller, frequent meals high in protein.',
    'Report any vomiting or severe stomach pain immediately.',
  ],
  addKeyPointer: (point) => {
    set((state) => ({
      keyPointersList: [...state.keyPointersList, point],
    }));
  },
  removeKeyPointer: (index) => {
    set((state) => ({
      keyPointersList: state.keyPointersList.filter((_, i) => i !== index),
    }));
  },

  selectedMetricTab: 'metrics',
  setSelectedMetricTab: (tab) => set({ selectedMetricTab: tab }),

  scheduledBooking: null,
  consultationHistory: mockConsultations,

  bookSchedule: async (booking) => {
    set({ scheduledBooking: booking });
    await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULED_BOOKING, JSON.stringify(booking));
  },

  cancelSchedule: async () => {
    set({ scheduledBooking: null });
    await AsyncStorage.removeItem(STORAGE_KEYS.SCHEDULED_BOOKING);
  },

  loadPersistedData: async () => {
    try {
      const bookingData = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED_BOOKING);
      if (bookingData) {
        set({ scheduledBooking: JSON.parse(bookingData) });
      }
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (historyData) {
        set({ consultationHistory: JSON.parse(historyData) });
      }
      const consentData = await AsyncStorage.getItem(STORAGE_KEYS.CONSENT);
      if (consentData) {
        const parsed = JSON.parse(consentData);
        set({ consentOptions: parsed.options, consentTimestamp: parsed.ts });
      }
    } catch (e) {
      console.warn('Error loading persisted data:', e);
    }
  },

  eventLogs: [],
  logEvent: (event) => {
    const newLog: CallEvent = {
      ...event,
      consultationId: get().currentConsultationId,
      networkQuality: get().networkQuality,
      timestamp: Date.now(),
    };
    set((state) => ({
      eventLogs: [newLog, ...state.eventLogs],
    }));
  },

  getCallStatistics: () => {
    const logs = get().eventLogs;
    let switchesCount = 0;
    let dropsCount = 0;
    let videoSecs = 0;
    let audioSecs = 0;

    // Approximate calculations from events
    logs.forEach((log) => {
      if (log.eventType === 'switched to audio' || log.eventType === 'switched to video') {
        switchesCount += 1;
      }
      if (log.eventType === 'dropped') {
        dropsCount += 1;
      }
    });

    const totalSecs = get().callDurationSeconds;
    if (get().callMode === 'video') {
      videoSecs = Math.max(totalSecs - switchesCount * 45, 0);
      audioSecs = totalSecs - videoSecs;
    } else {
      audioSecs = Math.max(totalSecs - 30, 0);
      videoSecs = totalSecs - audioSecs;
    }

    return {
      switchesCount,
      dropsCount,
      videoMinutes: Math.round((videoSecs / 60) * 10) / 10,
      audioMinutes: Math.round((audioSecs / 60) * 10) / 10,
      avgReconnectSecs: dropsCount > 0 ? 4 : 0,
    };
  },

  feedbackAnswers: {},
  setFeedbackAnswer: (key, val) => {
    set((state) => ({
      feedbackAnswers: { ...state.feedbackAnswers, [key]: val },
    }));
  },

  devSimulatePermissionDenied: false,
  devRedFlagTriggered: false,
  setDevSimulatePermissionDenied: (val) => set({ devSimulatePermissionDenied: val }),
  triggerDevRedFlag: () => set({ devRedFlagTriggered: true }),
  clearDevRedFlag: () => set({ devRedFlagTriggered: false }),

  setNetworkQuality: (net) => {
    set({ networkQuality: net });
    if (net === 'offline' && get().callState === 'inCall') {
      get().triggerCallDrop();
    }
  },

  triggerCallDrop: () => {
    set({ callState: 'reconnecting', networkQuality: 'offline', reconnectTimeSeconds: 60 });
    get().logEvent({
      eventType: 'dropped',
      triggeredBy: 'automatic',
      modeAfter: get().callMode,
    });
  },

  forceDoctorJoinsNow: () => {
    set({
      callState: 'matched',
      activeDoctor: mockDoctors[0],
      queuePosition: 1,
      queueWaitSeconds: 0,
      networkQuality: 'good',
    });
  },

  forceLongQueue: () => {
    set({
      queuePosition: 9,
      queueWaitSeconds: 840,
      isLongWaitTriggered: true,
    });
  },

  resetAllState: () => {
    set({
      callState: 'idle',
      callMode: 'video',
      networkQuality: 'good',
      isRecordingOn: true,
      currentConsultationId: `VC-000${Math.floor(100 + Math.random() * 900)}`,
      callDurationSeconds: 0,
      isPatientMuted: false,
      isPatientCameraOff: false,
      isPatientVideoPaused: false,
      isDoctorMuted: false,
      isDoctorCameraOff: false,
      doctorBrandedBackgroundOn: true,
      doctorSharedItem: null,
      queuePosition: 3,
      queueWaitSeconds: 360,
      isPriorityConnect: false,
      isLongWaitTriggered: false,
      devRedFlagTriggered: false,
      eventLogs: [],
      feedbackAnswers: {},
    });
  },

  setCallState: (st) => set({ callState: st }),

  setCallMode: (mode, triggeredBy = 'patient') => {
    set({ callMode: mode });
    get().logEvent({
      eventType: mode === 'audio' ? 'switched to audio' : 'switched to video',
      triggeredBy,
      modeAfter: mode,
    });
  },

  setIsRecordingOn: (on, triggeredBy = 'patient') => {
    set({ isRecordingOn: on });
    get().logEvent({
      eventType: on ? 'recording on' : 'recording off',
      triggeredBy,
      modeAfter: get().callMode,
    });
  },

  togglePatientMute: () => {
    set((state) => ({ isPatientMuted: !state.isPatientMuted }));
  },

  togglePatientCamera: () => {
    set((state) => {
      const next = !state.isPatientCameraOff;
      get().logEvent({
        eventType: next ? 'paused video' : 'resumed video',
        triggeredBy: 'patient',
        modeAfter: state.callMode,
      });
      return { isPatientCameraOff: next };
    });
  },

  pausePatientVideo: () => {
    set({ isPatientVideoPaused: true, patientPauseCountdown: 120 });
    get().logEvent({
      eventType: 'paused video',
      triggeredBy: 'patient',
      modeAfter: get().callMode,
    });
  },

  resumePatientVideo: () => {
    set({ isPatientVideoPaused: false });
    get().logEvent({
      eventType: 'resumed video',
      triggeredBy: 'patient',
      modeAfter: get().callMode,
    });
  },

  flipCamera: () => {
    set((state) => ({ facingMode: state.facingMode === 'front' ? 'back' : 'front' }));
  },

  sendReaction: (emoji) => {
    set({ activeReaction: emoji });
    get().logEvent({
      eventType: 'reaction sent',
      triggeredBy: 'patient',
      modeAfter: get().callMode,
      metadata: { emoji },
    });
    setTimeout(() => {
      set({ activeReaction: null });
    }, 3000);
  },

  toggleDoctorMute: () => {
    set((state) => ({ isDoctorMuted: !state.isDoctorMuted }));
  },

  toggleDoctorCamera: () => {
    set((state) => ({ isDoctorCameraOff: !state.isDoctorCameraOff }));
  },

  setDoctorBrandedBackground: (on) => {
    set({ doctorBrandedBackgroundOn: on });
  },

  setDoctorSharedItem: (item) => {
    set({ doctorSharedItem: item });
    if (item) {
      get().logEvent({
        eventType: 'doctor shared content',
        triggeredBy: 'doctor',
        modeAfter: get().callMode,
        metadata: item,
      });
    }
  },

  endCall: (triggeredBy = 'patient') => {
    set({ callState: 'ended' });
    get().logEvent({
      eventType: 'call ended',
      triggeredBy,
      modeAfter: 'none',
    });
  },

  startLiveCallProcess: (isPriority = false) => {
    set({
      isPriorityConnect: isPriority,
      callState: isPriority ? 'matched' : 'queued',
      currentConsultationId: `VC-000${Math.floor(100 + Math.random() * 900)}`,
      callDurationSeconds: 0,
      activeDoctor: mockDoctors[0],
    });
  },

  incrementCallDuration: () => {
    set((state) => ({ callDurationSeconds: state.callDurationSeconds + 1 }));
  },
}));

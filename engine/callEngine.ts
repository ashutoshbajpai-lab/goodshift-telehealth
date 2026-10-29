import { useConsultationStore, CallState, NetworkQuality } from '../store/consultationStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConsultationRecord } from '../mock/consultations';

export const RECONNECT_WINDOW_SECS = 60;
export const LONG_WAIT_THRESHOLD_SECS = 480; // 8 minutes
export const TRANSCRIPTION_PROVIDER_NAME = 'Fireflies';

export interface TranscriptionProvider {
  name: string;
  upload(audioUrl: string): Promise<{ taskId: string }>;
  onComplete(callback: (transcript: string, summary: string) => void): void;
}

export class MockFirefliesProvider implements TranscriptionProvider {
  name = TRANSCRIPTION_PROVIDER_NAME;

  async upload(audioUrl: string): Promise<{ taskId: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ taskId: `ff-task-${Date.now()}` });
      }, 1500);
    });
  }

  onComplete(callback: (transcript: string, summary: string) => void) {
    setTimeout(() => {
      const mockTranscript = `
Doctor: Hello Priya, good to see you today. How is the GLP-1 dose treating you this past week?
Patient: Hello Doctor, weight is down 6kg overall, but I had mild nausea for two days after the Tuesday injection.
Doctor: That's quite typical during dose step 2. Are you taking enough fluids in the morning?
Patient: I struggle to reach 2 litres.
Doctor: Let's increase to 3 litres with electrolyte sachets, and divide breakfast into smaller portions.
Patient: Understood Doctor, thank you.
      `.trim();

      const mockSummary =
        'Patient Priya Sharma reviewed at week 12 of Semaglutide therapy. Steady weight progress noted with cumulative 6 kg reduction. Discussed mild post-dose nausea linked to low hydration (1.8 L). Recommended increasing hydration to 3.0 L with morning electrolytes, maintaining current 0.5 mg dose, and scheduling repeat lipid panel in 4 weeks.';

      callback(mockTranscript, mockSummary);
    }, 4500);
  }
}

class CallEngineController {
  private timer: any = null;
  private queueTimer: any = null;
  private reconnectTimer: any = null;
  private provider: TranscriptionProvider = new MockFirefliesProvider();

  public init() {
    // Run interval for inCall durations and reconnect logic
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      const store = useConsultationStore.getState();

      if (store.callState === 'inCall') {
        store.incrementCallDuration();

        // Handle paused video countdown
        if (store.isPatientVideoPaused && store.patientPauseCountdown > 0) {
          useConsultationStore.setState({
            patientPauseCountdown: store.patientPauseCountdown - 1,
          });
          if (store.patientPauseCountdown <= 1) {
            store.resumePatientVideo();
          }
        }
      }

      if (store.callState === 'queued') {
        if (store.queueWaitSeconds > 0) {
          const nextSec = store.queueWaitSeconds - 1;
          const nextPos = Math.max(1, Math.ceil(nextSec / 120));
          useConsultationStore.setState({
            queueWaitSeconds: nextSec,
            queuePosition: nextPos,
            isLongWaitTriggered: nextSec >= LONG_WAIT_THRESHOLD_SECS,
          });

          // Match when time drops to near 0
          if (nextSec <= 3) {
            this.transitionToMatched();
          }
        }
      }

      if (store.callState === 'reconnecting') {
        if (store.reconnectTimeSeconds > 0) {
          const nextSec = store.reconnectTimeSeconds - 1;
          useConsultationStore.setState({ reconnectTimeSeconds: nextSec });

          // Auto-reconnect retry every 3s
          if (nextSec % 3 === 0 && nextSec < 55) {
            // Reconnect succeeds on good or fair network, or simulated recovery
            this.attemptAutoReconnect();
          }
        }
      }
    }, 1000);
  }

  public transitionToMatched() {
    const store = useConsultationStore.getState();
    store.setCallState('matched');
    setTimeout(() => {
      store.setCallState('connecting');
      setTimeout(() => {
        store.setCallState('inCall');
        store.logEvent({
          eventType: 'call started',
          triggeredBy: 'automatic',
          modeAfter: store.callMode,
        });
      }, 2000);
    }, 2500);
  }

  public attemptAutoReconnect() {
    const store = useConsultationStore.getState();
    // Reconnects with same doctor and same consultation ID
    store.setCallState('inCall');
    store.setNetworkQuality('good');
    store.logEvent({
      eventType: 'reconnected',
      triggeredBy: 'automatic',
      modeAfter: store.callMode,
    });
  }

  public triggerDoctorCallBack() {
    const store = useConsultationStore.getState();
    store.setCallState('inCall');
    store.setNetworkQuality('good');
    store.logEvent({
      eventType: 'reconnected',
      triggeredBy: 'doctor',
      modeAfter: store.callMode,
    });
  }

  public async runPostCallPipeline(onNotification?: (title: string, body: string) => void) {
    const store = useConsultationStore.getState();
    const doc = store.activeDoctor;
    const cid = store.currentConsultationId;

    if (!store.isRecordingOn) {
      // Build summary directly from doctor's notes and key pointers without Fireflies
      const record: ConsultationRecord = {
        id: cid,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        doctorId: doc?.id || 'doc-1',
        doctorName: doc?.name || 'Dr. Ananya Sen',
        doctorQualification: doc?.qualification || 'MBBS, MD',
        doctorRegNumber: doc?.registrationNumber || 'MMC 2017/08/3412',
        doctorAvatar: doc?.avatar || '',
        reason: store.selectedReasons.join(', ') || 'GLP-1 Progress Review',
        status: 'Completed',
        mode: store.callMode,
        durationMinutes: Math.max(1, Math.round(store.callDurationSeconds / 60)),
        summary: `Doctor's Notes: ${store.soapNotes.assessment} ${store.soapNotes.plan}\n\nNote: Recording was disabled during this visit. This summary is compiled from your physician's clinical notes.`,
        keyPointers: store.keyPointersList,
        prescription: store.prescriptionList,
        labTestsOrdered: ['Fasting Glucose & HbA1c', 'Repeat Lipid Panel'],
        nextFollowUpDate: 'In 4 weeks',
        recordingWasOn: false,
        followUpWindowDaysRemaining: 7,
      };

      const updatedHistory = [record, ...store.consultationHistory];
      useConsultationStore.setState({ consultationHistory: updatedHistory });
      await AsyncStorage.setItem('@elevate_history_v1', JSON.stringify(updatedHistory));

      if (onNotification) {
        onNotification('Summary Ready', 'Your consultation summary is ready.');
      }
      return;
    }

    // Recording was ON -> Run mock Fireflies pipeline
    await this.provider.upload('mock-audio-recording.m4a');

    this.provider.onComplete(async (_transcript, generatedSummary) => {
      const record: ConsultationRecord = {
        id: cid,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        doctorId: doc?.id || 'doc-1',
        doctorName: doc?.name || 'Dr. Ananya Sen',
        doctorQualification: doc?.qualification || 'MBBS, MD',
        doctorRegNumber: doc?.registrationNumber || 'MMC 2017/08/3412',
        doctorAvatar: doc?.avatar || '',
        reason: store.selectedReasons.join(', ') || 'GLP-1 Progress Review',
        status: 'Completed',
        mode: store.callMode,
        durationMinutes: Math.max(1, Math.round(store.callDurationSeconds / 60)),
        summary: generatedSummary,
        keyPointers: store.keyPointersList,
        prescription: store.prescriptionList,
        labTestsOrdered: ['Fasting Glucose & HbA1c', 'Repeat Lipid Panel'],
        nextFollowUpDate: 'In 4 weeks',
        recordingWasOn: true,
        followUpWindowDaysRemaining: 7,
      };

      const updatedHistory = [record, ...useConsultationStore.getState().consultationHistory];
      useConsultationStore.setState({ consultationHistory: updatedHistory });
      await AsyncStorage.setItem('@elevate_history_v1', JSON.stringify(updatedHistory));

      if (onNotification) {
        onNotification('Summary Ready', 'Your consultation summary is ready.');
      }
    });
  }

  public destroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.queueTimer) clearInterval(this.queueTimer);
    if (this.reconnectTimer) clearInterval(this.reconnectTimer);
  }
}

export const callEngine = new CallEngineController();
callEngine.init();

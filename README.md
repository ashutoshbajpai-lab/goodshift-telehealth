# Elevate GLP-1 Video Consultation App Prototype

Clickable, end-to-end working prototype of an in-app telehealth video consultation product designed for an evidence-based GLP-1 medical weight management programme in India.

The codebase incorporates **two applications in one**:
1. **Patient App** (Phone portrait-first with landscape report viewer support)
2. **Doctor App** (Tablet landscape-first clinical workspace with live bi-directional sync)

Built with **Expo (React Native SDK 58)**, **Expo Router**, **TypeScript**, and **Zustand**.

---

## 1. Quick Start Guide

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$
- Expo Go app on iOS or Android (optional, for real mobile hardware testing)

### Installation & Launch
```bash
cd /Users/ashutoshbajpai/.gemini/antigravity/scratch/video-consultation-app

# Start the Expo development server
npm start
```

### Running on Targets
- **Web Preview:** Press `w` in the terminal (or run `npx expo start --web`).
- **Android Device / Emulator:** Press `a` in the terminal (or scan the terminal QR code in Expo Go).
- **iOS Device / Simulator:** Press `i` in the terminal (or scan the QR code with iOS Camera).

---

## 2. Role Switcher (`Patient | Doctor`)

At the top of every screen, a global switcher bar is pinned:
- Tap **Patient**: Launches the 11-screen patient journey (Home $\rightarrow$ Check $\rightarrow$ Consent $\rightarrow$ Schedule/Queue $\rightarrow$ In-Call $\rightarrow$ Feedback $\rightarrow$ Summary $\rightarrow$ History).
- Tap **Doctor**: Opens the physician station (Triage Queue with pinned scheduled patients $\rightarrow$ 60/40 Split Clinical Workspace with live sync).

Both applications read and write to the same unified **Zustand Store** (`store/consultationStore.ts`). Any patient action (muting, pausing video, uploading a lab report, sending a reaction, or dropping offline) is reflected in the doctor's view within 1 second.

---

## 3. Developer Testing Panel

To test edge states without waiting for real network drops or queue count-downs:
1. **Long-press the App Logo** (`Elevate GLP-1`) on any screen, or tap the **Wrench Icon** (`🔧`) in the top switcher bar.
2. The modal lets you force states on demand:
   - **Network Quality Simulation:** `Good`, `Fair`, `Weak` (triggers audio fallback suggestions), `Offline` (triggers call drop and auto-reconnect).
   - **Force Call Drop:** Simulates a sudden disconnection, initiates the 60-second reconnect window, auto-retries every 3 seconds, and reconnects to the same physician without returning to the queue.
   - **Doctor Joins Now:** Bypasses waiting room count-down straight to active call.
   - **Trigger Long Queue Offer:** Forces wait time over threshold to display the *"Book a slot instead"* banner.
   - **Simulate Camera Permission Denied:** Shows failure state and instructions to enable in device settings.
   - **Recording & Transcription Toggle:** Toggles recording off to test fallback summary compilation directly from physician notes.
   - **Trigger Red-Flag Answer:** Launches the Emergency Guidance triage screen (`emergency.tsx`) with 112 emergency calling instructions.
   - **Call Event Log:** Inspects live event stream (`consultationId`, `eventType`, `triggeredBy`, `networkQuality`, `modeAfter`) and computes statistics (switches count, video minutes, audio minutes, drops, average reconnect time).

---

## 4. Visual Design System Compliance

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#FFFFFF` | Background for every screen |
| `surfaceTint` | `#FFF0D9` | Very light cards, selected rows, info boxes, queue backdrops |
| `accentSoft` | `#FFCC80` | Progress bar track, chips, light highlights, graph goal band |
| `accent` | `#FF9F68` | Primary buttons, top bars, active tabs, graph line |
| `accentStrong` | `#FF6F59` | End visit button, alerts, recording dot, "New" badges |
| `ink` | `#37474F` | All body copy, headings, icons, button text |
| `inkSecondary` | `#5B6A72` | Secondary text, captions, timestamps |
| `line` | `#ECEFF1` | Dividers and card borders |
| `success` | `#2E7D32` | Device check ticks and verification badges |

### Strict Contrast Rules
- **Never white text on orange:** All primary button labels on `#FF9F68` use `ink` (`#37474F`), ensuring an accessible contrast ratio of **4.8:1**.
- Text on `#FFF0D9` uses `ink` (`#37474F`) for an **8.6:1** contrast ratio.

---

## 5. Screen Directory & User Flow

### Patient Journey
- `app/(patient)/index.tsx`: **Screen 1 — Home Entry** (Greeting, Consult now, Scheduled call card with 10-min join window, Free follow-up card, Progress metrics, History shortcut).
- `app/(patient)/check.tsx`: **Screen 2 — Device & Network Check** (Real camera preview, mic meter, speaker tone test, network quality, multi-language chips, red-flag check bottom sheet).
- `app/(patient)/emergency.tsx`: **Emergency Guidance Screen** (Immediate care instructions and 112 dial trigger).
- `app/(patient)/consent.tsx`: **Screen 3 — Data Sharing Consent** (DPDP compliant, collapsed card with 12 items, 5 locked mandatory items with explanation modals, 7 customizable optional items, default-on recording toggle).
- `app/(patient)/schedule.tsx`: **Screen 4 — Schedule a Slot** (Horizontal 7-day strip, time slots filtered to language-matched doctors, confirmation sheet, reminder note, calendar sync).
- `app/(patient)/queue.tsx`: **Screen 5 — Waiting Room** (Live position count-down, 8-second auto-advancing brand carousel, recording notice box in `surfaceTint`, document upload before visit, long wait offer, leave queue confirmation).
- `app/(patient)/matched.tsx`: **Screen 6 — Doctor Matched** (Spring card animation, registration details, priority connect tag for scheduled patients, 2.5s encrypted connect).
- `app/(patient)/call.tsx`: **Screen 7 — Patient In-Call** (Doctor video over 20% watermark background, draggable self-view thumbnail, mute, camera toggle, 2-minute video pause with countdown, 1-tap audio/video switch, chat sheet, document upload, floating emoji reactions, more menu, auto-reconnect banner, rotate-to-landscape prompt).
- `app/(patient)/feedback.tsx`: **Screen 8 — Feedback Questionnaire** (8 questions, 1 to 5 stars, 0 to 10 NPS scale, care team follow-up rule for ratings $\le 2$ or unresolved concerns).
- `app/(patient)/summary.tsx`: **Screen 9 — Consultation Summary** (AI transcription synthesis state, conversation summary, 3-5 plain-language doctor pointers, digital prescription with download & order buttons, lab test orders, next follow-up window).
- `app/(patient)/history.tsx`: **Screen 10 — Consultation History** (Searchable past records, filter chips, full SOAP notes and prescription views).

### Doctor Journey
- `app/(doctor)/index.tsx`: **Doctor Queue** (Duty statistics, scheduled patients pinned with priority chip, live queue stream, start visit button).
- `app/(doctor)/call.tsx`: **Doctor In-Call Workspace** (Landscape 40/60 split screen: Left side video, doctor self-view, live patient state indicators, clinical snapshot strip; Right side with 9 clinical tabs: Metrics, Graphs, History, Real-time Documents with "New" badge, SOAP Notes with autosave, e-Prescription with dose change reason, Key Pointers, Summary Preview, and Live Chat).

---

## 6. Architecture & Mock Simulation
- **Simulated Call Engine (`engine/callEngine.ts`):** Implements an automated state machine (`idle` $\rightarrow$ `checking` $\rightarrow$ `queued` $\rightarrow$ `matched` $\rightarrow$ `connecting` $\rightarrow$ `inCall` $\rightarrow$ `reconnecting` $\rightarrow$ `ended`). Handles queue count-down, auto-reconnect window ($60\text{s}$), and post-call AI transcription pipeline.
- **Pluggable Transcription Provider:** `TranscriptionProvider` interface simulating `Fireflies` AI with transcript and summary generation delays.
- **Persistence:** `@react-native-async-storage/async-storage` preserves scheduled bookings and consultation history across app refreshes.

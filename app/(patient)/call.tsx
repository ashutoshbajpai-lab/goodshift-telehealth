import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  useWindowDimensions,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';
import { useConsultationStore, CallMode } from '../../store/consultationStore';
import { mockDoctors } from '../../mock/doctors';
import {
  BrandedDoctorBackground,
  StatusDot,
  BottomSheet,
  Button,
  Toast,
} from '../../components';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Pause,
  Play,
  RotateCw,
  MessageSquare,
  Upload,
  Heart,
  ThumbsUp,
  Hand,
  Sparkles,
  PhoneOff,
  MoreVertical,
  Volume2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  Send,
  ExternalLink,
  ChevronUp,
} from 'lucide-react-native';

export default function PatientInCallScreen() {
  const router = useRouter();
  const store = useConsultationStore();
  const [permission] = useCameraPermissions();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const doctor = store.activeDoctor || mockDoctors[0];

  // Self-view corner position: 0=top-right, 1=top-left, 2=bottom-left, 3=bottom-right
  const [selfViewCorner, setSelfViewCorner] = useState(0);

  // Sheets and menus
  const [chatOpen, setChatOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [endCallSheetOpen, setEndCallSheetOpen] = useState(false);
  const [sharedDocExpanded, setSharedDocExpanded] = useState(false);
  const [rotatePromptVisible, setRotatePromptVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chat input
  const [inputText, setInputText] = useState('');

  // Floating reaction animation
  const reactionAnimY = useRef(new Animated.Value(0)).current;
  const reactionOpacity = useRef(new Animated.Value(0)).current;

  // Audio wave pulse animation for audio mode
  const waveAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Audio wave loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0.95, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Trigger floating reaction animation when activeReaction changes
  useEffect(() => {
    if (store.activeReaction) {
      reactionAnimY.setValue(0);
      reactionOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(reactionAnimY, {
          toValue: -140,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(reactionOpacity, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [store.activeReaction]);

  // When call state transitions to 'ended', navigate to feedback questionnaire
  useEffect(() => {
    if (store.callState === 'ended') {
      router.replace('/(patient)/feedback');
    }
  }, [store.callState]);

  const handleEndCallConfirm = () => {
    setEndCallSheetOpen(false);
    store.endCall('patient');
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    store.addChatMessage({
      sender: 'patient',
      text: inputText.trim(),
    });
    setInputText('');
  };

  const handleSimulateDocumentUpload = () => {
    const uploadOptions = [
      { title: 'Morning Fasting Glucose Log.jpg', type: 'photo' as const },
      { title: 'HbA1c Lab Report (PDF).pdf', type: 'lab' as const },
      { title: 'Prescription Refill Request.pdf', type: 'prescription' as const },
    ];
    const picked = uploadOptions[Math.floor(Math.random() * uploadOptions.length)];
    store.addUploadedDoc({
      title: picked.title,
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&q=80',
      type: picked.type,
    });
    setToastMessage('Document sent to doctor');
  };

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getSelfViewPositionStyle = () => {
    switch (selfViewCorner) {
      case 1: // top-left
        return { top: 70, left: 16 };
      case 2: // bottom-left
        return { bottom: 120, left: 16 };
      case 3: // bottom-right
        return { bottom: 120, right: 16 };
      case 0: // top-right
      default:
        return { top: 70, right: 16 };
    }
  };

  const cycleCorner = () => {
    setSelfViewCorner((prev) => (prev + 1) % 4);
  };

  return (
    <View style={styles.container}>
      {/* Landscape Split or Portrait Full Layout */}
      <View style={[styles.mainArea, isLandscape && styles.landscapeRow]}>
        {/* Doctor Video Area */}
        <View style={[styles.videoContainer, isLandscape && styles.landscapeVideo]}>
          {/* Branded Doctor Background (Watermark with 20% opacity) */}
          <BrandedDoctorBackground showBranding={store.doctorBrandedBackgroundOn}>
            {store.callMode === 'video' && !store.isDoctorCameraOff ? (
              <Image
                source={{ uri: doctor.avatar }}
                style={styles.doctorVideoFeed}
                resizeMode="cover"
              />
            ) : (
              /* Doctor Avatar in Audio or Camera Off Mode */
              <View style={styles.audioModeContainer}>
                <Animated.View
                  style={[
                    styles.doctorWaveRing,
                    { transform: [{ scale: waveAnim }] },
                  ]}
                />
                <Image
                  source={{ uri: doctor.avatar }}
                  style={styles.doctorAudioAvatar}
                />
                <Text style={[typography.h2, styles.audioModeDoctorName]}>
                  {doctor.name}
                </Text>
                <Text style={[typography.small, styles.audioModeNotice]}>
                  {store.callMode === 'audio'
                    ? 'Audio-Only Consultation Mode'
                    : 'Doctor camera is temporarily off'}
                </Text>
              </View>
            )}
          </BrandedDoctorBackground>

          {/* Top Status Bar: Network Dot, Recording Indicator, Timer */}
          <View style={styles.topCallBar}>
            <View style={styles.topBarLeft}>
              <StatusDot
                status={store.networkQuality}
                size={10}
                label={store.networkQuality.toUpperCase()}
              />
              {store.isRecordingOn && (
                <View style={styles.recBadge}>
                  <View style={styles.recDot} />
                  <Text style={styles.recText}>Recording</Text>
                </View>
              )}
            </View>

            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>
                {formatCallTime(store.callDurationSeconds)}
              </Text>
            </View>
          </View>

          {/* Doctor Info Strip (Bottom Left of Video) */}
          <View style={styles.doctorInfoStrip}>
            <Text style={[typography.bodyBold, styles.doctorStripName]}>
              {doctor.name}
            </Text>
            <Text style={[typography.caption, styles.doctorStripQual]}>
              {doctor.qualification} • {doctor.registrationNumber}
            </Text>
          </View>

          {/* Floating Self-View Thumbnail (Tap to cycle corner) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={cycleCorner}
            style={[styles.selfViewWrapper, getSelfViewPositionStyle()]}
            accessibilityLabel="Self view camera - tap to move corner"
          >
            {store.isPatientCameraOff ? (
              <View style={styles.selfCameraOff}>
                <Text style={styles.selfInitials}>PS</Text>
                <Text style={styles.selfOffLabel}>Camera Off</Text>
              </View>
            ) : store.isPatientVideoPaused ? (
              <View style={styles.selfPaused}>
                <Pause size={18} color={colors.ink} />
                <Text style={styles.pauseCountdownText}>
                  {store.patientPauseCountdown}s
                </Text>
                <Text style={styles.pausedLabel}>Paused</Text>
              </View>
            ) : (
              <View style={styles.selfCameraContainer}>
                {Platform.OS !== 'web' && permission?.granted && !store.devSimulatePermissionDenied ? (
                  <CameraView
                    style={styles.selfCamera}
                    facing={store.facingMode}
                  />
                ) : (
                  <Image
                    source={{
                      uri: store.facingMode === 'front'
                        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&q=80'
                        : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=240&q=80',
                    }}
                    style={styles.selfCamera}
                    resizeMode="cover"
                  />
                )}
                <TouchableOpacity
                  onPress={() => store.flipCamera()}
                  style={styles.selfFlipIcon}
                  accessibilityLabel="Flip camera"
                >
                  <RotateCw size={12} color={colors.ink} />
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>

          {/* Floating Reaction Overlay */}
          {store.activeReaction && (
            <Animated.View
              style={[
                styles.floatingReaction,
                {
                  opacity: reactionOpacity,
                  transform: [{ translateY: reactionAnimY }],
                },
              ]}
            >
              <Text style={styles.reactionEmoji}>{store.activeReaction}</Text>
            </Animated.View>
          )}

          {/* Dismissible Rotate Prompt in Portrait */}
          {!isLandscape && rotatePromptVisible && (
            <View style={styles.rotatePromptBox}>
              <RotateCcw size={16} color={colors.ink} />
              <Text style={[typography.caption, styles.rotatePromptText]}>
                Turn phone sideways for bigger workspace
              </Text>
              <TouchableOpacity
                onPress={() => setRotatePromptVisible(false)}
                style={styles.rotateCloseBtn}
              >
                <X size={14} color={colors.inkSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Network Banners */}
          {store.networkQuality === 'weak' && store.callMode === 'video' && (
            <View style={styles.networkAlertBanner}>
              <AlertTriangle size={16} color={colors.ink} />
              <Text style={[typography.caption, styles.networkAlertText]}>
                Weak network. Switch to audio?
              </Text>
              <TouchableOpacity
                onPress={() => store.setCallMode('audio', 'patient')}
                style={styles.bannerActionBtn}
              >
                <Text style={styles.bannerActionText}>Switch</Text>
              </TouchableOpacity>
            </View>
          )}

          {store.networkQuality === 'good' && store.callMode === 'audio' && (
            <View style={[styles.networkAlertBanner, styles.goodNetworkBanner]}>
              <CheckCircle2 size={16} color={colors.success} />
              <Text style={[typography.caption, styles.networkAlertText]}>
                Network is better. Switch back to video?
              </Text>
              <TouchableOpacity
                onPress={() => store.setCallMode('video', 'patient')}
                style={styles.bannerActionBtn}
              >
                <Text style={styles.bannerActionText}>Video</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Auto-reconnect full-width banner */}
          {store.callState === 'reconnecting' && (
            <View style={styles.reconnectingOverlay}>
              <Animated.View style={styles.reconnectCard}>
                <RotateCw size={24} color={colors.accentStrong} />
                <Text style={[typography.h2, styles.reconnectTitle]}>
                  Reconnecting...
                </Text>
                <Text style={[typography.small, styles.reconnectSubtitle]}>
                  Holding your visit with {doctor.name} ({store.reconnectTimeSeconds}s remaining).
                </Text>
              </Animated.View>
            </View>
          )}

          {/* Shared by Doctor Interactive Card */}
          {store.doctorSharedItem && (
            <View style={styles.sharedDoctorContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSharedDocExpanded(!sharedDocExpanded)}
                style={styles.sharedDoctorBar}
              >
                <View style={styles.sharedDoctorLeft}>
                  <Sparkles size={16} color={colors.ink} />
                  <Text style={[typography.smallBold, styles.sharedDoctorTitle]}>
                    Doctor shared: {store.doctorSharedItem.title}
                  </Text>
                </View>
                <ChevronUp
                  size={18}
                  color={colors.ink}
                  style={sharedDocExpanded ? { transform: [{ rotate: '180deg' }] } : undefined}
                />
              </TouchableOpacity>

              {sharedDocExpanded && (
                <View style={styles.sharedDoctorExpanded}>
                  <Text style={[typography.body, styles.sharedDoctorBody]}>
                    {store.doctorSharedItem.details}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* In Landscape: Side Workspace (Chat & Documents Panel) */}
        {isLandscape && (
          <View style={styles.landscapeSidePanel}>
            <View style={styles.sideHeader}>
              <Text style={[typography.h2, styles.sideHeaderTitle]}>
                Call Chat & Reports
              </Text>
            </View>
            <ScrollView style={styles.sideChatScroll}>
              {store.chatMessages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.chatBubble,
                    m.sender === 'patient' ? styles.bubblePatient : styles.bubbleDoctor,
                  ]}
                >
                  <Text style={[typography.caption, styles.bubbleSender]}>
                    {m.sender === 'patient' ? 'You' : doctor.name}
                  </Text>
                  <Text style={[typography.body, styles.bubbleText]}>{m.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.sideInputRow}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                style={styles.sideTextInput}
              />
              <TouchableOpacity onPress={handleSendMessage} style={styles.sideSendBtn}>
                <Send size={16} color={colors.ink} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Floating Control Bar */}
      <View style={styles.controlBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.controlBarContent}
        >
          {/* Mute Button */}
          <TouchableOpacity
            onPress={() => store.togglePatientMute()}
            style={[styles.controlBtn, store.isPatientMuted && styles.controlBtnActive]}
            accessibilityRole="button"
            accessibilityLabel={store.isPatientMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {store.isPatientMuted ? (
              <MicOff size={22} color={colors.accentStrong} />
            ) : (
              <Mic size={22} color={colors.ink} />
            )}
            <Text style={[typography.caption, styles.controlBtnLabel]}>
              {store.isPatientMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          {/* Video Toggle */}
          <TouchableOpacity
            onPress={() => store.togglePatientCamera()}
            style={[styles.controlBtn, store.isPatientCameraOff && styles.controlBtnActive]}
            accessibilityRole="button"
            accessibilityLabel={store.isPatientCameraOff ? 'Turn video on' : 'Turn video off'}
          >
            {store.isPatientCameraOff ? (
              <VideoOff size={22} color={colors.accentStrong} />
            ) : (
              <VideoIcon size={22} color={colors.ink} />
            )}
            <Text style={[typography.caption, styles.controlBtnLabel]}>
              {store.isPatientCameraOff ? 'Video On' : 'Video Off'}
            </Text>
          </TouchableOpacity>

          {/* Pause Video Toggle (Countdown up to 2m) */}
          <TouchableOpacity
            onPress={() =>
              store.isPatientVideoPaused
                ? store.resumePatientVideo()
                : store.pausePatientVideo()
            }
            style={[styles.controlBtn, store.isPatientVideoPaused && styles.controlBtnActive]}
            accessibilityRole="button"
            accessibilityLabel={store.isPatientVideoPaused ? 'Resume video' : 'Pause video'}
          >
            {store.isPatientVideoPaused ? (
              <Play size={22} color={colors.accent} />
            ) : (
              <Pause size={22} color={colors.ink} />
            )}
            <Text style={[typography.caption, styles.controlBtnLabel]}>
              {store.isPatientVideoPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>

          {/* Switch to Audio / Video */}
          <TouchableOpacity
            onPress={() =>
              store.setCallMode(store.callMode === 'video' ? 'audio' : 'video', 'patient')
            }
            style={[styles.controlBtn, store.callMode === 'audio' && styles.controlBtnActive]}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${store.callMode === 'video' ? 'audio only' : 'video'}`}
          >
            <Volume2 size={22} color={colors.ink} />
            <Text style={[typography.caption, styles.controlBtnLabel]}>
              {store.callMode === 'video' ? 'Audio Only' : 'Video Mode'}
            </Text>
          </TouchableOpacity>

          {/* Chat Sheet Trigger */}
          <TouchableOpacity
            onPress={() => setChatOpen(true)}
            style={styles.controlBtn}
            accessibilityRole="button"
            accessibilityLabel="Open consultation chat"
          >
            <MessageSquare size={22} color={colors.ink} />
            <Text style={[typography.caption, styles.controlBtnLabel]}>Chat</Text>
          </TouchableOpacity>

          {/* Document Upload Trigger */}
          <TouchableOpacity
            onPress={handleSimulateDocumentUpload}
            style={styles.controlBtn}
            accessibilityRole="button"
            accessibilityLabel="Upload report to doctor"
          >
            <Upload size={22} color={colors.ink} />
            <Text style={[typography.caption, styles.controlBtnLabel]}>Upload</Text>
          </TouchableOpacity>

          {/* Reactions Trigger (Thumbs Up, Heart, Hand, Clap) */}
          <TouchableOpacity
            onPress={() => store.sendReaction('👍')}
            style={styles.controlBtn}
            accessibilityRole="button"
            accessibilityLabel="Send thumbs up reaction"
          >
            <ThumbsUp size={22} color={colors.ink} />
            <Text style={[typography.caption, styles.controlBtnLabel]}>React</Text>
          </TouchableOpacity>

          {/* More Menu */}
          <TouchableOpacity
            onPress={() => setMoreMenuOpen(true)}
            style={styles.controlBtn}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <MoreVertical size={22} color={colors.ink} />
            <Text style={[typography.caption, styles.controlBtnLabel]}>More</Text>
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            onPress={() => setEndCallSheetOpen(true)}
            style={[styles.controlBtn, styles.endCallBtn]}
            accessibilityRole="button"
            accessibilityLabel="End consultation visit"
          >
            <PhoneOff size={22} color={colors.ink} />
            <Text style={[typography.caption, styles.endCallText]}>End</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Chat Bottom Sheet */}
      <BottomSheet
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Consultation Chat"
        subtitle={`Live secure conversation with ${doctor.name}`}
      >
        <View style={styles.sheetChatContainer}>
          <ScrollView style={styles.sheetChatScroll}>
            {store.chatMessages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.chatBubble,
                  m.sender === 'patient' ? styles.bubblePatient : styles.bubbleDoctor,
                ]}
              >
                <Text style={[typography.caption, styles.bubbleSender]}>
                  {m.sender === 'patient' ? 'You' : doctor.name} • {m.timestamp}
                </Text>
                <Text style={[typography.body, styles.bubbleText]}>{m.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.sheetChatInputRow}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask your doctor a question..."
              style={styles.sheetChatInput}
            />
            <TouchableOpacity onPress={handleSendMessage} style={styles.sheetSendBtn}>
              <Send size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>

      {/* More Options Bottom Sheet */}
      <BottomSheet
        visible={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
        title="More In-Call Settings"
      >
        <View style={styles.moreMenuContent}>
          <TouchableOpacity
            onPress={() => {
              store.flipCamera();
              setMoreMenuOpen(false);
            }}
            style={styles.moreItem}
          >
            <RotateCw size={20} color={colors.ink} />
            <Text style={[typography.bodyBold, styles.moreItemText]}>
              Flip Camera ({store.facingMode === 'front' ? 'Switch to Back' : 'Switch to Front'})
            </Text>
          </TouchableOpacity>

          <View style={styles.moreToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyBold, styles.moreItemText]}>
                Recording & Scribe
              </Text>
              <Text style={[typography.caption, { color: colors.inkSecondary }]}>
                {store.isRecordingOn ? 'Active (Summary generating)' : 'Disabled'}
              </Text>
            </View>
            <Button
              title={store.isRecordingOn ? 'Turn Off' : 'Turn On'}
              variant="surface"
              size="small"
              onPress={() => store.setIsRecordingOn(!store.isRecordingOn, 'patient')}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              setMoreMenuOpen(false);
              setToastMessage('Live automated Hindi/English subtitles enabled');
            }}
            style={styles.moreItem}
          >
            <ExternalLink size={20} color={colors.ink} />
            <Text style={[typography.bodyBold, styles.moreItemText]}>
              Enable Live Captions (Beta)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMoreMenuOpen(false);
              setToastMessage('Problem reported to technical operations team');
            }}
            style={styles.moreItem}
          >
            <AlertTriangle size={20} color={colors.accentStrong} />
            <Text style={[typography.bodyBold, styles.moreItemText]}>
              Report Audio/Video Quality Issue
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* End Call Confirmation Sheet */}
      <BottomSheet
        visible={endCallSheetOpen}
        onClose={() => setEndCallSheetOpen(false)}
        title="End Consultation?"
        subtitle="Are you sure you want to end your telehealth visit with the doctor?"
      >
        <View style={styles.endSheetContent}>
          <Button
            title="Yes, End Visit"
            onPress={handleEndCallConfirm}
            variant="danger"
            size="large"
            style={styles.endConfirmBtn}
          />
          <Button
            title="Return to Consultation"
            onPress={() => setEndCallSheetOpen(false)}
            variant="secondary"
            size="normal"
          />
        </View>
      </BottomSheet>

      {/* Toast */}
      <Toast
        visible={!!toastMessage}
        message={toastMessage || ''}
        onDismiss={() => setToastMessage(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mainArea: {
    flex: 1,
  },
  landscapeRow: {
    flexDirection: 'row',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  landscapeVideo: {
    width: '66%',
  },
  doctorVideoFeed: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  audioModeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorWaveRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accentSoft,
    opacity: 0.35,
  },
  doctorAudioAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.accent,
    marginBottom: 16,
  },
  audioModeDoctorName: {
    color: colors.ink,
  },
  audioModeNotice: {
    color: colors.inkSecondary,
    marginTop: 4,
  },
  topCallBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.chip,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentStrong,
    marginRight: 4,
  },
  recText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  timerBadge: {
    backgroundColor: 'rgba(55, 71, 79, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.chip,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  doctorInfoStrip: {
    position: 'absolute',
    bottom: 96,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  doctorStripName: {
    color: colors.ink,
  },
  doctorStripQual: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  selfViewWrapper: {
    position: 'absolute',
    width: 88,
    height: 120,
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.bg,
    zIndex: 20,
    ...shadows.soft,
  },
  selfCameraContainer: {
    flex: 1,
  },
  selfCamera: {
    width: '100%',
    height: '100%',
  },
  selfFlipIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.surfaceTint,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfCameraOff: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
  },
  selfOffLabel: {
    fontSize: 10,
    color: colors.inkSecondary,
    marginTop: 4,
  },
  selfPaused: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseCountdownText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentStrong,
    marginTop: 2,
  },
  pausedLabel: {
    fontSize: 10,
    color: colors.inkSecondary,
  },
  floatingReaction: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    zIndex: 50,
  },
  reactionEmoji: {
    fontSize: 54,
  },
  rotatePromptBox: {
    position: 'absolute',
    top: 64,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.chip,
    zIndex: 10,
  },
  rotatePromptText: {
    color: colors.ink,
    marginHorizontal: 8,
  },
  rotateCloseBtn: {
    padding: 2,
  },
  networkAlertBanner: {
    position: 'absolute',
    top: 64,
    left: 14,
    right: 14,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 25,
  },
  goodNetworkBanner: {
    borderColor: colors.success,
  },
  networkAlertText: {
    color: colors.ink,
    flex: 1,
    marginLeft: 8,
  },
  bannerActionBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.chip,
  },
  bannerActionText: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 12,
  },
  reconnectingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 24,
  },
  reconnectCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.card,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
  },
  reconnectTitle: {
    color: colors.ink,
    marginTop: 12,
  },
  reconnectSubtitle: {
    color: colors.inkSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  sharedDoctorContainer: {
    position: 'absolute',
    bottom: 90,
    left: 14,
    right: 14,
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.accent,
    overflow: 'hidden',
    zIndex: 30,
  },
  sharedDoctorBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  sharedDoctorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sharedDoctorTitle: {
    color: colors.ink,
    marginLeft: 8,
  },
  sharedDoctorExpanded: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.accentSoft,
    backgroundColor: colors.bg,
  },
  sharedDoctorBody: {
    color: colors.ink,
    lineHeight: 22,
  },
  landscapeSidePanel: {
    width: '34%',
    backgroundColor: colors.bg,
    borderLeftWidth: 1,
    borderLeftColor: colors.line,
  },
  sideHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sideHeaderTitle: {
    color: colors.ink,
  },
  sideChatScroll: {
    flex: 1,
    padding: 12,
  },
  sideInputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  sideTextInput: {
    flex: 1,
    height: 38,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    color: colors.ink,
  },
  sideSendBtn: {
    width: 38,
    height: 38,
    backgroundColor: colors.accent,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  controlBar: {
    height: 82,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    ...shadows.sheet,
    justifyContent: 'center',
  },
  controlBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderRadius: radius.card,
    minWidth: 54,
  },
  controlBtnActive: {
    backgroundColor: colors.surfaceTint,
  },
  controlBtnLabel: {
    color: colors.ink,
    marginTop: 4,
    fontSize: 11,
  },
  endCallBtn: {
    backgroundColor: colors.accentStrong,
    borderRadius: radius.full,
    width: 54,
    height: 54,
    paddingVertical: 0,
    marginLeft: 10,
  },
  endCallText: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 10,
  },
  sheetChatContainer: {
    height: 360,
  },
  sheetChatScroll: {
    flex: 1,
    paddingVertical: 8,
  },
  chatBubble: {
    padding: 10,
    borderRadius: radius.card,
    marginBottom: 8,
    maxWidth: '85%',
  },
  bubblePatient: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surfaceTint,
    borderBottomRightRadius: 2,
  },
  bubbleDoctor: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 2,
  },
  bubbleSender: {
    color: colors.inkSecondary,
    marginBottom: 2,
  },
  bubbleText: {
    color: colors.ink,
  },
  sheetChatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  sheetChatInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.card,
    paddingHorizontal: 14,
    color: colors.ink,
  },
  sheetSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  moreMenuContent: {
    paddingBottom: 20,
  },
  moreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  moreItemText: {
    color: colors.ink,
    marginLeft: 12,
  },
  moreToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  endSheetContent: {
    paddingBottom: 24,
  },
  endConfirmBtn: {
    marginBottom: 12,
  },
});

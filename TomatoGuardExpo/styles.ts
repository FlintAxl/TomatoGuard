import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  sidebar: {
    backgroundColor: '#1e293b',
    borderRightWidth: 1,
    borderRightColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  sidebarHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  navMenu: {
    padding: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: '#334155',
  },
  navIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  navText: {
    fontSize: 15,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  topBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 20,
    color: '#0f172a',
    fontWeight: '600',
  },
  topBarTitleContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  contentArea: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  contentPadding: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 20,
  },
  text: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  bulletText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
    lineHeight: 20,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  drawerOverlayBg: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

  export const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 24,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: 8,
    },
    cardDescription: {
      fontSize: 14,
      color: '#64748b',
      lineHeight: 20,
      marginBottom: 20,
    },
  });

export const buttonStyles = StyleSheet.create({
 primaryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  primaryButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.7,
  },
  
  outlineButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  
  outlineButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
    opacity: 0.6,
  },
  
});

export const resultsStyles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Status Alert
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#4b5563',
  },
  
  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Progress Bar
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  // Bullet List
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  
  // BOUNDING BOX SECTION
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  
  // Image Comparison
  imageComparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageSubLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Spot Statistics
  spotStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#d1d5db',
    marginHorizontal: 8,
  },
  
  // Bounding Box Details
  boundingBoxList: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  boundingBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  boundingBoxItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  boundingBoxNumber: {
    width: 60,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  boundingBoxDetails: {
    flex: 1,
  },
  boundingBoxText: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 2,
  },
  moreSpotsText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  
  // MODAL STYLES
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageCaption: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  
  // ADDITIONAL STYLES FOR OTHER COMPONENTS
  // (If you have other shared styles, add them here)
});

export const imageUploadStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropzone: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginBottom: 20,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  dropzoneText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 6,
  },
  dropzoneHint: {
    fontSize: 13,
    color: '#94a3b8',
  },
  fileList: {
    marginTop: 20,
  },
  fileListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  clearButton: {
    backgroundColor: '#64748b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#64748b',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadProgress: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 16,
  },
});

export const cameraCaptureStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Full screen camera preview
  cameraPreview: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  // Camera preview with overlay
  cameraContainer: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  // Focus frame overlay
  focusFrame: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: '60%',
    height: '40%',
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 8,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  // Grid overlay for better framing
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  // Camera controls container
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
  },
  // Main capture button
  captureButton: {
    backgroundColor: '#10b981',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  captureButtonActive: {
    backgroundColor: '#0ea5e9',
    transform: [{ scale: 0.95 }],
  },
  captureButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  captureIcon: {
    fontSize: 32,
    color: 'white',
  },
  // Secondary buttons
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryIcon: {
    fontSize: 24,
    color: 'white',
  },
  // Camera status indicator
  statusIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  // Instructions overlay
  instructionsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  // Camera placeholder (when not active)
  cameraPlaceholder: {
    width: '100%',
    height: 400,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 16,
    color: '#64748b',
  },
  placeholderText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
  },
  // Image preview
  previewContainer: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
  },
  previewText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  // Camera zoom controls
  zoomSliderContainer: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingVertical: 20,
  },
  zoomSlider: {
    width: 30,
    height: 200,
  },
  zoomLabel: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'white',
    fontSize: 10,
  },
  // Flash controls
  flashButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashIcon: {
    fontSize: 20,
    color: 'white',
  },
  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14,
  },
  // Add to cameraCaptureStyles:
zoomButtonsContainer: {
  position: 'absolute',
  right: 10,
  top: '50%',
  transform: [{ translateY: -40 }],
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: 20,
  padding: 10,
  gap: 10,
},
zoomButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  justifyContent: 'center',
  alignItems: 'center',
},
zoomIcon: {
  fontSize: 24,
  color: 'white',
  fontWeight: 'bold',
},
});
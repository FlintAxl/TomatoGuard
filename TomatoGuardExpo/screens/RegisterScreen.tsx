// TomatoGuardExpo/src/screens/RegisterScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  ImageBackground,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Drawer from '../components/Layout/Drawer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 768;

const COLORS = {
  bgCream: '#f0ede6',
  bgLight: '#e8e4db',
  darkGreen: '#1a3a2a',
  medGreen: '#2d5a3d',
  accentGreen: '#3d7a52',
  textLight: '#ffffff',
  textDark: '#0d1f14',
  textMuted: '#5a7a65',
  cardBg: '#1e3d2a',
  navBg: '#0d2018',
};

const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(0)).current;

  const { register } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleMenuPress = () => {
    setDrawerOpen(!drawerOpen);
    Animated.spring(drawerAnimation, {
      toValue: drawerOpen ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    Animated.spring(drawerAnimation, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const handleNavItemPress = (itemId: string) => {
    if (itemId === 'logout') {
      console.log('Logout');
      return;
    }
    handleCloseDrawer();
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await register({
        email,
        password,
        full_name: fullName || undefined,
      });
      setSuccess('Registration successful! Redirecting...');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1771333800/Screen_Shot_2026-02-17_at_9.09.39_PM_o8nvq8.png' }}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <MainLayout
        drawerOpen={drawerOpen}
        drawerAnimation={drawerAnimation}
        pageTitle="TomatoGuard"
        pageSubtitle="Sign Up"
        onMenuPress={handleMenuPress}
        onCloseDrawer={handleCloseDrawer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.containerWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Form on Left */}
              <View style={styles.formSection}>
                <View style={styles.formContent}>
                  {/* Logo and Header */}
                  <View style={styles.authHeader}>
                    <Text style={styles.authLogo}>TomatoGuard</Text>
                    <Text style={styles.authSubtitle}>Create your account</Text>
                  </View>

                  {/* Register Form */}
                  <View style={styles.authForm}>
                    {error ? (
                      <View style={styles.errorMessage}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    ) : null}

                    {success ? (
                      <View style={styles.successMessage}>
                        <Text style={styles.successIcon}>✓</Text>
                        <Text style={styles.successText}>{success}</Text>
                      </View>
                    ) : null}

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Full Name (Optional)</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          focusedInput === 'fullName' && styles.textInputFocused,
                        ]}
                        placeholder="Enter your full name"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={fullName}
                        onChangeText={setFullName}
                        onFocus={() => setFocusedInput('fullName')}
                        onBlur={() => setFocusedInput(null)}
                        editable={!loading}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Email *</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          focusedInput === 'email' && styles.textInputFocused,
                        ]}
                        placeholder="Enter your email"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!loading}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Password *</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          focusedInput === 'password' && styles.textInputFocused,
                        ]}
                        placeholder="Create a password (min. 6 characters)"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        secureTextEntry={true}
                        editable={!loading}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Confirm Password *</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          focusedInput === 'confirmPassword' && styles.textInputFocused,
                        ]}
                        placeholder="Confirm your password"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setFocusedInput('confirmPassword')}
                        onBlur={() => setFocusedInput(null)}
                        secureTextEntry={true}
                        editable={!loading}
                      />
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.authButton,
                        loading && styles.authButtonDisabled,
                      ]}
                      onPress={handleRegister}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.authButtonText}>Create Account</Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.authLinkContainer}>
                      <Text style={styles.authLinkText}>Already have an account?</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.authLink}>Sign in</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Picture on Right (desktop only) */}
              {SCREEN_WIDTH >= 768 && (
                <View style={styles.imageSection}>
                  <Image
                    source={require('./../assets/tomatofarmers.png')}
                    style={styles.sideImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </MainLayout>

      <Drawer
        activeTab="register"
        onItemPress={handleNavItemPress}
        animation={drawerAnimation}
        drawerOpen={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    margin: isSmallDevice ? 0 : 50,
    borderRadius: isSmallDevice ? 0 : 24,
    overflow: 'hidden',
    flexDirection: isSmallDevice ? 'column' : 'row',
    minHeight: isSmallDevice ? SCREEN_HEIGHT : SCREEN_HEIGHT - 150,
  },

  // Form Section
  formSection: {
    flex: 1,
    minWidth: isSmallDevice ? '100%' : '60%',
    padding: isSmallDevice ? 20 : 40,
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 250, 250, 0)',
  },
  formContent: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },

  // Image Section
  imageSection: {
    flex: 1,
    minWidth: isSmallDevice ? '100%' : '40%',
    height: isSmallDevice ? 200 : '100%',
  },
  sideImage: {
    width: '100%',
    height: '100%',
  },

  // Header
  authHeader: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 30 : 40,
    marginTop: isSmallDevice ? 20 : 0,
  },
  authLogo: {
    fontSize: isSmallDevice ? 36 : 48,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 12,
    fontFamily: 'System',
  },
  authSubtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: COLORS.textLight,
    fontFamily: 'System',
  },

  // Form
  authForm: {
    width: '100%',
  },

  // Error Message
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 49, 17)',
    borderRadius: isSmallDevice ? 8 : 12,
    padding: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 20 : 24,
    gap: 10,
  },
  errorIcon: {
    fontSize: 18,
  },
  errorText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'System',
  },

  // Success Message
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(61, 122, 82, 0.85)',
    borderRadius: isSmallDevice ? 8 : 12,
    padding: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 20 : 24,
    gap: 10,
  },
  successIcon: {
    fontSize: 18,
    color: COLORS.textLight,
  },
  successText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'System',
  },

  // Input Container
  inputContainer: {
    marginBottom: isSmallDevice ? 18 : 24,
  },
  inputLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
    fontFamily: 'System',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
    borderRadius: isSmallDevice ? 8 : 12,
    paddingVertical: isSmallDevice ? 12 : 14,
    paddingHorizontal: isSmallDevice ? 14 : 16,
    fontSize: isSmallDevice ? 14 : 15,
    color: COLORS.darkGreen,
    fontFamily: 'System',
    fontWeight: 'bold',  // Added bold
  },
  textInputFocused: {
    borderColor: COLORS.medGreen,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },

  // Auth Button
  authButton: {
    backgroundColor: COLORS.accentGreen,
    paddingVertical: isSmallDevice ? 14 : 16,
    borderRadius: isSmallDevice ? 8 : 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isSmallDevice ? 8 : 12,
    marginBottom: isSmallDevice ? 20 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
    fontFamily: 'System',
  },

  // Auth Link
  authLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: isSmallDevice ? 20 : 0,
  },
  authLinkText: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'System',
  },
  authLink: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default RegisterScreen;
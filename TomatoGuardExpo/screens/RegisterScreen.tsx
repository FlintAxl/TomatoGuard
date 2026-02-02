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
  ImageBackground,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  color1: '#f8ff76',
  color2: '#e9523a',
  color3: '#2d7736',
  color4: '#081600',
  color5: '#1b4e00',
  textLight: '#ffffff',
  muted: '#d6e4dd',
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

  const { register } = useAuth();

  // Animation for card fade-up effect
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

  const handleRegister = async () => {
    // Validation
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
      // Auto-redirect happens after successful registration/login
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        {/* Section One - Hero Background */}
        <ImageBackground
          source={require('./../assets/section1-bg.png')}
          style={styles.sectionOne}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', COLORS.color4]}
            style={styles.heroGradient}
          />
        </ImageBackground>

        {/* Section Two - Continues the gradient */}
        <LinearGradient
          colors={[COLORS.color4, COLORS.color4]}
          style={styles.sectionTwo}
        >
          {/* Floating Register Card */}
          <Animated.View
            style={[
              styles.registerCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
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
            </LinearGradient>
          </Animated.View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Section One - Hero Background
  sectionOne: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
  },

  // Section Two - Gradient continuation
  sectionTwo: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingBottom: 80,
    paddingTop: 100,
    backgroundColor: COLORS.color4,
    alignItems: 'center',
  },

  // Floating Register Card
  registerCard: {
    width: '100%',
    maxWidth: 480,
    marginTop: -570, // Overlaps both sections
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  cardGradient: {
    borderRadius: 24,
    padding: 40,
    paddingTop: 50,
    paddingBottom: 50,
  },

  // Header
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  authLogo: {
    fontSize: 48,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 12,
    fontFamily: 'System',
  },
  authSubtitle: {
    fontSize: 16,
    color: COLORS.muted,
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
    backgroundColor: 'rgba(233, 82, 58, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.color2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  errorIcon: {
    fontSize: 18,
  },
  errorText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: 'System',
  },

  // Success Message
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 119, 54, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.color3,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  successIcon: {
    fontSize: 18,
    color: COLORS.color3,
  },
  successText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: 'System',
  },

  // Input Container
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
    fontFamily: 'System',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textLight,
    fontFamily: 'System',
  },
  textInputFocused: {
    borderColor: COLORS.color1,
    backgroundColor: 'rgba(248, 255, 118, 0.05)',
  },

  // Auth Button
  authButton: {
    backgroundColor: COLORS.color2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
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
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },

  // Auth Link
  authLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  authLinkText: {
    color: COLORS.muted,
    fontSize: 14,
    fontFamily: 'System',
  },
  authLink: {
    color: COLORS.color1,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default RegisterScreen;
// TomatoGuardExpo/src/screens/LoginScreen.tsx
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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import Drawer from '../components/Layout/Drawer';

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

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(0)).current;

  const { login } = useAuth();

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

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MainLayout
        drawerOpen={drawerOpen}
        drawerAnimation={drawerAnimation}
        pageTitle="TomatoGuard"
        pageSubtitle="Sign In"
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
              <BlurView
                intensity={30}
                tint="dark"
                style={styles.container}
              >
                {/* Picture on Left */}
                <View style={styles.imageSection}>
                  <Image
                    source={require('./../assets/tomatofarmers.png')}
                    style={styles.sideImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Form on Right */}
                <View style={styles.formSection}>
                  <View style={styles.formContent}>
                    {/* Logo and Header */}
                    <View style={styles.authHeader}>
                      <Text style={styles.authLogo}>TomatoGuard</Text>
                      <Text style={styles.authSubtitle}>Sign in to your account</Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.authForm}>
                      {error ? (
                        <View style={styles.errorMessage}>
                          <Text style={styles.errorIcon}>⚠️</Text>
                          <Text style={styles.errorText}>{error}</Text>
                        </View>
                      ) : null}

                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
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
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                          style={[
                            styles.textInput,
                            focusedInput === 'password' && styles.textInputFocused,
                          ]}
                          placeholder="Enter your password"
                          placeholderTextColor="rgba(255, 255, 255, 0.5)"
                          value={password}
                          onChangeText={setPassword}
                          onFocus={() => setFocusedInput('password')}
                          onBlur={() => setFocusedInput(null)}
                          secureTextEntry={true}
                          editable={!loading}
                        />
                        <TouchableOpacity style={styles.forgotPassword}>
                          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.authButton,
                          loading && styles.authButtonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#ffffff" />
                        ) : (
                          <Text style={styles.authButtonText}>Sign In</Text>
                        )}
                      </TouchableOpacity>

                      <View style={styles.authLinkContainer}>
                        <Text style={styles.authLinkText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Register' })}>
                          <Text style={styles.authLink}>Sign up</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </MainLayout>

      <Drawer
        activeTab="login"
        onItemPress={handleNavItemPress}
        animation={drawerAnimation}
        drawerOpen={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    margin: SCREEN_WIDTH < 768 ? 0 : 50,
    borderRadius: SCREEN_WIDTH < 768 ? 0 : 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  container: {
    flex: 1,
    flexDirection: SCREEN_WIDTH < 768 ? 'column' : 'row',
    minHeight: SCREEN_WIDTH < 768 ? SCREEN_HEIGHT : SCREEN_HEIGHT - 150,
  },

  // Image Section (Left on desktop, top on mobile)
  imageSection: {
    flex: SCREEN_WIDTH < 768 ? 0 : 1,
    minWidth: SCREEN_WIDTH < 768 ? '100%' : '40%',
    height: SCREEN_WIDTH < 768 ? 200 : '100%',
  },
  sideImage: {
    width: '100%',
    height: '100%',
  },

  // Form Section (Right on desktop, bottom on mobile)
  formSection: {
    flex: 1,
    minWidth: SCREEN_WIDTH < 768 ? '100%' : '60%',
    padding: SCREEN_WIDTH < 768 ? 20 : 40,
    justifyContent: 'center',
  },
  formContent: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },

  // Header
  authHeader: {
    alignItems: 'center',
    marginBottom: SCREEN_WIDTH < 768 ? 30 : 40,
  },
  authLogo: {
    fontSize: SCREEN_WIDTH < 768 ? 36 : 48,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 12,
    fontFamily: 'System',
  },
  authSubtitle: {
    fontSize: SCREEN_WIDTH < 768 ? 14 : 16,
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
    borderColor: COLORS.color3,
    borderRadius: SCREEN_WIDTH < 768 ? 8 : 12,
    padding: SCREEN_WIDTH < 768 ? 12 : 14,
    marginBottom: SCREEN_WIDTH < 768 ? 20 : 24,
    gap: 10,
  },
  errorIcon: {
    fontSize: 18,
  },
  errorText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: SCREEN_WIDTH < 768 ? 13 : 14,
    fontFamily: 'System',
  },

  // Input Container
  inputContainer: {
    marginBottom: SCREEN_WIDTH < 768 ? 20 : 24,
  },
  inputLabel: {
    fontSize: SCREEN_WIDTH < 768 ? 13 : 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
    fontFamily: 'System',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SCREEN_WIDTH < 768 ? 8 : 12,
    paddingVertical: SCREEN_WIDTH < 768 ? 12 : 14,
    paddingHorizontal: SCREEN_WIDTH < 768 ? 14 : 16,
    fontSize: SCREEN_WIDTH < 768 ? 14 : 15,
    color: COLORS.textLight,
    fontFamily: 'System',
  },
  textInputFocused: {
    borderColor: COLORS.color1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Forgot Password
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: COLORS.color3,
    fontSize: SCREEN_WIDTH < 768 ? 12 : 13,
    fontFamily: 'System',
  },

  // Auth Button
  authButton: {
    backgroundColor: COLORS.color3,
    paddingVertical: SCREEN_WIDTH < 768 ? 14 : 16,
    borderRadius: SCREEN_WIDTH < 768 ? 8 : 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SCREEN_WIDTH < 768 ? 8 : 12,
    marginBottom: SCREEN_WIDTH < 768 ? 20 : 24,
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
    fontSize: SCREEN_WIDTH < 768 ? 15 : 16,
    fontWeight: '600',
    fontFamily: 'System',
  },

  // Auth Link
  authLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: SCREEN_WIDTH < 768 ? 20 : 0,
  },
  authLinkText: {
    color: COLORS.muted,
    fontSize: SCREEN_WIDTH < 768 ? 13 : 14,
    fontFamily: 'System',
  },
  authLink: {
    color: COLORS.color3,
    fontSize: SCREEN_WIDTH < 768 ? 13 : 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default LoginScreen;
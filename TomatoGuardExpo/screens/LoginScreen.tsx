// TomatoGuardExpo/src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { authStyles } from '../styles';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      // Navigation will be handled by the parent (App.tsx will redirect based on auth state)
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={authStyles.authContainer}>
          <View style={authStyles.authHeader}>
            <Text style={authStyles.authLogo}>🍅 TomatoGuard</Text>
            <Text style={authStyles.authSubtitle}>Sign in to your account</Text>
          </View>

          <View style={authStyles.authForm}>
            {error ? (
              <View style={[authStyles.messageContainer, authStyles.errorMessage]}>
                <Text style={[authStyles.messageIcon, authStyles.errorIcon]}>⚠️</Text>
                <Text style={authStyles.messageText}>{error}</Text>
              </View>
            ) : null}

            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Email</Text>
              <TextInput
                style={[
                  authStyles.textInput,
                  focusedInput === 'email' && authStyles.textInputFocused,
                ]}
                placeholder="Enter your email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Password</Text>
              <TextInput
                style={[
                  authStyles.textInput,
                  focusedInput === 'password' && authStyles.textInputFocused,
                ]}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry
                editable={!loading}
              />
              <TouchableOpacity style={authStyles.forgotPassword}>
                <Text style={authStyles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                authStyles.authButton,
                loading && authStyles.authButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={authStyles.authButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={authStyles.authLinkContainer}>
              <Text style={authStyles.authLinkText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={authStyles.authLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
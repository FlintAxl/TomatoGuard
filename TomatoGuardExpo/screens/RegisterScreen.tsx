// TomatoGuardExpo/src/screens/RegisterScreen.tsx
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
            <Text style={authStyles.authSubtitle}>Create your account</Text>
          </View>

          <View style={authStyles.authForm}>
            {error ? (
              <View style={[authStyles.messageContainer, authStyles.errorMessage]}>
                <Text style={[authStyles.messageIcon, authStyles.errorIcon]}>⚠️</Text>
                <Text style={authStyles.messageText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={[authStyles.messageContainer, authStyles.successMessage]}>
                <Text style={[authStyles.messageIcon, authStyles.successIcon]}>✓</Text>
                <Text style={authStyles.messageText}>{success}</Text>
              </View>
            ) : null}

            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Full Name (Optional)</Text>
              <TextInput
                style={[
                  authStyles.textInput,
                  focusedInput === 'fullName' && authStyles.textInputFocused,
                ]}
                placeholder="Enter your full name"
                placeholderTextColor="#94a3b8"
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusedInput('fullName')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>

            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Email *</Text>
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
              <Text style={authStyles.inputLabel}>Password *</Text>
              <TextInput
                style={[
                  authStyles.textInput,
                  focusedInput === 'password' && authStyles.textInputFocused,
                ]}
                placeholder="Create a password (min. 6 characters)"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputLabel}>Confirm Password *</Text>
              <TextInput
                style={[
                  authStyles.textInput,
                  focusedInput === 'confirmPassword' && authStyles.textInputFocused,
                ]}
                placeholder="Confirm your password"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[
                authStyles.authButton,
                loading && authStyles.authButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={authStyles.authButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={authStyles.authLinkContainer}>
              <Text style={authStyles.authLinkText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={authStyles.authLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  IconButton,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    Alert.alert('OAuth Login', `${provider} login not implemented yet`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons name="heart" size={48} color="#6366f1" />
            <Title style={styles.title}>HealthWallet</Title>
            <Paragraph style={styles.subtitle}>
              Secure, blockchain-powered health records
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Welcome Back</Title>
              <Paragraph style={styles.cardSubtitle}>
                Sign in to your HealthWallet account
              </Paragraph>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.loginButton}
              >
                Sign In
              </Button>

              <View style={styles.forgotPassword}>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  Forgot Password?
                </Button>
              </View>

              <View style={styles.divider}>
                <Divider style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <Divider style={styles.dividerLine} />
              </View>

              <View style={styles.oauthButtons}>
                <Button
                  mode="outlined"
                  onPress={() => handleOAuthLogin('Google')}
                  style={styles.oauthButton}
                  icon="google"
                >
                  Google
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleOAuthLogin('Microsoft')}
                  style={styles.oauthButton}
                  icon="microsoft"
                >
                  Microsoft
                </Button>
              </View>

              <View style={styles.additionalOptions}>
                <Button
                  mode="outlined"
                  onPress={() => handleOAuthLogin('Mobile OTP')}
                  style={styles.optionButton}
                  icon="phone"
                >
                  Login with Mobile OTP
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleOAuthLogin('Aadhaar eKYC')}
                  style={styles.optionButton}
                  icon="card"
                >
                  Login with Aadhaar eKYC
                </Button>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate('Register')}
              >
                Sign up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardSubtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#6b7280',
    fontSize: 12,
  },
  oauthButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  oauthButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  additionalOptions: {
    marginTop: 10,
  },
  optionButton: {
    marginBottom: 10,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#6b7280',
  },
  linkText: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
});

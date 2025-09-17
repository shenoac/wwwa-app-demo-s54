import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL

export default function HomeScreen() {
  const [phone, setPhone] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  async function startVerify() {
    if (!phone.trim()) {
      Alert.alert('Enter your phone number to subscribe to water outage alerts', 'Enter a phone number in E.164 format, e.g. +491752350401');
      return;
    }
    try {
      setLoadingSend(true);
      setStatus('Sending code…');
      const res = await fetch(`${BASE_URL}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneE164: phone }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to send code');
      setStatus('Code sent! Check your SMS 📩');
    } catch (e: any) {
      setStatus(`Error: ${e.message || 'failed'}`);
    } finally {
      setLoadingSend(false);
    }
  }

  async function checkVerify() {
    if (!phone.trim() || !code.trim()) {
      Alert.alert('Missing info', 'Enter both phone and the 6-digit code.');
      return;
    }
    try {
      setLoadingVerify(true);
      setStatus('Verifying…');
      const res = await fetch(`${BASE_URL}/api/subscribers/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneE164: phone, code }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Invalid or expired code');
      setStatus('Verified 🎉 You are subscribed.');
      setCode('');
    } catch (e: any) {
      setStatus(`Error: ${e.message || 'failed'}`);
    } finally {
      setLoadingVerify(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>WWWA — Verify Phone</Text>

          <Text style={styles.label}>Enter your phone number to subscribe to water outage alerts (E.164)</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+491752350401"
            keyboardType="phone-pad"
            autoCapitalize="none"
            style={styles.input}
          />
          <View style={styles.row}>
            <Button title="Send Code" onPress={startVerify} disabled={loadingSend} />
            {loadingSend && <ActivityIndicator style={{ marginLeft: 12 }} />}
          </View>

          <View style={{ height: 16 }} />

          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
          />
          <View style={styles.row}>
            <Button title="Verify" onPress={checkVerify} disabled={loadingVerify} />
            {loadingVerify && <ActivityIndicator style={{ marginLeft: 12 }} />}
          </View>

          {!!status && <Text style={styles.status}>{status}</Text>}

          <Text style={styles.help}>
            Tip: On a Twilio trial, you can only send SMS to verified numbers in your Twilio account.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  label: { fontSize: 14, color: '#444' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, 
    color: '#444', backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  status: { marginTop: 16, fontSize: 16 },
  help: { marginTop: 8, color: '#666', fontSize: 12 },
});

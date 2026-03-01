import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { DataMode, Flight, FlightSample } from '../types';
import { saveFlight } from '../services/storage';
import {
  clearDiscFlight,
  connectToDisc,
  disconnectFromDisc,
  downloadFlightFromDisc,
  generateMockFlightOnDisc,
  scanForDisc,
} from '../services/bleLive';
import { theme } from '../theme';

interface Props {
  onBack: () => void;
  dataMode: DataMode;
  onToggleDataMode: () => void;
  onFlightSaved: () => void;
}

export default function DevScreen({ onBack, dataMode, onToggleDataMode, onFlightSaved }: Props) {
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('');

  const handleAddDemoFlight = async () => {
    const samples: FlightSample[] = [];
    for (let i = 0; i < 200; i++) {
      samples.push({
        t: i * 20,
        r: Math.sin(i * 0.1) * 30,
        p: Math.cos(i * 0.05) * 20,
        y: i * 0.5,
      });
    }
    const demoFlight: Flight = {
      id: Date.now().toString(),
      discName: 'Demo Disc',
      recordedAt: new Date().toISOString(),
      duration: samples[samples.length - 1].t - samples[0].t,
      samples,
      synced: false,
    };
    await saveFlight(demoFlight);
    onFlightSaved();
    Alert.alert('Done', 'Demo flight added.');
  };

  const handleMockOnPico = async () => {
    setBusy(true);
    setBusyLabel('Scanning…');
    let device: any = null;
    try {
      device = await scanForDisc(12000);
      setBusyLabel('Connecting…');
      device = await connectToDisc(device.id);
      setBusyLabel('Generating mock on Pico…');
      await generateMockFlightOnDisc(device);
      setBusyLabel('Downloading…');
      const samples = await downloadFlightFromDisc(device);
      const duration = samples[samples.length - 1].t - samples[0].t;
      const flight: Flight = {
        id: Date.now().toString(),
        discName: device.name || 'DiscDawg',
        recordedAt: new Date().toISOString(),
        duration,
        samples,
        synced: false,
      };
      await saveFlight(flight);
      await clearDiscFlight(device);
      onFlightSaved();
      Alert.alert('Done', `Saved ${samples.length} samples from Pico.`);
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not complete.');
    } finally {
      if (device) await disconnectFromDisc(device);
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Developer</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data mode</Text>
          <Text style={styles.sectionHint}>
            Mock: generate data in the app. Live: scan for DiscDawg over BLE and download from the Pico.
          </Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, dataMode === 'mock' && styles.toggleBtnActive]}
              onPress={() => dataMode !== 'mock' && onToggleDataMode()}
            >
              <Text style={[styles.toggleBtnText, dataMode === 'mock' && styles.toggleBtnTextActive]}>Mock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, dataMode === 'live' && styles.toggleBtnActiveLive]}
              onPress={() => dataMode !== 'live' && onToggleDataMode()}
            >
              <Text style={[styles.toggleBtnText, dataMode === 'live' && styles.toggleBtnTextActive]}>Live</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>Current: {dataMode.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dev actions</Text>
          <TouchableOpacity
            style={[styles.actionButton, busy && styles.actionButtonDisabled]}
            onPress={handleAddDemoFlight}
            disabled={busy}
          >
            <Text style={styles.actionButtonText}>Add demo flight</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary, busy && styles.actionButtonDisabled]}
            onPress={handleMockOnPico}
            disabled={busy}
          >
            {busy ? (
              <View style={styles.busyRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.actionButtonText}>{busyLabel}</Text>
              </View>
            ) : (
              <Text style={styles.actionButtonText}>Generate mock on Pico + download</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  backText: {
    fontSize: 16,
    color: theme.primary,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.devBg,
  },
  toggleBtnActive: {
    backgroundColor: theme.dev,
  },
  toggleBtnActiveLive: {
    backgroundColor: theme.primary,
  },
  toggleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
  modeBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.surfaceMuted,
  },
  modeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  actionButton: {
    backgroundColor: theme.dev,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionButtonSecondary: {
    backgroundColor: theme.primaryDark,
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

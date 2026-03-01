import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { saveFlight } from '../services/storage';
import { DataMode, Flight, FlightSample } from '../types';
import {
  clearDiscFlight,
  connectToDisc,
  disconnectFromDisc,
  downloadFlightFromDisc,
  scanForDisc,
} from '../services/bleLive';
import { theme } from '../theme';

interface Props {
  onFlightSaved: () => void;
  onBack: () => void;
  dataMode: DataMode;
}

export default function ScanScreen({ onFlightSaved, onBack, dataMode }: Props) {
  const [scanning, setScanning] = useState(false);
  const [liveStage, setLiveStage] = useState('Ready');
  const [progressText, setProgressText] = useState('');

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const samples: FlightSample[] = [];
      for (let i = 0; i < 200; i++) {
        samples.push({
          t: i * 20,
          r: Math.sin(i * 0.1) * 30 + (Math.random() - 0.5) * 5,
          p: Math.cos(i * 0.05) * 20 + (Math.random() - 0.5) * 3,
          y: i * 0.5 + (Math.random() - 0.5) * 2,
        });
      }
      const flight: Flight = {
        id: Date.now().toString(),
        discName: 'Disc-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        recordedAt: new Date().toISOString(),
        duration: samples[samples.length - 1].t - samples[0].t,
        samples,
        synced: false,
      };
      saveFlight(flight);
      setScanning(false);
      Alert.alert('Saved', `Flight with ${samples.length} samples added.`);
      onFlightSaved();
    }, 2000);
  };

  const runLiveScan = async () => {
    setScanning(true);
    setLiveStage('Scanning');
    setProgressText('');
    let device: any = null;
    try {
      device = await scanForDisc(12000);
      setLiveStage('Connecting');
      device = await connectToDisc(device.id);
      setLiveStage('Downloading');
      const samples = await downloadFlightFromDisc(device, (received, total) => {
        setProgressText(total ? `${received}/${total} chunks` : `${received} chunks`);
      });
      const duration = samples[samples.length - 1].t - samples[0].t;
      const flight: Flight = {
        id: Date.now().toString(),
        discName: device.name || device.localName || 'DiscDawg',
        recordedAt: new Date().toISOString(),
        duration,
        samples,
        synced: false,
      };
      await saveFlight(flight);
      await clearDiscFlight(device);
      setLiveStage('Saved');
      Alert.alert('Saved', `${samples.length} samples downloaded from your disc.`);
      onFlightSaved();
    } catch (error: any) {
      setLiveStage('Error');
      Alert.alert('Couldn’t connect', error?.message || 'Make sure the Pico is on and nearby, then try again.');
    } finally {
      if (device) await disconnectFromDisc(device);
      setScanning(false);
    }
  };

  const handleScan = () => {
    if (dataMode === 'mock') {
      simulateScan();
      return;
    }
    runLiveScan();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backHit}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.backHit} />
      </View>

      <View style={styles.content}>
        {scanning ? (
          <>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.status}>
              {dataMode === 'live' ? liveStage : 'Generating…'}
            </Text>
            <Text style={styles.hint}>
              {dataMode === 'live'
                ? 'Looking for DiscDawg. Keep your disc powered and close.'
                : 'Adding a sample flight to your list.'}
            </Text>
            {progressText ? <Text style={styles.progressText}>{progressText}</Text> : null}
          </>
        ) : (
          <>
            <Text style={styles.title}>
              {dataMode === 'live' ? 'Download from disc' : 'Generate sample flight'}
            </Text>
            <Text style={styles.hint}>
              {dataMode === 'live'
                ? 'Scan for your DiscDawg over Bluetooth and download the latest flight.'
                : 'Add a sample flight (dev mode). Use Developer settings to switch to live.'}
            </Text>
            {progressText ? <Text style={styles.progressText}>{progressText}</Text> : null}
            <TouchableOpacity style={styles.scanButton} onPress={handleScan} activeOpacity={0.8}>
              <Text style={styles.scanButtonText}>
                {dataMode === 'live' ? 'Scan for disc' : 'Generate sample'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backHit: {
    minWidth: 60,
  },
  backText: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: '500',
  },
  logo: {
    height: 28,
    width: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 20,
    marginBottom: 8,
  },
  hint: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  progressText: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 12,
  },
  scanButton: {
    marginTop: 32,
    backgroundColor: theme.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    minWidth: 200,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

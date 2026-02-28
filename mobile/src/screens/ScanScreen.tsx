import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { saveFlight } from '../services/storage';
import { DataMode, Flight, FlightSample } from '../types';
import {
  clearDiscFlight,
  connectToDisc,
  disconnectFromDisc,
  downloadFlightFromDisc,
  scanForDisc,
} from '../services/bleLive';

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
      const source = dataMode === 'mock' ? 'mock profile' : 'live fallback profile';
      Alert.alert('Success', `Downloaded flight with ${samples.length} samples from ${source}.`);
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
      setLiveStage('Disc Found');

      device = await connectToDisc(device.id);
      setLiveStage('Connected');

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
      Alert.alert('Live Download Complete', `Connected to disc and saved ${samples.length} samples.`);
      onFlightSaved();
    } catch (error: any) {
      setLiveStage('Error');
      Alert.alert('Live Scan Failed', error?.message || 'Failed to connect or download from disc.');
    } finally {
      if (device) {
        await disconnectFromDisc(device);
      }
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

  const liveConnected = dataMode === 'live' && ['Connected', 'Downloading', 'Saved'].includes(liveStage);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {scanning ? (
          <>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.status}>{dataMode === 'live' ? `Live: ${liveStage}` : 'Scanning for DiscDawg...'}</Text>
            <Text style={styles.hint}>
              {dataMode === 'live'
                ? 'Looking for DiscDawg over BLE. Keep Pico powered and near the phone.'
                : 'Make sure your disc is powered on and nearby'}
            </Text>
            {progressText ? <Text style={styles.progressText}>{progressText}</Text> : null}
          </>
        ) : (
          <>
            <Text style={styles.status}>Ready to Scan</Text>
            <View style={[styles.modeChip, dataMode === 'mock' ? styles.modeMock : styles.modeLive]}>
              <Text style={styles.modeChipText}>Mode: {dataMode.toUpperCase()}</Text>
            </View>
            {dataMode === 'live' ? (
              <View style={[styles.connectionBanner, liveConnected ? styles.connectionGood : styles.connectionIdle]}>
                <Text style={styles.connectionText}>
                  {liveConnected ? 'LIVE CONNECTED TO DISC' : `LIVE STATUS: ${liveStage.toUpperCase()}`}
                </Text>
              </View>
            ) : null}
            <Text style={styles.hint}>
              {dataMode === 'mock'
                ? 'Mock mode is active. Tap below to generate realistic disc-golf throw data.'
                : 'Live mode scans for DiscDawg over BLE and downloads real flight data from Pico.'}
            </Text>
            {progressText ? <Text style={styles.progressText}>{progressText}</Text> : null}
            <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
              <Text style={styles.scanButtonText}>{dataMode === 'mock' ? 'Generate Mock Flight' : 'Scan Disc'}</Text>
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
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    padding: 8,
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    color: '#2563eb',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  status: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  modeChip: {
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  modeMock: {
    backgroundColor: '#111827',
  },
  modeLive: {
    backgroundColor: '#059669',
  },
  modeChipText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  scanButton: {
    marginTop: 32,
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  connectionBanner: {
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectionGood: {
    backgroundColor: '#065f46',
  },
  connectionIdle: {
    backgroundColor: '#1f2937',
  },
  connectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  progressText: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 10,
  },
});

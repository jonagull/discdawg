import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { connectToDisc, disconnectFromDisc, readRealtimeSample, scanForDisc, RealtimeSample } from '../services/bleLive';
import { theme } from '../theme';

interface Props {
  onBack: () => void;
}

export default function LiveMonitorScreen({ onBack }: Props) {
  const [stage, setStage] = useState('Ready');
  const [sample, setSample] = useState<RealtimeSample | null>(null);
  const [running, setRunning] = useState(false);
  const deviceRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      stopMonitor();
    };
  }, []);

  const startMonitor = async () => {
    if (running) return;
    setRunning(true);
    setStage('Scanning');

    try {
      const found = await scanForDisc(20000);
      setStage('Disc Found');
      const device = await connectToDisc(found.id);
      deviceRef.current = device;
      setStage('Connected');

      timerRef.current = setInterval(async () => {
        if (!deviceRef.current) return;
        try {
          const value = await readRealtimeSample(deviceRef.current);
          if (value) {
            setSample(value);
            setStage('Streaming');
          }
        } catch {
          setStage('Read Error');
        }
      }, 200);
    } catch (error: any) {
      setStage(error?.message || 'Failed to connect');
      setRunning(false);
    }
  };

  const stopMonitor = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (deviceRef.current) {
      await disconnectFromDisc(deviceRef.current);
      deviceRef.current = null;
    }
    setRunning(false);
    setStage('Stopped');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.title}>Live monitor</Text>
      <Text style={styles.subtitle}>Real-time orientation and acceleration from your disc</Text>
      <View style={[styles.badge, stage === 'Streaming' && styles.badgeLive]}>
        <Text style={styles.badgeText}>{stage}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.startButton} onPress={startMonitor} activeOpacity={0.8}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.stopButton} onPress={stopMonitor} activeOpacity={0.8}>
          <Text style={styles.stopButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Orientation</Text>
        <Text style={styles.metric}>Roll: {sample ? sample.roll.toFixed(2) : '--'}°</Text>
        <Text style={styles.metric}>Pitch: {sample ? sample.pitch.toFixed(2) : '--'}°</Text>
        <Text style={styles.metric}>Yaw: {sample ? sample.yaw.toFixed(2) : '--'}°</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Acceleration</Text>
        <Text style={styles.metric}>Ax: {sample ? sample.ax.toFixed(2) : '--'}</Text>
        <Text style={styles.metric}>Ay: {sample ? sample.ay.toFixed(2) : '--'}</Text>
        <Text style={styles.metric}>Az: {sample ? sample.az.toFixed(2) : '--'}</Text>
        <Text style={styles.metric}>|a|: {sample ? sample.amag.toFixed(2) : '--'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
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
  placeholder: {
    width: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.dev,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  badgeLive: {
    backgroundColor: theme.primary,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  startButton: {
    flex: 1,
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButton: {
    flex: 1,
    backgroundColor: theme.surfaceMuted,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  stopButtonText: {
    color: theme.text,
    fontWeight: '700',
    fontSize: 15,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: theme.text,
  },
  metric: {
    fontSize: 15,
    color: theme.text,
    marginBottom: 4,
  },
});

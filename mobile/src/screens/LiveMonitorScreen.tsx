import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connectToDisc, disconnectFromDisc, readRealtimeSample, scanForDisc, RealtimeSample } from '../services/bleLive';

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
          if (value) setSample(value);
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
      </View>

      <Text style={styles.title}>Live Disc Monitor</Text>
      <Text style={styles.subtitle}>Real-time IMU stream while moving the disc</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{stage}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.startButton} onPress={startMonitor}>
          <Text style={styles.actionText}>Start Live</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.stopButton} onPress={stopMonitor}>
          <Text style={styles.actionText}>Stop</Text>
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
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 8,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#2563eb',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    color: '#6b7280',
    marginBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  stopButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  metric: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 4,
  },
});

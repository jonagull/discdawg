import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Flight } from '../types';
import { getFlight, deleteFlight } from '../services/storage';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  FlightDetail: { flightId: string };
};

type FlightDetailRouteProp = RouteProp<RootStackParamList, 'FlightDetail'>;

export default function FlightDetailScreen() {
  const route = useRoute<FlightDetailRouteProp>();
  const navigation = useNavigation();
  const [flight, setFlight] = useState<Flight | null>(null);

  useEffect(() => {
    loadFlight();
  }, []);

  const loadFlight = async () => {
    const data = await getFlight(route.params.flightId);
    setFlight(data);
  };

  const handleDelete = async () => {
    if (flight) {
      await deleteFlight(flight.id);
      navigation.goBack();
    }
  };

  if (!flight) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const formatTime = (ms: number) => {
    const seconds = ms / 1000;
    return seconds.toFixed(2) + 's';
  };

  const getStats = () => {
    const samples = flight.samples;
    
    let maxRoll = -Infinity, minRoll = Infinity;
    let maxPitch = -Infinity, minPitch = Infinity;
    let maxYaw = -Infinity, minYaw = Infinity;
    
    for (const s of samples) {
      maxRoll = Math.max(maxRoll, s.r);
      minRoll = Math.min(minRoll, s.r);
      maxPitch = Math.max(maxPitch, s.p);
      minPitch = Math.min(minPitch, s.p);
      maxYaw = Math.max(maxYaw, s.y);
      minYaw = Math.min(minYaw, s.y);
    }

    return {
      sampleCount: samples.length,
      duration: flight.duration,
      rollRange: [minRoll, maxRoll],
      pitchRange: [minPitch, maxPitch],
      yawRange: [minYaw, maxYaw],
    };
  };

  const average = (values: number[]) => {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const normalizeAngleDiff = (next: number, prev: number) => {
    let diff = next - prev;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
  };

  const getDiscMetrics = () => {
    const samples = flight.samples;
    if (samples.length < 5) {
      return {
        releaseHyzer: 0,
        releaseNose: 0,
        midHyzer: 0,
        landingHyzer: 0,
        yawTravel: 0,
        wobbleIndex: 0,
        turnBias: 'Neutral',
      };
    }

    const window = Math.max(3, Math.floor(samples.length * 0.1));
    const releaseWindow = samples.slice(0, window);
    const midStart = Math.floor(samples.length * 0.45);
    const midWindow = samples.slice(midStart, midStart + window);
    const landingWindow = samples.slice(samples.length - window);

    const releaseHyzer = average(releaseWindow.map((s) => s.r));
    const releaseNose = average(releaseWindow.map((s) => s.p));
    const midHyzer = average(midWindow.map((s) => s.r));
    const landingHyzer = average(landingWindow.map((s) => s.r));

    const yawDiffs: number[] = [];
    for (let i = 1; i < samples.length; i += 1) {
      yawDiffs.push(normalizeAngleDiff(samples[i].y, samples[i - 1].y));
    }

    const yawTravel = yawDiffs.reduce((sum, diff) => sum + Math.abs(diff), 0);
    const rollDeltas = samples.slice(1).map((s, i) => s.r - samples[i].r);
    const rollDeltaMean = average(rollDeltas);
    const rollDeltaVariance = average(rollDeltas.map((delta) => (delta - rollDeltaMean) ** 2));
    const wobbleIndex = Math.sqrt(rollDeltaVariance);

    let turnBias = 'Neutral';
    if (midHyzer - releaseHyzer > 4) turnBias = 'Fading';
    if (midHyzer - releaseHyzer < -4) turnBias = 'Turning';

    return {
      releaseHyzer,
      releaseNose,
      midHyzer,
      landingHyzer,
      yawTravel,
      wobbleIndex,
      turnBias,
    };
  };

  const stats = getStats();
  const discMetrics = getDiscMetrics();
  const displaySamples = flight.samples.filter((_, i) => i % 20 === 0).slice(0, 10);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{flight.discName}</Text>
      <Text style={styles.date}>{new Date(flight.recordedAt).toLocaleString()}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{formatTime(flight.duration)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Samples</Text>
          <Text style={styles.statValue}>{stats.sampleCount}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Throw Metrics</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricKey}>Release hyzer</Text>
          <Text style={styles.metricValue}>{discMetrics.releaseHyzer.toFixed(1)}°</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricKey}>Release nose angle</Text>
          <Text style={styles.metricValue}>{discMetrics.releaseNose.toFixed(1)}°</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricKey}>Mid-flight angle</Text>
          <Text style={styles.metricValue}>{discMetrics.midHyzer.toFixed(1)}°</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricKey}>Landing angle</Text>
          <Text style={styles.metricValue}>{discMetrics.landingHyzer.toFixed(1)}°</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricKey}>Yaw travel</Text>
          <Text style={styles.metricValue}>{discMetrics.yawTravel.toFixed(0)}°</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricKey}>Wobble index</Text>
          <Text style={styles.metricValue}>{discMetrics.wobbleIndex.toFixed(2)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricKey}>Turn/Fade profile</Text>
          <Text style={styles.metricValue}>{discMetrics.turnBias}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Roll (side tilt)</Text>
        <Text style={styles.rangeText}>Range: {stats.rollRange[0].toFixed(1)}° to {stats.rollRange[1].toFixed(1)}°</Text>
        <View style={styles.dataContainer}>
          {displaySamples.map((s, i) => (
            <View key={i} style={[styles.bar, { height: Math.abs(s.r) * 2, backgroundColor: '#2563eb' }]} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pitch (forward tilt)</Text>
        <Text style={styles.rangeText}>Range: {stats.pitchRange[0].toFixed(1)}° to {stats.pitchRange[1].toFixed(1)}°</Text>
        <View style={styles.dataContainer}>
          {displaySamples.map((s, i) => (
            <View key={i} style={[styles.bar, { height: Math.abs(s.p) * 2, backgroundColor: '#10b981' }]} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yaw (spin)</Text>
        <Text style={styles.rangeText}>Range: {stats.yawRange[0].toFixed(1)}° to {stats.yawRange[1].toFixed(1)}°</Text>
        <View style={styles.dataContainer}>
          {displaySamples.map((s, i) => (
            <View key={i} style={[styles.bar, { height: Math.min(Math.abs(s.y) * 2, 100), backgroundColor: '#f59e0b' }]} />
          ))}
        </View>
      </View>

      <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#2563eb',
  },
  deleteText: {
    fontSize: 16,
    color: '#dc2626',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  metricKey: {
    fontSize: 14,
    color: '#374151',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  rangeText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: 4,
  },
  bar: {
    width: 20,
    minHeight: 2,
    borderRadius: 2,
  },
});

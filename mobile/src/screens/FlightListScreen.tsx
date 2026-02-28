import React, { useState, useCallback } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DataMode, Flight, FlightSample } from '../types';
import { getAllFlights, initDatabase, saveFlight } from '../services/storage';

interface Props {
  onFlightSelect: (flight: Flight) => void;
  onScan: () => void;
  onMonitor: () => void;
  dataMode: DataMode;
  onToggleDataMode: () => void;
}

export default function FlightListScreen({ onFlightSelect, onScan, onMonitor, dataMode, onToggleDataMode }: Props) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFlights = async () => {
    await initDatabase();
    const data = await getAllFlights();
    setFlights(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadFlights();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFlights();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const ms = seconds / 1000;
    return ms.toFixed(1) + 's';
  };

  const addDemoFlight = async () => {
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
    loadFlights();
  };

  const renderItem = ({ item }: { item: Flight }) => (
    <TouchableOpacity style={styles.card} onPress={() => onFlightSelect(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.discName}>{item.discName}</Text>
        {!item.synced && <View style={styles.unsyncedBadge}><Text style={styles.unsyncedText}>Local</Text></View>}
      </View>
      <Text style={styles.date}>{formatDate(item.recordedAt)}</Text>
      <View style={styles.stats}>
        <Text style={styles.stat}>{item.samples.length} samples</Text>
        <Text style={styles.stat}>{formatDuration(item.duration)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Flights</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.modeButton, dataMode === 'mock' ? styles.modeMock : styles.modeLive]}
            onPress={onToggleDataMode}
          >
            <Text style={styles.modeButtonText}>{dataMode === 'mock' ? 'MOCK' : 'LIVE'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.scanButton} onPress={onScan}>
            <Text style={styles.scanButtonText}>+ Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.monitorButton} onPress={onMonitor}>
            <Text style={styles.monitorButtonText}>Live</Text>
          </TouchableOpacity>
        </View>
      </View>

      {flights.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No flights yet</Text>
          <Text style={styles.emptySubtext}>Scan your disc to download flight data</Text>
          <TouchableOpacity style={styles.demoButton} onPress={addDemoFlight}>
            <Text style={styles.demoButtonText}>Add Demo Flight</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={flights}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeMock: {
    backgroundColor: '#111827',
  },
  modeLive: {
    backgroundColor: '#059669',
  },
  modeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  monitorButton: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  monitorButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  list: {
    padding: 16,
    paddingBottom: 28,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  discName: {
    fontSize: 18,
    fontWeight: '600',
  },
  unsyncedBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unsyncedText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    fontSize: 14,
    color: '#374151',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  demoButton: {
    marginTop: 24,
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

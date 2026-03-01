import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Flight } from '../types';
import { getAllFlights, initDatabase } from '../services/storage';
import { theme, TAGLINE } from '../theme';

interface Props {
  onFlightSelect: (flight: Flight) => void;
  onScan: () => void;
  onMonitor: () => void;
  onOpenDev: () => void;
}

export default function FlightListScreen({ onFlightSelect, onScan, onMonitor, onOpenDev }: Props) {
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

  const renderItem = ({ item }: { item: Flight }) => (
    <TouchableOpacity style={styles.card} onPress={() => onFlightSelect(item)} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.discName}>{item.discName}</Text>
        {!item.synced && (
          <View style={styles.unsyncedBadge}>
            <Text style={styles.unsyncedText}>Local</Text>
          </View>
        )}
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
        <View style={styles.headerTop}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity style={styles.devLink} onPress={onOpenDev} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.devLinkText}>Dev</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.tagline}>{TAGLINE}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={onScan} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Download from disc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onMonitor} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Live monitor</Text>
          </TouchableOpacity>
        </View>
      </View>

      {flights.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No flights yet</Text>
          <Text style={styles.emptySubtext}>Tap “Download from disc” to scan your DiscDawg and save a flight.</Text>
        </View>
      ) : (
        <FlatList
          data={flights}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logo: {
    height: 36,
    width: 120,
  },
  devLink: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  devLinkText: {
    fontSize: 13,
    color: theme.textMuted,
    fontWeight: '600',
  },
  tagline: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.surfaceMuted,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  secondaryButtonText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 28,
    gap: 12,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  discName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
  },
  unsyncedBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  unsyncedText: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  stat: {
    fontSize: 14,
    color: theme.textMuted,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  emptySubtext: {
    fontSize: 15,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});

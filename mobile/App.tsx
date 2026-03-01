import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/services/storage';
import { getDataMode, setDataMode } from './src/services/settings';
import FlightListScreen from './src/screens/FlightListScreen';
import ScanScreen from './src/screens/ScanScreen';
import FlightDetailScreen from './src/screens/FlightDetailScreen';
import LiveMonitorScreen from './src/screens/LiveMonitorScreen';
import DevScreen from './src/screens/DevScreen';
import { DataMode } from './src/types';

type RootStackParamList = {
  FlightList: undefined;
  Scan: undefined;
  LiveMonitor: undefined;
  FlightDetail: { flightId: string };
  Dev: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [ready, setReady] = useState(false);
  const [dataMode, setDataModeState] = useState<DataMode>('mock');

  useEffect(() => {
    init().then(() => setReady(true));
  }, []);

  const init = async () => {
    await initDatabase();
    const mode = await getDataMode();
    setDataModeState(mode);
  };

  const handleToggleDataMode = async () => {
    const nextMode: DataMode = dataMode === 'mock' ? 'live' : 'mock';
    setDataModeState(nextMode);
    await setDataMode(nextMode);
  };

  if (!ready) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator id="root">
        <Stack.Screen name="FlightList" options={{ headerShown: false }}>
          {({ navigation }) => (
            <FlightListScreen
              onFlightSelect={(flight) => navigation.navigate('FlightDetail', { flightId: flight.id })}
              onScan={() => navigation.navigate('Scan')}
              onMonitor={() => navigation.navigate('LiveMonitor')}
              onOpenDev={() => navigation.navigate('Dev')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Scan" options={{ headerShown: false }}>
          {({ navigation }) => (
            <ScanScreen
              onFlightSaved={() => navigation.navigate('FlightList')}
              onBack={() => navigation.goBack()}
              dataMode={dataMode}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="LiveMonitor" options={{ headerShown: false }}>
          {({ navigation }) => <LiveMonitorScreen onBack={() => navigation.goBack()} />}
        </Stack.Screen>
        <Stack.Screen name="FlightDetail" options={{ headerShown: false }} component={FlightDetailScreen} />
        <Stack.Screen name="Dev" options={{ headerShown: false }}>
          {({ navigation }) => (
            <DevScreen
              onBack={() => navigation.goBack()}
              dataMode={dataMode}
              onToggleDataMode={handleToggleDataMode}
              onFlightSaved={() => navigation.navigate('FlightList')}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

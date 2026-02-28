import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataMode } from '../types';

const DATA_MODE_KEY = 'discdawg:dataMode';

export async function getDataMode(): Promise<DataMode> {
  const saved = await AsyncStorage.getItem(DATA_MODE_KEY);
  if (saved === 'live' || saved === 'mock') {
    return saved;
  }
  return 'mock';
}

export async function setDataMode(mode: DataMode): Promise<void> {
  await AsyncStorage.setItem(DATA_MODE_KEY, mode);
}

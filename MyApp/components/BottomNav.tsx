import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Tab = 'explore' | 'favorites' | 'listings' | 'reservations' | 'profile';

interface Props {
  activeTab?: Tab;
}

export default function BottomNav({ activeTab }: Props) {
  const router = useRouter();

  const active = (tab: Tab) => activeTab === tab;
  const color = (tab: Tab) => (active(tab) ? '#FF385C' : '#717171');

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/' as never)}>
        <Ionicons name="compass" size={24} color={color('explore')} />
        <Text style={[styles.navText, active('explore') && styles.navTextActive]}>Keşfedin</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/my-listings' as never)}>
        <Ionicons name="list-outline" size={24} color={color('listings')} />
        <Text style={[styles.navText, active('listings') && styles.navTextActive]}>İlanlarım</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/reservations' as never)}>
        <Ionicons name="calendar-outline" size={24} color={color('reservations')} />
        <Text style={[styles.navText, active('reservations') && styles.navTextActive]}>Rezervasyonlarım</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile' as never)}>
        <Ionicons name="person-outline" size={24} color={color('profile')} />
        <Text style={[styles.navText, active('profile') && styles.navTextActive]}>Profil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    paddingBottom: 8,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    color: '#717171',
    marginTop: 4,
  },
  navTextActive: {
    color: '#FF385C',
  },
});

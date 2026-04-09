import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { View, Text, Pressable } from 'react-native';

export default function HomeScreen() {
  return (
   <View style={styles.container}>
    <Text>Hola</Text>

   </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 👈 fondo blanco
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    color: '#000',
    flexDirection: 'row',
   textAlign: 'center',
   fontSize: 30,
    gap: 8,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#A8A8A9',
    backgroundColor: '#a8a8a9af', 
    color: '#676767',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#4A3717',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  text: {
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
  },
  textButton: {
    color: '#ffffff',
    marginBottom: 10,
    fontSize: 20,
  },
  textLink: {
    color: '#4E6E58',
    marginBottom: 10,
    fontSize: 15,
    textAlign: 'center'
  }
});

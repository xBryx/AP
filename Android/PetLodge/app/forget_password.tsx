import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { Ionicons } from "@expo/vector-icons";

//Navegación
import { router } from 'expo-router';
import { Link } from 'expo-router';



export default function HomeScreen() {
  
  const [email, setEmail] = useState('');
  
  return (
    <View style={styles.container}>
      <Text style={styles.titleContainer}>¿Olvidaste tu contraseña?</Text>
<View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="gray" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
</View>
    <Text style={styles.text}>*Le enviaremos un mensaje para que restablezca su contraseña</Text>


      <Pressable style={styles.button} onPress={null}>
        <Text style={styles.textButton}>Confirmar</Text>
      </Pressable>
            

    </View>
  );

}

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f3f3f3",
  },
  input: {
    flex: 1,
    height: 40,
    color: "#676767",
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    color: '#37513f',
    flexDirection: 'row',
   textAlign: 'center',
   fontSize: 30,
    gap: 8,
    fontWeight: 'bold'
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
    color: '#4e6e58',
    marginBottom: 10,
    fontSize: 15,
    textAlign: 'center'
  }
});



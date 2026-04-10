import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
//Para el login
import { useAuth } from '../../constants/AuthContext';

//Navegación
import { router } from 'expo-router';
import { Link } from 'expo-router';





export default function Login() {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const success = await login(username, password);

    if (success) {
      router.replace('/(tabs)/perfil');
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleContainer}>Bienvenido de nuevo</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Link href={"/forget_password"}>
         <Text style={styles.textLink}>¿Olvidó su contraseña?</Text>
      </Link>

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.textButton}>Iniciar sesión</Text>
      </Pressable>
      
      <Text style={styles.text}>¿No tiene cuenta aún?</Text>

      <Link href={"/forget_password"}>
         <Text style={styles.textLink}>Registrese aquí</Text>
      </Link>

    </View>
  );
}


const styles = StyleSheet.create({
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
  input: {
    borderWidth: 1,
    borderColor: '#A8A8A9',
    backgroundColor: '#f3f3f3', 
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
    color: '#4e6e58',
    marginBottom: 10,
    fontSize: 15,
    textAlign: 'center'
  }
});


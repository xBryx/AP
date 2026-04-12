import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { Alert } from "react-native";

//Navegación
import { router } from 'expo-router';
import { Link } from 'expo-router';


const numerosYletras = (texto: string, nombreCampo: string): boolean => {
  if (/^[A-Za-z0-9]*$/.test(texto)) {
    return true;
  } else {
    Alert.alert(
      "Error",
      "No se permiten caracteres especiales en " + nombreCampo
    );
    return false;
  }
};
const noNulos = (texto: string): boolean => {
  return texto.trim() !== "";
};
export default function HomeScreen() {
  
  const [actualPassword, setactualPassword] = useState('');
  const [newPassword, setnewPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
    const handleConfirmar = () => {
      if (!noNulos(actualPassword)) {
        Alert.alert("Error", "No se permiten nulos en la contraseña actual");
        return;
      } else if (!noNulos(newPassword)) {
        Alert.alert("Error", "No se permiten nulos en la nueva contraseña");
        return;

      } else if (!noNulos(confirmPassword)) {
        Alert.alert("Error", "No se permiten nulos en confirmar contraseña");
        return;

      }
      console.log("entro");
    };
  return (
    <View style={styles.container}>
      <Text style={styles.titleContainer}>Cambiar contraseña</Text>

      <TextInput
        style={styles.input}
        placeholder="Contraseña Actual"
        value={actualPassword}
        secureTextEntry
        onChangeText={(text) =>{
          if (numerosYletras(text, "contraseña actual"))
            setactualPassword(text);
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        value={newPassword}
        secureTextEntry
        onChangeText={(text)=>{
          if (numerosYletras(text, "nueva contraseña")){
            setnewPassword(text)
          }
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        secureTextEntry
        onChangeText={(text)=>{
          if(numerosYletras(text, "confirmar contraseña")){
            setconfirmPassword(text);
          }
        }}
      />

      <Pressable style={styles.button} onPress={handleConfirmar}>
        <Text style={styles.textButton}>Confirmar</Text>
      </Pressable>
            

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


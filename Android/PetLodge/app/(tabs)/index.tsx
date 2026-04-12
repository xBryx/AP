import { View, Text, Pressable, StyleSheet, Alert, ScrollView, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { useAuth } from '../../constants/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Tipo para los datos del perfil
type Profile = {
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  telefono: string;
  direccion: string;
  profileImage: string; // URI de la foto
};

// Perfil falso por defecto (se usará si no hay ninguno guardado)
const DEFAULT_PROFILE: Profile = {
  nombre: 'Ana',
  apellido: 'García',
  cedula: '123456789',
  email: 'ana.garcia@example.com',
  telefono: '+34 612 345 678',
  direccion: 'Calle Principal 123, Madrid',
  profileImage: '',
};

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [petCount, setPetCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estado local del perfil
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  // Estado para edición
  const [editNombre, setEditNombre] = useState('');
  const [editApellido, setEditApellido] = useState('');
  const [editCedula, setEditCedula] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');

  // Cargar perfil desde AsyncStorage
  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem('profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
      } else {
        // Si no existe, guardamos el perfil por defecto
        await AsyncStorage.setItem('profile', JSON.stringify(DEFAULT_PROFILE));
        setProfile(DEFAULT_PROFILE);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Cargar cantidad de mascotas (ejemplo)
  const loadPetCount = async () => {
    try {
      const petsJson = await AsyncStorage.getItem('pets');
      const pets = petsJson ? JSON.parse(petsJson) : [];
      setPetCount(pets.length);
    } catch (error) {
      setPetCount(0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadPetCount();
      setEditNombre(profile.nombre);
      setEditApellido(profile.apellido);
      setEditCedula(profile.cedula);
      setEditEmail(profile.email);
      setEditTelefono(profile.telefono);
      setEditDireccion(profile.direccion);
      setEditProfileImage(profile.profileImage);
    }, [])
  );


  const handleChangeProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0].uri) {
      setEditProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!editNombre.trim() || !editApellido.trim() || !editCedula.trim() || 
        !editEmail.trim() || !editTelefono.trim() || !editDireccion.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    const updatedProfile: Profile = {
      nombre: editNombre.trim(),
      apellido: editApellido.trim(),
      cedula: editCedula.trim(),
      email: editEmail.trim(),
      telefono: editTelefono.trim(),
      direccion: editDireccion.trim(),
      profileImage: editProfileImage,
    };
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setLoading(false);
    }
  };



  const fullName = `${profile.nombre} ${profile.apellido}`;
  const displayName = fullName;

  const goToMascotas = () => {
    router.push('/mascotas');
  };

  const change_password = () => {
    router.push('/change_password');
  };

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, cerrar', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Perfil</Text>
      {/* Foto de perfil */}
      <Pressable onPress={handleChangeProfileImage} style={styles.avatarContainer}>
        {editProfileImage ? (
          <Image source={{ uri: editProfileImage }} style={styles.avatar} />
        ) : profile.profileImage ? (
          <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        {<Text style={styles.changePhotoText}>Cambiar foto</Text>}
      </Pressable>

      {/* Tarjeta de mascotas */}
      <Pressable style={styles.petCard} onPress={goToMascotas}>
        <Text style={styles.petCount}>
          {petCount} {petCount === 1 ? 'mascota registrada' : 'mascotas registradas'}
        </Text>
        <Text style={styles.verMascotasLink}>Ver mascotas</Text>
      </Pressable>

      {/* Datos del perfil */}
      <View style={styles.infoContainer}>
        {
          <>
            <EditRow label="Nombre" value={editNombre} onChangeText={setEditNombre} placeholder="Nombre" />
            <EditRow label="Apellido" value={editApellido} onChangeText={setEditApellido} placeholder="Apellido" />
            <EditRow label="Cédula" value={editCedula} onChangeText={setEditCedula} placeholder="Cédula" />
            <EditRow label="Email" value={editEmail} onChangeText={setEditEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
            <EditRow label="Teléfono" value={editTelefono} onChangeText={setEditTelefono} placeholder="Teléfono" keyboardType="phone-pad" />
            <EditRow label="Dirección" value={editDireccion} onChangeText={setEditDireccion} placeholder="Dirección" />
          </>}
      </View>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        {/* Botón Cambiar Contraseña - ancho completo */}
        <Pressable style={styles.buttonFullWidth} onPress={change_password}>
          <Text style={styles.buttonText}>Cambiar Contraseña</Text>
        </Pressable>

        {/* Contenedor para los dos botones en fila */}
        <View style={styles.rowButtons}>
          <Pressable 
            style={[styles.buttonHalf, styles.buttonSave]} 
            onPress={handleSave} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Guardar</Text>}
          </Pressable>
          <Pressable 
            style={[styles.buttonHalf, styles.buttonCerrarSesion]} 
            onPress={confirmLogout}
          >
            <Text style={styles.buttonText}>Cerrar Sesión</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

// Componentes auxiliares (InfoRow, EditRow) y estilos (igual que en la respuesta anterior)
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function EditRow({ label, value, onChangeText, placeholder, keyboardType = 'default', autoCapitalize = 'sentences' }: any) {
  return (
    <View style={styles.editRow}>
      <Ionicons name="person" size={15} color="#676767" />
      <Text style={styles.infoLabel}> {label}</Text>
      <TextInput
        style={styles.editInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#37513f', marginVertical: 10, textAlign: 'center' },
  button: {
    backgroundColor: '#4A3717',
    padding: 10,
    marginTop: 5,
    alignItems: 'center',
    borderRadius: 5,
  },
  textButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 5
  },
  petCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  petCount: {
    fontSize: 12,
  },
  verMascotasLink: {
    fontSize: 12,
    color: '#4e6e58',
    fontWeight: '500'
  },
  infoContainer: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',   // fondo suave
    borderRadius: 12,              // bordes redondeados
    borderBottomColor: '#F0F0F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,              // separación vertical entre filas
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d6d6d6ff',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d6d6d6a9',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#1E1E1E',
    marginLeft: 10
  },
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E0E0E0' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#4A3717', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 40, color: '#FFFFFF', fontWeight: 'bold' },
  changePhotoText: { marginTop: 8, fontSize: 14, color: '#4e6e58', textDecorationLine: 'underline' },
  infoLabel: { fontSize: 15, color: '#676767', fontWeight: '500', width: '30%' },
  infoValue: { fontSize: 15, color: '#1E1E1E', fontWeight: '400', flexShrink: 1, textAlign: 'right', width: '70%' },
  buttonEdit: { backgroundColor: '#4A3717', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonEditText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonDanger: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E53935', marginBottom: 30 },
  buttonDangerText: { color: '#E53935', fontSize: 16, fontWeight: '600' },
  editButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, gap: 12 },
  buttonSaveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonCancel: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#A8A8A9' },
  buttonCancelText: { color: '#676767', fontSize: 16, fontWeight: '600' },
    buttonContainer: {
    marginTop: 10,
    gap: 12,
  },
  buttonFullWidth: {
    backgroundColor: '#4A3717',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 50,
  },
  buttonHalf: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSave: {
    backgroundColor: '#4A3717',
  },
  buttonCerrarSesion: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

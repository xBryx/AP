import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../constants/AuthContext";
import { supabase } from "../../lib/supabase";

// Tipo para los datos del perfil
type Profile = {
  nombre: string;
  cedula: string;
  email: string;
  telefono: string;
  direccion: string;
  profileImage: string; // URI de la foto
};

const getImageExtension = (uri: string) => {
  const cleanUri = uri.split("?")[0];
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  if (!extension || extension.length > 5) {
    return "jpg";
  }

  if (extension === "jpeg") {
    return "jpg";
  }

  return extension;
};

const getImageContentType = (extension: string) => {
  if (extension === "jpg") {
    return "image/jpeg";
  }

  return `image/${extension}`;
};

// Perfil falso por defecto (se usará si no hay ninguno guardado)
const DEFAULT_PROFILE: Profile = {
  nombre: "Ana",
  cedula: "123456789",
  email: "ana.garcia@example.com",
  telefono: "61234567",
  direccion: "Calle Principal 123, Madrid",
  profileImage: "",
};

const EMPTY_PROFILE: Profile = {
  nombre: "",
  cedula: "",
  email: "",
  telefono: "",
  direccion: "",
  profileImage: "",
};

export default function HomeScreen() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [petCount, setPetCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estado local del perfil
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  // Estado para edición
  const [editNombre, setEditNombre] = useState("");
  const [editCedula, setEditCedula] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editDireccion, setEditDireccion] = useState("");
  const [editProfileImage, setEditProfileImage] = useState("");

  const resetProfileState = useCallback(() => {
    setProfile(EMPTY_PROFILE);
    setEditNombre("");
    setEditCedula("");
    setEditEmail("");
    setEditTelefono("");
    setEditDireccion("");
    setEditProfileImage("");
    setPetCount(0);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      resetProfileState();
      router.replace("/(auth)/login");
    }
  }, [authLoading, resetProfileState, user]);

  const loadProfile = useCallback(async () => {
    if (!supabase || !user?.id) {
      resetProfileState();
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profile")
        .select("full_name, identification, email, phone, address, image_url")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const profileFromDb: Profile = {
        nombre: data?.full_name ?? "",
        cedula: data?.identification ?? "",
        email: data?.email ?? user.email ?? "",
        telefono: data?.phone ?? "",
        direccion: data?.address ?? "",
        profileImage:
          data?.image_url && data.image_url !== "NULL" ? data.image_url : "",
      };

      setProfile(profileFromDb);
      setEditNombre(profileFromDb.nombre);
      setEditCedula(profileFromDb.cedula);
      setEditEmail(profileFromDb.email);
      setEditTelefono(profileFromDb.telefono);
      setEditDireccion(profileFromDb.direccion);
      setEditProfileImage(profileFromDb.profileImage);
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "No se pudo cargar el perfil del usuario.");
    }
  }, [resetProfileState, user?.email, user?.id]);

  const loadPetCount = useCallback(async () => {
    if (!supabase || !user?.id) {
      setPetCount(0);
      return;
    }

    try {
      const { count, error } = await supabase
        .from("pet")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("active", true);

      if (error) {
        throw error;
      }

      setPetCount(count ?? 0);
    } catch (error) {
      console.error("Error loading pet count:", error);
      setPetCount(0);
    }
  }, [user?.id]);

  const uploadProfilePhoto = useCallback(
    async (imageUri: string) => {
      if (!supabase || !user?.id) {
        throw new Error("No se encontró una sesión activa.");
      }

      if (!imageUri || imageUri.startsWith("http")) {
        return imageUri;
      }

      const extension = getImageExtension(imageUri);
      const contentType = getImageContentType(extension);
      const safeEmail = (user.email ?? user.id)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const objectPath = `${user.id}/${safeEmail}_profile_photo.${extension}`;

      const imageResponse = await fetch(imageUri);
      const imageArrayBuffer = await imageResponse.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(objectPath, imageArrayBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(objectPath);

      return data.publicUrl;
    },
    [user?.email, user?.id],
  );

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadPetCount();
    }, [loadPetCount, loadProfile]),
  );

  const handleChangeProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería.");
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

  const handleNombreChange = (text: string) => {
    // Permite solo letras y espacios
    const sanitized = text.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");
    setEditNombre(sanitized);
  };

  const handleCedulaChange = (text: string) => {
    // Solo números, sin límite superior aquí; se valida en guardar
    const sanitized = text.replace(/\D/g, "");
    setEditCedula(sanitized);
  };

  const handleTelefonoChange = (text: string) => {
    // Solo números y máximo 8 dígitos
    const sanitized = text.replace(/\D/g, "").slice(0, 8);
    setEditTelefono(sanitized);
  };

  const isValidNombre = (value: string) => {
    const trimmed = value.trim();
    return (
      /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(trimmed) &&
      /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(trimmed)
    );
  };

  const isValidCedula = (value: string) => {
    const trimmed = value.trim();
    return /^\d{9,}$/.test(trimmed);
  };

  const isValidEmail = (value: string) => {
    const trimmed = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const isValidTelefono = (value: string) => {
    const trimmed = value.trim();
    return /^\d{8}$/.test(trimmed);
  };

  const handleSave = async () => {
    if (
      !editNombre.trim() ||
      !editCedula.trim() ||
      !editEmail.trim() ||
      !editTelefono.trim() ||
      !editDireccion.trim()
    ) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    if (!isValidNombre(editNombre)) {
      Alert.alert("Error", "El nombre solo puede contener letras");
      return;
    }

    if (!isValidCedula(editCedula)) {
      Alert.alert(
        "Error",
        "La cédula debe contener solo números y mínimo 9 dígitos",
      );
      return;
    }

    if (!isValidEmail(editEmail)) {
      Alert.alert("Error", "El email no tiene un formato válido");
      return;
    }

    if (!isValidTelefono(editTelefono)) {
      Alert.alert(
        "Error",
        "El teléfono debe contener solo 8 dígitos numéricos",
      );
      return;
    }

    if (!supabase || !user?.id) {
      Alert.alert("Error", "No se encontró una sesión activa.");
      return;
    }

    setLoading(true);
    let profileImageUrl = profile.profileImage;

    if (editProfileImage && editProfileImage !== profile.profileImage) {
      try {
        profileImageUrl = await uploadProfilePhoto(editProfileImage);
      } catch (error) {
        console.error("Error uploading profile photo:", error);
        Alert.alert("Error", "No se pudo subir la foto de perfil.");
        setLoading(false);
        return;
      }
    }

    const updatedProfile: Profile = {
      nombre: editNombre.trim(),
      cedula: editCedula.trim(),
      email: editEmail.trim(),
      telefono: editTelefono.trim(),
      direccion: editDireccion.trim(),
      profileImage: profileImageUrl,
    };
    try {
      const { error } = await supabase
        .from("profile")
        .update({
          full_name: updatedProfile.nombre,
          identification: updatedProfile.cedula,
          email: updatedProfile.email,
          phone: updatedProfile.telefono,
          address: updatedProfile.direccion,
          image_url: updatedProfile.profileImage || null,
          last_update: new Date().toISOString(),
        })
        .eq("auth_id", user.id);

      if (error) {
        throw error;
      }

      setProfile(updatedProfile);
  setEditProfileImage(updatedProfile.profileImage);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "No se pudo guardar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile.nombre;

  const goToMascotas = () => {
    router.push("/mascotas");
  };

  const change_password = () => {
    router.push("/(auth)/change_password");
  };

  const confirmLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, cerrar",
        onPress: async () => {
          try {
            await signOut();
            resetProfileState();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Error closing session:", error);
            Alert.alert("Error", "No se pudo cerrar la sesión.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Perfil</Text>
        {/* Foto de perfil */}
        <Pressable
          onPress={handleChangeProfileImage}
          style={styles.avatarContainer}
        >
          {editProfileImage ? (
            <Image source={{ uri: editProfileImage }} style={styles.avatar} />
          ) : profile.profileImage ? (
            <Image
              source={{ uri: profile.profileImage }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {<Text style={styles.changePhotoText}>Cambiar foto</Text>}
        </Pressable>

        {/* Tarjeta de mascotas */}
        <Pressable style={styles.petCard} onPress={goToMascotas}>
          <Text style={styles.petCount}>
            {petCount}{" "}
            {petCount === 1 ? "mascota registrada" : "mascotas registradas"}
          </Text>
          <Text style={styles.verMascotasLink}>Ver mascotas</Text>
        </Pressable>

        {/* Datos del perfil */}
        <View style={styles.infoContainer}>
          {
            <>
              <EditRow
                label="Nombre"
                value={editNombre}
                onChangeText={handleNombreChange}
                placeholder="Nombre"
                autoCapitalize="words"
              />
              <EditRow
                label="Cédula"
                value={editCedula}
                onChangeText={handleCedulaChange}
                placeholder="Cédula"
                keyboardType="number-pad"
              />
              <EditRow
                label="Email"
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <EditRow
                label="Teléfono"
                value={editTelefono}
                onChangeText={handleTelefonoChange}
                placeholder="Teléfono"
                keyboardType="number-pad"
              />
              <EditRow
                label="Dirección"
                value={editDireccion}
                onChangeText={setEditDireccion}
                placeholder="Dirección"
              />
            </>
          }
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
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Guardar</Text>
              )}
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

function EditRow({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: any) {
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#37513f",
    marginVertical: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4A3717",
    padding: 10,
    marginTop: 5,
    alignItems: "center",
    borderRadius: 5,
  },
  textButton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#A8A8A9",
    backgroundColor: "#f3f3f3",
    color: "#676767",
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 5,
  },
  petCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  petCount: {
    fontSize: 12,
  },
  verMascotasLink: {
    fontSize: 12,
    color: "#4e6e58",
    fontWeight: "500",
  },
  infoContainer: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9", // fondo suave
    borderRadius: 12, // bordes redondeados
    borderBottomColor: "#F0F0F0",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12, // separación vertical entre filas
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d6d6d6ff",
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d6d6d6a9",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    color: "#1E1E1E",
    marginLeft: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4A3717",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { fontSize: 40, color: "#FFFFFF", fontWeight: "bold" },
  changePhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: "#4e6e58",
    textDecorationLine: "underline",
  },
  infoLabel: {
    fontSize: 15,
    color: "#676767",
    fontWeight: "500",
    width: "30%",
  },
  infoValue: {
    fontSize: 15,
    color: "#1E1E1E",
    fontWeight: "400",
    flexShrink: 1,
    textAlign: "right",
    width: "70%",
  },
  buttonEdit: {
    backgroundColor: "#4A3717",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonEditText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  buttonDanger: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E53935",
    marginBottom: 30,
  },
  buttonDangerText: { color: "#E53935", fontSize: 16, fontWeight: "600" },
  editButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 12,
  },
  buttonSaveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  buttonCancel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A8A8A9",
  },
  buttonCancelText: { color: "#676767", fontSize: 16, fontWeight: "600" },
  buttonContainer: {
    marginTop: 10,
    gap: 12,
  },
  buttonFullWidth: {
    backgroundColor: "#4A3717",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 50,
  },
  buttonHalf: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonSave: {
    backgroundColor: "#4A3717",
  },
  buttonCerrarSesion: {
    backgroundColor: "#E53935",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cargar el perfil del usuario.",
      });
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
      Toast.show({
        type: "info",
        text1: "Permiso denegado",
        text2: "Necesitamos acceso a tu galeria.",
      });
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

  const hasChanges =
    editNombre.trim() !== profile.nombre ||
    editCedula.trim() !== profile.cedula ||
    editEmail.trim() !== profile.email ||
    editTelefono.trim() !== profile.telefono ||
    editDireccion.trim() !== profile.direccion ||
    (editProfileImage !== "" && editProfileImage !== profile.profileImage);

  const handleSave = async () => {
    if (
      !editNombre.trim() ||
      !editCedula.trim() ||
      !editEmail.trim() ||
      !editTelefono.trim() ||
      !editDireccion.trim()
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Todos los campos son obligatorios",
      });
      return;
    }

    if (!hasChanges) {
      Toast.show({
        type: "info",
        text1: "Sin cambios",
        text2: "No has modificado ningún dato del perfil.",
      });
      return;
    }

    if (!isValidNombre(editNombre)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El nombre solo puede contener letras",
      });
      return;
    }

    if (!isValidCedula(editCedula)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "La cedula debe contener solo numeros y minimo 9 digitos",
      });
      return;
    }

    if (!isValidEmail(editEmail)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El email no tiene un formato valido",
      });
      return;
    }

    if (!isValidTelefono(editTelefono)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El telefono debe contener solo 8 digitos numericos",
      });
      return;
    }

    if (!supabase || !user?.id) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se encontro una sesion activa.",
      });
      return;
    }

    setLoading(true);
    let profileImageUrl = profile.profileImage;

    if (editProfileImage && editProfileImage !== profile.profileImage) {
      try {
        profileImageUrl = await uploadProfilePhoto(editProfileImage);
      } catch (error) {
        console.error("Error uploading profile photo:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudo subir la foto de perfil.",
        });
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
      Toast.show({
        type: "success",
        text1: "Éxito",
        text2: "Perfil actualizado correctamente",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo guardar el perfil.",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile.nombre;

  const goToMascotas = () => {
    router.push("/(tabs)/mascotas");
  };

  const change_password = () => {
    router.push("/(tabs)/cambiar_password");
  };

  const confirmLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowLogoutDialog(false);
      resetProfileState();
      Toast.show({
        type: "success",
        text1: "Sesion cerrada",
        text2: "Vuelve pronto.",
      });
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error closing session:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cerrar la sesion.",
      });
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.headerSideSpace} />
          <Text style={styles.headerTitle}>Perfil</Text>
          <Pressable
            onPress={confirmLogout}
            style={styles.logoutButton}
            android_ripple={{ color: "#f4d3d3", borderless: true }}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Ionicons name="log-out-outline" size={28} color="#E53935" />
          </Pressable>
        </View>
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

        {hasChanges && (
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={16} color="#f57c00" />
            <Text style={styles.warningText}>
              Tienes cambios pendientes de guardar
            </Text>
          </View>
        )}

        {/* Botones */}
        <View style={styles.buttonContainer}>
          {/* Botón Cambiar Contraseña - ancho completo */}
          <Pressable style={styles.buttonFullWidth} onPress={change_password}>
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          </Pressable>

          <Pressable
            style={[styles.buttonFullWidth, { marginBottom: 50 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Guardar</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={showLogoutDialog}
        onRequestClose={() => setShowLogoutDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cerrar sesion</Text>
            <Text style={styles.modalMessage}>
              Estas seguro de que quieres salir?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLogoutDialog(false)}
              >
                <Text style={styles.modalButtonCancelText}>No</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonConfirmText}>Si, cerrar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    marginTop: 16,
    marginBottom: 14,
  },
  headerSideSpace: {
    width: 44,
  },
  headerTitle: {
    flex: 1,
    fontSize: 32,
    fontWeight: "bold",
    color: "#37513f",
    textAlign: "center",
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff3e0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ffe0b2",
    gap: 6,
  },
  warningText: {
    color: "#e65100",
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#37513f",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  modalButtonCancel: {
    backgroundColor: "#e4e4e4",
  },
  modalButtonCancelText: {
    color: "#555",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalButtonConfirm: {
    backgroundColor: "#D9534F",
  },
  modalButtonConfirmText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

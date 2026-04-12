import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../../constants/AuthContext";
import { supabase } from "../../lib/supabase";

const noNulos = (texto: string): boolean => {
  return texto.trim() !== "";
};

const soloLetras = (texto: string, nombreCampo: string): boolean => {
  if (/^[A-Za-z\s]*$/.test(texto)) {
    return true;
  } else {
    Alert.alert("Error", "Solo se permiten letras en " + nombreCampo);
    return false;
  }
};
const soloNumeros = (numero: string, nombreCampo: string): boolean => {
  if (/^[0-9]*$/.test(numero)) {
    return true;
  } else {
    Alert.alert("Error", "Solo se permiten números en " + nombreCampo);
    return false;
  }
};
const numerosYletras = (texto: string, nombreCampo: string): boolean => {
  if (/^[A-Za-z0-9]*$/.test(texto)) {
    return true;
  } else {
    Alert.alert(
      "Error",
      "No se permiten caracteres especiales en " + nombreCampo,
    );
    return false;
  }
};
const MascotaCard = ({
  item,
  handleEdit,
  handleReserve,
  handleDelete,
}: any) => {
  const [expandedVaccines, setExpandedVaccines] = useState(false);
  const [expandedConditions, setExpandedConditions] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState(false);

  const hasVetName = !!item.veterinarian_name;
  const hasVetContact = !!item.veterinarian_contact;
  let vetDisplay = "No especificado";
  if (hasVetName && hasVetContact) {
    vetDisplay = `${item.veterinarian_name} | ${item.veterinarian_contact}`;
  } else if (hasVetName) {
    vetDisplay = item.veterinarian_name;
  } else if (hasVetContact) {
    vetDisplay = item.veterinarian_contact;
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.avatarContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.avatarMascota}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {item.name ? item.name.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.nombreMascota}>{item.name}</Text>
          <Text style={styles.infoMascota}>
            {item.species?.name} | {item.race}
          </Text>
          <Text style={styles.infoMascota}>
            {item.sex === "M" ? "Macho" : "Hembra"} | {item.age} meses
          </Text>
          <Text style={styles.infoMascota}>Tamaño: {item.size}</Text>
        </View>
        <Pressable onPress={() => handleDelete(item)} style={styles.deleteIcon}>
          <Ionicons name="trash-outline" size={24} color="#4A5B4D" />
        </Pressable>
      </View>

      <View style={styles.cardContentRow}>
        <View style={styles.cardColumn}>
          <Text style={styles.sectionTitle}>Salud</Text>
          <View style={styles.divider} />
          <Text style={styles.itemLabel}>Vacunas al día</Text>
          <Text style={styles.itemValue}>{item.vaccinated ? "Sí" : "No"}</Text>

          {item.vaccine_detail ? (
            <View style={styles.accordionContainer}>
              <Pressable
                style={styles.accordionHeader}
                onPress={() => setExpandedVaccines(!expandedVaccines)}
              >
                <Text style={styles.itemLabel}>Detalle Vacunas</Text>
                <Ionicons
                  name={expandedVaccines ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#333"
                />
              </Pressable>
              {expandedVaccines && (
                <Text style={styles.itemValue}>{item.vaccine_detail}</Text>
              )}
            </View>
          ) : (
            <Text style={[styles.itemLabel, { marginTop: 8 }]}>
              Detalle Vacunas: <Text style={styles.itemValue}>No tiene</Text>
            </Text>
          )}

          <Text style={[styles.itemLabel, { marginTop: 12 }]}>
            Condiciones Médicas
          </Text>
          <Text style={styles.itemValue}>
            {item.medical_conditions ? "Sí" : "No"}
          </Text>

          {item.medical_conditions_detail ? (
            <View style={styles.accordionContainer}>
              <Pressable
                style={styles.accordionHeader}
                onPress={() => setExpandedConditions(!expandedConditions)}
              >
                <Text style={styles.itemLabel}>Detalle Condiciones</Text>
                <Ionicons
                  name={expandedConditions ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#333"
                />
              </Pressable>
              {expandedConditions && (
                <Text style={styles.itemValue}>
                  {item.medical_conditions_detail}
                </Text>
              )}
            </View>
          ) : (
            <Text style={[styles.itemLabel, { marginTop: 8 }]}>
              Detalle Condiciones:{" "}
              <Text style={styles.itemValue}>No tiene</Text>
            </Text>
          )}
        </View>

        <View style={styles.cardColumn}>
          <Text style={styles.sectionTitle}>Cuidados</Text>
          <View style={styles.divider} />
          <Text style={styles.itemLabel}>Veterinario</Text>
          <Text style={styles.itemValue}>{vetDisplay}</Text>

          {item.special_deals ? (
            <View style={[styles.accordionContainer, { marginTop: 12 }]}>
              <Pressable
                style={styles.accordionHeader}
                onPress={() => setExpandedNotes(!expandedNotes)}
              >
                <Text style={styles.itemLabel}>Notas</Text>
                <Ionicons
                  name={expandedNotes ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#333"
                />
              </Pressable>
              {expandedNotes && (
                <Text style={styles.itemValue}>{item.special_deals}</Text>
              )}
            </View>
          ) : (
            <Text style={[styles.itemLabel, { marginTop: 12 }]}>
              Notas: <Text style={styles.itemValue}>No especificadas</Text>
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actionButtonsRow}>
        <Pressable
          style={[styles.actionButton, styles.buttonEdit]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.buttonReserve]}
          onPress={() => handleReserve(item)}
        >
          <Text style={styles.actionButtonText}>Hacer Reserva</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [mascotas, setMascotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"misMascotas" | "agregar">(
    "misMascotas",
  );

  const [especies, setEspecies] = useState<any[]>([]);

  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState("");
  const [raza, setRaza] = useState("");
  const [edad, setEdad] = useState<number | "">("");
  const [sexo, setSexo] = useState("Macho");
  const [tamano, setTamano] = useState("Mediano");
  const [vacunas, setVacunas] = useState(false);
  const [notaVacunas, setNotaVacunas] = useState("");
  const [condMedicas, setcondMedicas] = useState(false);
  const [notaCondMedicas, setNotasCondMedicas] = useState("");
  const [vetNombre, setVetNombre] = useState("");
  const [vetContacto, setVetContacto] = useState("");
  const [nota, setNota] = useState("");
  const [petImage, setPetImage] = useState("");

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [mascotaToCancel, setMascotaToCancel] = useState<any>(null);

  const [editingMascotaId, setEditingMascotaId] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setEditingMascotaId(null);
    setNombre("");
    if (especies.length > 0) setEspecie(especies[0].id);
    setRaza("");
    setEdad("");
    setSexo("Macho");
    setTamano("Mediano");
    setVacunas(false);
    setNotaVacunas("");
    setcondMedicas(false);
    setNotasCondMedicas("");
    setVetNombre("");
    setVetContacto("");
    setNota("");
    setPetImage("");
  }, [especies]);

  const loadPets = useCallback(async () => {
    if (!session?.user?.id || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pet")
        .select("*, species(name)")
        .eq("user_id", session.user.id)
        .eq("active", true)
        .order("creation_date", { ascending: false });

      if (error) throw error;
      setMascotas(data || []);
    } catch (err: any) {
      Alert.alert("Error", "Error al cargar mascotas: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const loadSpecies = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from("species").select("*");
      if (error) throw error;
      setEspecies(data || []);
      if (data && data.length > 0) setEspecie(data[0].id);
    } catch (err: any) {
      console.log(err.message);
    }
  }, []);

  useEffect(() => {
    loadPets();
    loadSpecies();
  }, [loadPets, loadSpecies]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPets();
    setRefreshing(false);
  }, [loadPets]);

  const handleEdit = (mascota: any) => {
    setEditingMascotaId(mascota.id);
    setNombre(mascota.name || "");
    setEspecie(mascota.species_id || "");
    setRaza(mascota.race || "");
    setEdad(mascota.age != null ? mascota.age.toString() : "");
    setSexo(mascota.sex === "M" ? "Macho" : "Hembra");
    setTamano(mascota.size || "Mediano");
    setVacunas(mascota.vaccinated || false);
    setNotaVacunas(mascota.vaccine_detail || "");
    setcondMedicas(mascota.medical_conditions || false);
    setNotasCondMedicas(mascota.medical_conditions_detail || "");
    setVetNombre(mascota.veterinarian_name || "");
    setVetContacto(mascota.veterinarian_contact || "");
    setNota(mascota.special_deals || "");
    setPetImage(mascota.image_url || "");
    setActiveTab("agregar");
  };

  const handleReserve = (mascota: any) => {
    router.push({
      pathname: "/(tabs)/reservas",
      params: { action: "nueva", petId: mascota.id },
    });
  };

  const confirmDeleteMascota = (mascota: any) => {
    setMascotaToCancel(mascota);
    setCancelModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!mascotaToCancel || !supabase) return;
    try {
      const { error } = await supabase
        .from("pet")
        .update({ active: false })
        .eq("id", mascotaToCancel.id);
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Toast.show({
          type: "success",
          text1: "Mascota eliminada",
          text2: "La mascota se eliminó correctamente.",
        });
        loadPets();
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setCancelModalVisible(false);
      setMascotaToCancel(null);
    }
  };

  const handleCloseModal = () => {
    setCancelModalVisible(false);
    setMascotaToCancel(null);
  };

  const handleAddMascota = async () => {
    if (
      !noNulos(nombre) ||
      !noNulos(raza) ||
      edad === "" ||
      !noNulos(especie)
    ) {
      Alert.alert("Error", "Por favor complete los campos obligatorios.");
      return;
    }
    if (!session?.user?.id || !supabase) return;

    try {
      const payload = {
        user_id: session.user.id,
        species_id: especie,
        race: raza,
        name: nombre,
        age: Number(edad),
        sex: sexo.charAt(0), // 'M' o 'H'
        size: tamano,
        image_url: petImage || null,
        vaccinated: vacunas,
        vaccine_detail: vacunas ? notaVacunas : null,
        medical_conditions: condMedicas,
        medical_conditions_detail: condMedicas ? notaCondMedicas : null,
        veterinarian_name: vetNombre || null,
        veterinarian_contact: vetContacto || null,
        special_deals: nota || null,
      };

      let error;
      if (editingMascotaId) {
        const res = await supabase
          .from("pet")
          .update(payload)
          .eq("id", editingMascotaId);
        error = res.error;
      } else {
        const res = await supabase.from("pet").insert(payload);
        error = res.error;
      }

      if (error) throw error;
      Toast.show({
        type: "success",
        text1: editingMascotaId
          ? "Mascota actualizada"
          : "Mascota guardada exitosamente",
      });
      resetForm();
      setActiveTab("misMascotas");
      loadPets();
    } catch (err: any) {
      Alert.alert("Error al guardar", err.message);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permiso Denegado",
        "Se necesita permiso para usar la cámara.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPetImage(result.assets[0].uri);
    }
  };

  const renderMisMascotas = () => {
    return (
      <FlatList
        data={mascotas}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#4A3717"
              style={styles.loader}
            />
          ) : (
            <Text style={styles.emptyText}>No hay mascotas registradas</Text>
          )
        }
        renderItem={({ item }) => (
          <MascotaCard
            item={item}
            handleEdit={handleEdit}
            handleReserve={handleReserve}
            handleDelete={confirmDeleteMascota}
          />
        )}
      />
    );
  };

  const renderAgregar = () => (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Pressable
          onPress={handlePickImage}
          style={styles.formAvatarPlaceholder}
        >
          {petImage ? (
            <Image source={{ uri: petImage }} style={styles.formAvatarImage} />
          ) : (
            <Ionicons name="person-outline" size={40} color="#7a5c37" />
          )}
        </Pressable>
      </View>

      <TextInput
        style={styles.inputStyle}
        placeholder="Nombre"
        value={nombre}
        onChangeText={(text) => {
          if (soloLetras(text, "nombre")) setNombre(text);
        }}
      />

      <View style={styles.formRow}>
        <View style={styles.formCol}>
          <Dropdown
            style={styles.dropdown}
            data={especies}
            labelField="name"
            valueField="id"
            placeholder="Especie"
            value={especie}
            onChange={(item) => setEspecie(item.id)}
            placeholderStyle={{ color: "#888", fontSize: 14 }}
            selectedTextStyle={{ color: "#333", fontSize: 14 }}
          />
        </View>
        <View style={styles.formCol}>
          <TextInput
            style={styles.inputStyle}
            placeholder="Raza"
            value={raza}
            onChangeText={(text) => {
              if (soloLetras(text, "raza")) setRaza(text);
            }}
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formCol}>
          <TextInput
            style={styles.inputStyle}
            placeholder="Edad (Meses)"
            value={edad.toString()}
            keyboardType="numeric"
            onChangeText={(text) => setEdad(text ? Number(text) : "")}
          />
        </View>
        <View style={styles.formCol}>
          <Dropdown
            style={styles.dropdown}
            data={[
              { label: "Macho", value: "Macho" },
              { label: "Hembra", value: "Hembra" },
            ]}
            labelField="label"
            valueField="value"
            placeholder="Sexo"
            value={sexo}
            onChange={(item) => setSexo(item.value)}
            placeholderStyle={{ color: "#888", fontSize: 14 }}
            selectedTextStyle={{ color: "#333", fontSize: 14 }}
          />
        </View>
      </View>

      <View style={styles.sizeContainer}>
        {["Pequeño", "Mediano", "Grande"].map((size) => (
          <Pressable
            key={size}
            style={[
              styles.sizeButton,
              tamano === size && styles.sizeButtonActive,
            ]}
            onPress={() => setTamano(size)}
          >
            <Text
              style={tamano === size ? styles.sizeTextActive : styles.sizeText}
            >
              {size}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.switchRowContainer}>
        <Text style={styles.switchLabel}>Vacunas al dia</Text>
        <Switch
          value={vacunas}
          onValueChange={setVacunas}
          thumbColor="#fff"
          trackColor={{ false: "#ccc", true: "#4A5B4D" }}
        />
      </View>

      {vacunas && (
        <TextInput
          style={styles.inputStyle}
          placeholder="Especificar Vacunas (Opcional)"
          value={notaVacunas}
          onChangeText={setNotaVacunas}
        />
      )}

      <View style={styles.switchRowContainer}>
        <Text style={styles.switchLabel}>Condiciones Medicas</Text>
        <Switch
          value={condMedicas}
          onValueChange={setcondMedicas}
          thumbColor="#fff"
          trackColor={{ false: "#ccc", true: "#4A5B4D" }}
        />
      </View>

      {condMedicas && (
        <TextInput
          style={styles.inputStyle}
          placeholder="Especificar Condiciones Medicas (Opcional)"
          value={notaCondMedicas}
          onChangeText={setNotasCondMedicas}
        />
      )}

      <TextInput
        style={styles.inputStyle}
        placeholder="Nombre del Veterinario (Opcional)"
        value={vetNombre}
        onChangeText={setVetNombre}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder="Contacto del veterinario (Opcional)"
        value={vetContacto}
        onChangeText={setVetContacto}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder="Notas especiales (Opcional)"
        value={nota}
        onChangeText={setNota}
      />

      <Pressable style={styles.button} onPress={handleAddMascota}>
        <Text style={styles.textButton}>
          {editingMascotaId ? "Actualizar Mascota" : "Guardar Mascota"}
        </Text>
      </Pressable>

      {editingMascotaId && (
        <Pressable
          style={[styles.button, { backgroundColor: "#ccc", marginTop: 0 }]}
          onPress={() => {
            resetForm();
            setActiveTab("misMascotas");
          }}
        >
          <Text style={[styles.textButton, { color: "#333" }]}>
            Cancelar Edición
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Mascotas</Text>

        <View style={styles.mainTabsContainer}>
          <Pressable
            style={[
              styles.selectorButton,
              styles.selectorButtonMain,
              activeTab === "misMascotas" && styles.activeSelectorButton,
            ]}
            onPress={() => setActiveTab("misMascotas")}
          >
            <Text
              style={[
                styles.selectorButtonTextMain,
                activeTab === "misMascotas" && styles.activeSelectorButtonText,
              ]}
            >
              Mis mascotas
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.selectorButton,
              styles.selectorButtonMain,
              activeTab === "agregar" && styles.activeSelectorButton,
            ]}
            onPress={() => setActiveTab("agregar")}
          >
            <Text
              style={[
                styles.selectorButtonTextMain,
                activeTab === "agregar" && styles.activeSelectorButtonText,
              ]}
            >
              Añadir mascotas
            </Text>
          </Pressable>
        </View>

        <View style={[styles.content, { paddingBottom: 0 }]}>
          {activeTab === "misMascotas" ? renderMisMascotas() : renderAgregar()}
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Eliminar Mascota</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que deseas eliminar a {mascotaToCancel?.name}?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalButtonCancelText}>No</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalButtonConfirmText}>Sí, eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#37513f",
    marginTop: 16,
    marginBottom: 14,
    textAlign: "center",
  },
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  mainTabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: "#e4e4e4ff",
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  selectorButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginVertical: 2,
  },
  selectorButtonMain: {
    flexBasis: "49%",
  },
  activeSelectorButton: { backgroundColor: "#ffffffff" },
  selectorButtonTextMain: { fontSize: 13, color: "#555", textAlign: "center" },
  activeSelectorButtonText: { color: "#000000ff", fontWeight: "bold" },
  content: { flex: 1, paddingHorizontal: 16 },
  loader: { marginTop: 40 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#888" },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 7,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarMascota: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "flex-start",
    marginLeft: 10,
  },
  nombreMascota: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#37513F",
  },
  infoMascota: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
  },
  deleteIcon: {
    padding: 6,
  },
  cardContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardColumn: {
    flex: 1,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#CCC",
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  itemValue: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
    fontWeight: "normal",
  },
  accordionContainer: {
    marginTop: 8,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonEdit: {
    backgroundColor: "#4A3717",
  },
  buttonReserve: {
    backgroundColor: "#4A3717",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
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
  button: {
    backgroundColor: "#4A3717",
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 10,
  },
  textButton: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  sizeContainer: {
    flexDirection: "row",
    backgroundColor: "#d9d9d9",
    borderRadius: 20,
    padding: 5,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sizeButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  sizeButtonActive: {
    backgroundColor: "#ffffff",
  },
  sizeText: {
    color: "#333",
  },
  sizeTextActive: {
    fontWeight: "bold",
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
  formAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  formAvatarImage: {
    width: "100%",
    height: "100%",
  },
  inputStyle: {
    borderWidth: 1,
    borderColor: "#c0c0c0ff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    height: 50,
    backgroundColor: "#e4e4e4ff",
    fontSize: 14,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  formCol: {
    flex: 0.48,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
    height: 50,
    justifyContent: "center",
  },
  dropdown: {
    width: "100%",
    height: 50,
    borderColor: "#c0c0c0ff",
    backgroundColor: "#e4e4e4ff",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  switchRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: 14,
    color: "#333",
    marginRight: 10,
  },
});

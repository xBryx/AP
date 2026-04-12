import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { View, Text, Pressable, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Switch } from "react-native";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const noNulos = (texto: string): boolean => {
  return texto.trim() !== "";
};

const soloLetras = (texto: string, nombreCampo: string): boolean => {
  if (/^[A-Za-z]*$/.test(texto)) {
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
      "No se permiten caracteres especiales en " + nombreCampo
    );
    return false;
  }
};
export default function HomeScreen() {
  const [mascotas, setMascotas] = useState([
    {
      id: 1,
      nombre: "Max",
      tipo: "Perro",
      raza: "Labrador",
      edad: "3 años",
      vacunas: true,
      condicionesMedicas: "Ninguna",
      veterinario: "Dr. Pérez",
      numeroVeterinario: "8888-8888",
      notas: "Muy juguetón",
      profileImage: "",
    },
    {
      id: 2,
      nombre: "juan",
      tipo: "Perro",
      raza: "Labrador",
      edad: "3 años",
      vacunas: true,
      condicionesMedicas: "Ninguna",
      veterinario: "Dr. Pérez",
      numeroVeterinario: "8888-8888",
      notas: "Muy juguetón",
      profileImage: "",
    },
  ]);
  const especies = [
    { label: "Perro", value: "perro" },
    { label: "Gato", value: "gato" },
    { label: "Ave", value: "ave" },
    { label: "Conejo", value: "conejo" },
  ];
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("misMascotas");
  //To do
  const handleEdit = (mascota) => {
    router.push("/mascota_edit");
  };

  const handleReserve = (mascota) => {
    //To do
    console.log("Reservar para:", mascota.nombre);
  };
  const handleDelete = (mascota) => {
    //To do
    console.log("Eliminar:", mascota.nombre);
  };

  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState("perro");
  const [raza, setRaza] = useState("");
  const [edad, setEdad] = useState<number>(1);
  const [sexo, setSexo] = useState("macho");
  const [tamano, setTamano] = useState("mediano");
  const [vacunas, setVacunas] = useState(false);
  const [notaVacunas, setNotaVacunas] = useState("");
  const [condMedicas, setcondMedicas] = useState(false);
  const [notaCondMedicas, setNotasCondMedicas] = useState("");
  const [vetNombre, setVetNombre] = useState("");
  const [vetContacto, setVetContacto] = useState<number>(0);
  const [nota, setNota] = useState("");
  const [petImage, setPetImage] = useState("");

  const handleAddMascota = () => {
    if (!noNulos(nombre)) {
      Alert.alert("Error", "No se permiten nulos en nombre");
      return;
    } else if (!noNulos(especie)) {
      Alert.alert("Error", "No se permiten nulos en apellido");
      return;
    } else if (!noNulos(raza)) {
      Alert.alert("Error", "cedula");
      return;
    } else if (!noNulos(edad.toString())) {
      Alert.alert("Error", "No se permiten nulos en teléfono");
      return;
    } else if (!noNulos(vetNombre)) {
      Alert.alert("Error", "No se permiten nulos en email");
      return;
    } else if (!noNulos(vetContacto.toString())) {
      Alert.alert("Error", "No se permiten nulos en teléfono");
      return;
    }
    const nuevaMascota = {
      nombre,
      especie,
      raza,
      edad,
      sexo,
      tamano,
      vacunas,
      notaVacunas,
      condMedicas,
      notaCondMedicas,
      vetNombre,
      vetContacto,
      nota,
      profileImage: petImage,
    };
  };
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setPetImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: "#FFFF" }}
      contentContainerStyle={{ justifyContent: "center" }}
    >
      
      {/* Switch del encabezado */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "misMascotas" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("misMascotas")}
        >
          <Text>Mis mascotas</Text>
        </Pressable>

        <Pressable
          style={[
            styles.tabButton,
            activeTab === "agregar" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("agregar")}
        >
          <Text>Añadir mascotas</Text>
        </Pressable>
      </View>
      {/*Comparación para saber que vista mostrar*/}
      {activeTab === "misMascotas" ? (
        <FlatList
          data={mascotas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.labelContainer}>
                {/* Nombre y raza */}
                <Text style={styles.nombreMascota}>{item.nombre}</Text>
              </View>
              <View style={styles.labelContainer}>
                {/*Foto de mascota*/}
                {item.profileImage ? (
                  <Image
                    source={{ uri: item.profileImage }}
                    style={styles.avatarMascota}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {item.nombre.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                {/* Información especie */}
                <Text>
                  {item.tipo} | {item.raza} | {item.edad}
                </Text>
                <Pressable
               
                  onPress={() => handleDelete(item)}
                > <MaterialIcons name="delete" size={24} color="black" />
                  
                </Pressable>
              </View>
              <View style={styles.labelContainer}>
                {/* Vacunas  e info veterinario */}
                <Text style={{ fontWeight: "bold", marginHorizontal: 20 }}>
                  Vacunas al día
                </Text>
                <Text style={{ fontWeight: "bold" }}>Veterinario/a</Text>
              </View>
              <View style={styles.labelContainer}>
                {item.vacunas === true ? (
                  <Text style={{ marginHorizontal: 20 }}>                            Sí           </Text>
                ) : (
                  <Text>                            No           </Text>
                )}
                <Text style={{ marginHorizontal: 20 }}>
                  {item.veterinario} | {item.numeroVeterinario}
                </Text>
              </View>
              {/* Condiciones médicas y notas */}
              <View style={styles.labelContainer}>
                <Text style={{ fontWeight: "bold", marginHorizontal: 20 }}>
                  Condiciones médicas
                </Text>
                <Text style={{ fontWeight: "bold", marginHorizontal: 20 }}>
                  Notas
                </Text>
              </View>
              <View style={styles.labelContainer}>
              <Text style={{marginHorizontal: 20}}>{item.condicionesMedicas} </Text>              
              <Text style={{marginHorizontal: 20}}>{item.notas}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  style={styles.button}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.textButton}>Editar</Text>
                </Pressable>

                <Pressable
                  style={styles.button}
                  onPress={() => handleReserve(item)}
                >
                  <Text style={styles.textButton}>Hacer Reserva</Text>
                </Pressable>                
              </View>
            </View>
          )}
        />
      ) : (
        <View>
          {/* AÑADIR MASCOTAS */}

          {/*Foto de mascota*/}
          <View style={{alignItems:"center"}}>
          <Pressable onPress={handlePickImage}>
             <Ionicons name="person" size={15} color="#676767" />
            
          </Pressable>
</View>
          {/* Nombre de mascota */}
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={(text) => {
              if (soloLetras(text, "nombre")) {
                setNombre(text);
              }
            }}
          />
          
          {/* Especie */}
          <View style={{flexDirection: "row", justifyContent: "center", gap: 10,}} >
            <View style={{flex:1}}>
          <Picker
            selectedValue={especie}
            onValueChange={(itemValue) => setEspecie(itemValue)}
          >
            <Picker.Item label="Seleccione especie" value="" />

            {especies.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />              
            ))}
          </Picker>
          </View>
          <View style={{flex:1}}>
          {/* Raza */}
          <TextInput
            style={styles.input}
            placeholder="Raza"
            value={raza}
            onChangeText={(text) => {
              if (soloLetras(text, "raza")) {
                setRaza(text);
              }
            }}
          />
          </View>
          </View>
          <View style={{flexDirection: "row", justifyContent: "center", gap: 10,}} >
            <View style={{flex:1}}>
          {/* Edad */}
          <TextInput
            style={styles.input}
            placeholder="Edad"
            value={edad.toString()}
            onChangeText={(text) => {
              if (soloNumeros(text, "edad")) {
                setEdad(Number(text));
              }
            }}            
          />
          </View>
          {/* Sexo */}
          <View style={{flex:1}}>
          <Picker
            selectedValue={sexo}
            onValueChange={(itemValue) => setSexo(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="Sexo" value="hembra" />
            <Picker.Item label="Hembra" value="hembra" />
            <Picker.Item label="Macho" value="macho" />
          </Picker>
          </View>
          </View>
          <View style={styles.switchContainer}>
            {/* Vacunas */}
            <Text>Vacunas al día</Text>
            <Switch
              value={vacunas}
              onValueChange={setVacunas}
              trackColor={{ false: "#ccc", true: "#4CAF50" }}
              thumbColor={vacunas ? "#fff" : "#fff"}
            />
          </View>

          {/*Solo se muestra si tiene las vacunas activas*/}
          {vacunas && (
            <TextInput
              style={styles.input}
              placeholder="Especificar vacunas"
              value={notaVacunas}
              onChangeText={(text) => {
                if (numerosYletras(text, "vacunas")) {
                  setNotaVacunas(text);
                }
              }}
            />
          )}
          {/* Condiciones médicas */}
          <View style={styles.switchContainer}>
            <Text>Condiciones Médicas</Text>
            <Switch
              value={condMedicas}
              onValueChange={setcondMedicas}
              trackColor={{ false: "#ccc", true: "#4CAF50" }}
              thumbColor={condMedicas ? "#fff" : "#fff"}
            />
          </View>

          {/*Solo se muestra si tiene condiciones médicas*/}
          {condMedicas && (
            <TextInput
              style={styles.input}
              placeholder="Especificar condiciones médicas"
              value={notaCondMedicas}
              onChangeText={(text) => {
                if (numerosYletras(text, "condiciones médicas")) {
                  setNotasCondMedicas(text);
                }
              }}
            />
          )}
          {/* Tamaño */}
          <View style={styles.sizeContainer}>
            {["pequeño", "mediano", "grande"].map((size) => (
              <Pressable
                key={size}
                style={[
                  styles.sizeButton,
                  tamano === size && styles.sizeButtonActive,
                ]}
                onPress={() => setTamano(size)}
              >
                <Text
                  style={
                    tamano === size ? styles.sizeTextActive : styles.sizeText
                  }
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
          {/* Info veterinario */}
          <TextInput
            style={styles.input}
            placeholder="Nombre del veterinario"
            value={vetNombre}
            onChangeText={(text) => {
              if (soloLetras(text, "veterinario")) {
                setVetNombre(text);
              }
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Contacto del veterinario"
            value={vetContacto.toString()}
            onChangeText={(text) => {
              if (soloNumeros(text, "numero veterinario")) {
                setVetContacto(Number(text));
              }
            }}
          />
          {/* Notas */}
          <TextInput
            style={styles.input}
            placeholder="Notas Adicionales"
            value={nota}
            onChangeText={setNota}
          />
          <Pressable style={styles.button} onPress={handleAddMascota}>
            <Text style={styles.textButton}>Guardar mascota</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
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
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dfe9ea",
    borderRadius: 8,
    paddingHorizontal: 30,
    backgroundColor: "#dfe9ea",
    marginBottom: 15,
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
  nameContainer: {
    color: "#37513f",
    flexDirection: "row",
    textAlign: "center",
    fontSize: 30,
    gap: 8,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    padding: 20,
  },
  titleContainer: {
    color: "#37513f",
    flexDirection: "row",
    textAlign: "center",
    fontSize: 30,
    gap: 8,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4A3717",
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  text: {
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 15,
  },
  textButton: {
    color: "#ffffff",
    marginBottom: 10,
    fontSize: 20,
  },
  textLink: {
    color: "#4e6e58",
    marginBottom: 10,
    fontSize: 15,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    borderRadius: 20,
    padding: 4,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#dfe9ea",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  nombreMascota: {
    color: "#37513f",
    flexDirection: "row",
    textAlign: "center",
    fontSize: 16,
    gap: 8,
    fontWeight: "bold",
  },
  sizeContainer: {
    flexDirection: "row",
    backgroundColor: "#d9d9d9",
    borderRadius: 20,
    padding: 5,
    justifyContent: "space-between",
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

  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  avatarMascota: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    marginBottom: 10,
  },

  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 10,
  },

  avatarInitial: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
});

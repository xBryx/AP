import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/logo_petlodge.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>Pet Lodge</Text>
      </View>
      <Text style={styles.subtitle}>
        Tu compañero de confianza para el cuidado de tus mascotas.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
  },
  logo: {
    width: 122,
    height: 96,
    marginRight: -6,
  },
  title: {
    color: "#000000",
    fontSize: 40,
    fontWeight: "bold",
    marginLeft: -4,
    zIndex: 2,
    fontFamily: "serif", // para que se asemeje a la imagen (tipo Times New Roman)
  },
  subtitle: {
    color: "#666666",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
});

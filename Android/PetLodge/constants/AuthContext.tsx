//Este archivo contiene lo necesario para validar la sesión del usuario
//Si esta logeado se guarda la información del usuario y se va a index
//Si no esta logeado se redirige a la pantalla de login
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

//Guardar los datos
type AuthType = {
  user: string | null; //Usuario
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthType | null>(null);

//Carga los datos del usuario sesión
export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<string | null>(null); //Usa un usuario o lo setea
  // Siempre se ejecuta al renderizar
  useEffect(() => { //useEffect = ejecutar código automatico
    const loadUser = async () => {
      //Obtener el dato de login anterior (Usuario Logeado)
      const storedUser = await AsyncStorage.getItem("user");
      //Si existe se setea para esta sesión, si no esta logeado se devuelve null
      if (storedUser) setUser(storedUser);
    };
    loadUser();
  }, []);

  //Lógica de login
  const login = async (username: string, password: string) => {
    // validación CAMBIAR ESTO LUEGO
    if (!(/^[0-9]+$/.test(username)) || !(/^[0-9]+$/.test(password))){
      return false
    }
    if (username === "admin" && password === "1234") {
      await AsyncStorage.setItem("user", username);
      setUser(username);
      return true;
    } //Intento fallido
    return false;
  };

  //Cerrar sesión
  const logout = async () => {
    //Eliminar información del usuario almacenada
    await AsyncStorage.removeItem("user");
    //Cambiar a nulo el usuario default
    setUser(null);
  };

  //Retornar las funciones necesarias y el usuario por defecto
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
//Para usar en todas las pantallas o vistas
export const useAuth = () => {
  return useContext(AuthContext)!;
};

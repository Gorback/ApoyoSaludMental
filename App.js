import React, { useState, createContext, useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, database as db } from "./config/firebase";

// Importa tus pantallas
import Chat from "./Screens/Chat";
import ChatProfesional from "./Screens/ChatProfesional";
import Login from "./Screens/Account/Login";
import LoginProfesional from "./Screens/Account/LoginProfesional";
import SignUp from "./Screens/Account/SignUp";
import SignUpProfesionales from "./Screens/Account/SignUpProfesionales";
import SignUpProfesionalesDetail from "./Screens/Account/SignUpProfesionalesDetail";
import Home from "./Screens/Home";
import HomeProfesional from "./Screens/HomeProfesional";
import OpcionesPerfil from "./Screens/OpcionesPerfil";
import PerfilVisualizadoPorProfesional from "./Screens/Perfil_Visualizado_Por_Usuario";
import RegistrosChat from "./Screens/RegistrosChat";
import OpcionesUsuarios from "./Screens/OpcionesUsuarios";
import RegistroChatProfesional from "./Screens/RegistroChatProfesional";
import Mercadopago from "./Screens/Mercadopago";
import PaymentStatusScreen from "./Screens/PaymentStatusScreen";

// Crear contextos y stack
const Stack = createNativeStackNavigator();
const AuthenticateUserContext = createContext({});

// Proveedor de contexto
const AuthenticateUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticateUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticateUserContext.Provider>
  );
};

// Stack para usuarios
function ChatStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="PerfilVisualizadoPorProfesional" component={PerfilVisualizadoPorProfesional} />
      <Stack.Screen name="RegistrosChat" component={RegistrosChat} />
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="OpcionesUsuarios" component={OpcionesUsuarios} />
      <Stack.Screen name="Mercadopago" component={Mercadopago} />
      <Stack.Screen name="PaymentStatusScreen" component={PaymentStatusScreen} />
    </Stack.Navigator>
  );
}

// Stack para profesionales
function ChatStackProfesional() {
  return (
    <Stack.Navigator initialRouteName="HomeProfesional">
      <Stack.Screen name="HomeProfesional" component={HomeProfesional} />
      <Stack.Screen name="ChatProfesional" component={ChatProfesional} />
      <Stack.Screen name="OpcionesPerfil" component={OpcionesPerfil} />
      <Stack.Screen name="RegistroChatProfesional" component={RegistroChatProfesional} />
    </Stack.Navigator>
  );
}

// Stack para autenticación
function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="LoginProfesional" component={LoginProfesional} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SignUpProfesionales" component={SignUpProfesionales} />
      <Stack.Screen name="SignUpProfesionalesDetail" component={SignUpProfesionalesDetail} />
    </Stack.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const { user, setUser } = useContext(AuthenticateUserContext);
  const [loading, setLoading] = useState(true);
  const [isProfesional, setIsProfesional] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      if (authenticatedUser) {
        const userId = authenticatedUser.uid;
        const profesionalDoc = await getDoc(doc(db, "profesionales", userId));
        setIsProfesional(profesionalDoc.exists());
        setUser(authenticatedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (isProfesional ? <ChatStackProfesional /> : <ChatStack />) : <AuthStack />}
    </NavigationContainer>
  );
}

// App principal
export default function App() {
  return (
    <AuthenticateUserProvider>
      <RootNavigator />
    </AuthenticateUserProvider>
  );
}

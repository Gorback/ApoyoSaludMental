import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useState, createContext, useContext, useEffect, Children } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";


import Chat from "./Screens/Chat";
import Login from './Screens/Login';
import SignUp from './Screens/SignUp'
import SignUpProfesionales from "./Screens/SignUpProfesionales";
import Home from './Screens/Home'
import { auth } from "./config/firebase";

const Stack = createNativeStackNavigator();
const AuthenticateUserContext = createContext({});

const AuthenticateUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticateUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticateUserContext.Provider>
  );
}


function ChatStack() {
  return (
    <Stack.Navigator defaultScreenOptions={Home}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Chat" component={Chat} />

    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator defaultScreenOptions={Login} screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SignUpProfesionales" component={SignUpProfesionales}/>
    </Stack.Navigator>
  );
}


function RootNavigator() {
  const { user, setUser } = useContext(AuthenticateUserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async authenticatedUser => {
      authenticatedUser ? setUser(authenticatedUser) : setUser(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <ChatStack /> : <AuthStack />}
    </NavigationContainer>
  );
}


export default function App() {
  return (
    <AuthenticateUserProvider>
      <RootNavigator />
    </AuthenticateUserProvider>
  )

}

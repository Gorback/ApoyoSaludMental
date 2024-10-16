import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth"; // Cambios
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importar AsyncStorage
import Constants from "expo-constants";

// Firebase config
const firebaseConfig = {
    apiKey: Constants.expoConfig.extra.apiKey,
    authDomain: Constants.expoConfig.extra.authDomain,
    projectId: Constants.expoConfig.extra.projectId,
    storageBucket: Constants.expoConfig.extra.storageBucket,
    messagingSenderId: Constants.expoConfig.extra.messagingSenderId,
    appId: Constants.expoConfig.extra.appId,
    databaseURL: Constants.expoConfig.extra.databaseURL,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Configurar Firebase Auth con persistencia en AsyncStorage
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage), // Aquí configuras la persistencia
});

// Inicializar Firestore
export const database = getFirestore(app);

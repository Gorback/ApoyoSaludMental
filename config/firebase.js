import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Importar Firebase Storage
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export const MERCADO_PAGO_PUBLIC_KEY = Constants.expoConfig.extra.MERCADO_PAGO_PUBLIC_KEY;
export const MERCADO_PAGO_ACCESS_TOKEN = Constants.expoConfig.extra.MERCADO_PAGO_ACCESS_TOKEN;

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
    persistence: getReactNativePersistence(AsyncStorage),
});

// Inicializar Firestore
export const database = getFirestore(app);

// Inicializar Storage
export const storage = getStorage(app); // Agregar la instancia de Firebase Storage

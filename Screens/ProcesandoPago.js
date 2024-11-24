import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { database } from "../config/firebase";

export default function ProcesandoPago() {
    const navigation = useNavigation();
    const route = useRoute();
    const { idUsuario, idProfesional, chatId, mensajeInicial } = route.params || {};
    const [loadingMessage, setLoadingMessage] = useState("Procesando tu pago...");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    
    useEffect(() => {
        if (!idUsuario || !idProfesional || !chatId || !mensajeInicial) {
            console.error("Error: Parámetros faltantes:", { idUsuario, idProfesional, chatId, mensajeInicial });
            setIsError(true);
            setLoadingMessage("Error al procesar el pago. Parámetros incompletos.");
            return;
        }

        const procesarPago = async () => {
            try {
                setLoadingMessage("Consultando al banco...");
                await new Promise(resolve => setTimeout(resolve, 2000));

                const docRef = doc(database, "chats", chatId);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    await setDoc(docRef, {
                        participants: [idUsuario, idProfesional],
                        lastMessage: null,
                        createdAt: new Date(),
                        chatId: chatId,
                    });
                }

                setLoadingMessage("Pago realizado con éxito.");

                // Redirigir al Chat y limpiar la pila de navegación
                navigation.dispatch(
                    CommonActions.reset({
                        index: 1,
                        routes: [
                            { name: "Home" }, // Deja el Home en la pila
                            { name: "Chat", params: { professionalId: idProfesional, chatId } }, // Navega al Chat
                        ],
                    })
                );
            } catch (error) {
                console.error("Error al procesar el pago:", error);
                setIsError(true);
                setLoadingMessage("Error al procesar el pago.");
            }
        };

        procesarPago();
    }, [idUsuario, idProfesional, chatId, mensajeInicial]);

    return (
        <View style={styles.container}>
            {/* Logo de Mercado Pago */}
            <Image
                source={{ uri: "https://america-retail.com/wp-content/uploads/2024/03/mercado-pago.jpg" }}
                style={styles.logo}
            />
            {/* Mensaje de estado */}
            <Text style={styles.message}>{loadingMessage}</Text>
            {/* Indicador de carga */}
            {!isError && <ActivityIndicator size="large" color="#00bcd4" />}
            {/* Botón para volver en caso de error */}
            {isError && (
                <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Volver</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#03AEEF", // Color de fondo original
    },
    logo: {
        width: 200, // Tamaño original del logo
        height: 100,
        marginBottom: 20,
        resizeMode: "contain",
    },
    message: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white", // Color blanco del texto
        marginBottom: 20,
    },
    errorButton: {
        backgroundColor: "red",
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
});

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { doc, setDoc, getDoc, addDoc, collection } from "firebase/firestore";
import { auth, database } from "../config/firebase";

export default function ProcesandoPago() {
    const navigation = useNavigation();
    const route = useRoute();
    const { idUsuario, idProfesional, chatId, mensajeInicial, tarifa } = route.params || {};
    const [loadingMessage, setLoadingMessage] = useState("Procesando tu pago...");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        console.log("Parámetros recibidos en ProcesandoPago:", {
            idUsuario,
            idProfesional,
            chatId,
            mensajeInicial,
            tarifa,
        });

        if (!idUsuario || !idProfesional || !chatId || !mensajeInicial || tarifa === undefined) {
            console.error("Parámetros incompletos detectados en ProcesandoPago.");
            setIsError(true);
            setLoadingMessage("Error al procesar el pago. Parámetros incompletos.");
            return;
        }

        // ProcesandoPago.js
        const procesarPago = async () => {
            try {
                setLoadingMessage("Consultando al banco...");
                await new Promise((resolve) => setTimeout(resolve, 2000));

                const docRef = doc(database, "chats", chatId);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    await setDoc(docRef, {
                        participants: [idUsuario, idProfesional],
                        lastMessage: mensajeInicial,
                        createdAt: new Date(),
                        chatId,
                    });
                }

                // **Registra el pago en la colección `pagos`**
                await addDoc(collection(database, "pagos"), {
                    professionalId: idProfesional,
                    idUsuario: idUsuario,
                    userName: auth.currentUser?.displayName || "Usuario",
                    tarifa: tarifa,
                    createdAt: new Date(),
                });

                setLoadingMessage("Pago realizado con éxito.");

                navigation.dispatch(
                    CommonActions.reset({
                        index: 1,
                        routes: [{ name: "Home" }, { name: "Chat", params: { professionalId: idProfesional, chatId } }],
                    })
                );
            } catch (error) {
                console.error("Error al procesar el pago:", error);
                setIsError(true);
                setLoadingMessage("Error al procesar el pago.");
            }
        };


        procesarPago();
    }, [idUsuario, idProfesional, chatId, mensajeInicial, tarifa]);


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

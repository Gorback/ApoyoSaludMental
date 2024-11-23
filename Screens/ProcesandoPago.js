import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from "../config/firebase"; // Asegúrate de que este archivo apunte a tu configuración correcta de Firebase

export default function ProcesandoPago() {
    const navigation = useNavigation();
    const route = useRoute();
    const { idUsuario, idProfesional, chatId, mensajeInicial } = route.params || {};

    useEffect(() => {
        const procesarPago = async () => {
            if (!idUsuario || !idProfesional || !chatId || !mensajeInicial) {
                console.error('Faltan parámetros para procesar el pago:', {
                    idUsuario,
                    idProfesional,
                    chatId,
                    mensajeInicial,
                });
                return;
            }

            try {
                // Referencia al documento del chat en Firestore
                const docRef = doc(db, 'RegistroChat', chatId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    console.log('El chat ya existe en Firebase');
                } else {
                    console.log('Creando un nuevo chat en Firebase');
                    await setDoc(docRef, {
                        idUsuario,
                        idProfesional,
                        mensajes: [mensajeInicial], // Mensaje inicial enviado por el usuario
                        timestamp: new Date().toISOString(),
                    });
                }

                // Redirigir al componente del chat
                navigation.replace('Chat', { chatId });
            } catch (error) {
                console.error('Error al procesar el pago y crear el chat:', error);
            }
        };

        procesarPago();
    }, [idUsuario, idProfesional, chatId, mensajeInicial, navigation]);

    return (
        <View style={styles.container}>
            {/* Logo de Mercado Pago */}
            <Image
                source={{ uri: 'https://america-retail.com/wp-content/uploads/2024/03/mercado-pago.jpg' }}
                style={styles.logo}
            />
            {/* Mensaje */}
            <Text style={styles.message}>Procesando tu pago...</Text>
            {/* Indicador de carga */}
            <ActivityIndicator size="large" color="#00bcd4" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#03AEEF',
    },
    logo: {
        width: 200,
        height: 100,
        marginBottom: 20,
        resizeMode: 'contain',
    },
    message: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },
});

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ProcesandoPago() {
    const navigation = useNavigation();
    const route = useRoute(); // Hook para obtener los parámetros de navegación
    const { professionalId } = route.params || {}; // Obtenemos `professionalId` directamente

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!professionalId) {
                console.error("Error: No se encontró el parámetro 'professionalId'");
                return;
            }

            // Navegar directamente al chat
            navigation.navigate('Chat', { professionalId });
        }, 5000); // Simula 5 segundos de espera

        return () => clearTimeout(timer); // Limpia el temporizador al desmontar
    }, [navigation, professionalId]);

    return (
        <View style={styles.container}>
            {/* Logo de Mercado Pago */}
            <Image
                source={{ uri: 'https://america-retail.com/wp-content/uploads/2024/03/mercado-pago.jpg' }}
                style={styles.logo}
            />
            {/* Mensaje */}
            <Text style={styles.message}>Procesando pago...</Text>
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
        backgroundColor: '#03AEEF', // Celeste Mercado Pago
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

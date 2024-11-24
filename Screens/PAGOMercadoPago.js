import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import * as Font from 'expo-font';

export default function PAGOMercadoPago() {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const route = useRoute();
    const navigation = useNavigation();
    const { preferenceId: tarifa, chatParams, professionalName } = route.params;

    useEffect(() => {
        // Ocultar el encabezado y el botón de retroceso
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        const loadFonts = async () => {
            await Font.loadAsync({
                'ProximaNova-Light': {
                    uri: 'https://http2.mlstatic.com/ui/webfonts/v3.0.0/proxima-nova/proximanova-light.ttf',
                },
                'ProximaNova-Regular': {
                    uri: 'https://http2.mlstatic.com/ui/webfonts/v3.0.0/proxima-nova/proximanova-regular.ttf',
                },
                'ProximaNova-Semibold': {
                    uri: 'https://http2.mlstatic.com/ui/webfonts/v3.0.0/proxima-nova/proximanova-semibold.ttf',
                },
            });
            setFontsLoaded(true);
        };
        loadFonts();
    }, []);

    const handleLinkPress = (url) => {
        Linking.openURL(url);
    };

    if (!fontsLoaded) {
        return <Text>Loading...</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>¿Cómo quieres pagar?</Text>

            {/* Mercado Pago Options */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Con tu cuenta de Mercado Pago</Text>
                <TouchableOpacity style={styles.paymentOption}>
                    <Image
                        source={require('../assets/a8d1e2ded2b3264ec618c059af0c0b70.png')}
                        style={styles.icon}
                    />
                    <Text style={styles.optionText}>Ingresar con mi cuenta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.paymentOption}>
                    <Image
                        source={require('../assets/icons8-smartphone-48.png')}
                        style={styles.icon}
                    />
                    <Text style={styles.optionText}>Usar la app de Mercado Pago</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sin cuenta de Mercado Pago</Text>
                <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => navigation.navigate("Credito", { preferenceId: tarifa, ...chatParams, professionalName })}
                >
                    <Image
                        source={require("../assets/icons8-magnetic-card-32.png")}
                        style={styles.icon}
                    />
                    <Text style={styles.optionText}>Tarjeta de crédito</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => navigation.navigate("Debito", { preferenceId: tarifa, ...chatParams, professionalName })}
                >
                    <Image
                        source={require("../assets/icons8-parte-trasera-de-tarjeta-bancaria-48.png")}
                        style={styles.icon}
                    />
                    <Text style={styles.optionText}>Tarjeta de débito</Text>
                </TouchableOpacity>
            </View>

            {/* Payment Details */}
            <View style={styles.paymentDetails}>
                <Text style={styles.detailsTitle}>Detalles del pago</Text>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Sesion</Text>
                    <Text style={styles.detailsValue}>{`$ ${tarifa}`}</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 8,
    },
    closeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#eee',
    },
    title: {
        fontSize: 20,
        fontFamily: 'ProximaNova-Regular',
        fontWeight: '600',
        color: '#009ee3',
        textAlign: 'center',
        marginBottom: 16,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'ProximaNova-Semibold',
        color: '#009ee3',
        marginBottom: 8,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#bfbfbf',
        marginBottom: 8,
    },
    icon: {
        width: 40,
        height: 40,
        marginRight: 12,
        resizeMode: 'contain',
    },
    optionText: {
        fontSize: 14,
        fontFamily: 'ProximaNova-Regular',
        color: '#333',
    },
    paymentDetails: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    detailsTitle: {
        fontSize: 16,
        fontFamily: 'ProximaNova-Semibold',
        color: '#333',
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailsLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'ProximaNova-Light',
        left: 2,
    },
    detailsValue: {
        fontSize: 14,
        fontFamily: 'ProximaNova-Regular',
        color: '#333',
    },
});

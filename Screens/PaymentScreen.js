import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview';

const PaymentScreen = ({ route }) => {
    const { professionalId, description, amount } = route.params;
    const [preferenceId, setPreferenceId] = useState(null);

    const handlePayment = async () => {
        try {
            const response = await axios.post('https://us-central1-tu-proyecto.cloudfunctions.net/createPreference', {
                description,
                amount,
                userId: 'USER_ID',        // Reemplazar con el ID del usuario autenticado
                professionalId,           // ID del profesional
            });
            setPreferenceId(response.data.id);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            {!preferenceId ? (
                <Button title="Pagar Sesión" onPress={handlePayment} />
            ) : (
                <WebView
                    source={{ uri: `https://www.mercadopago.cl/checkout/v1/redirect?pref_id=${preferenceId}` }}
                    style={styles.webview}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    webview: {
        flex: 1,
    },
});

export default PaymentScreen;

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Credito() {
    const [cardNumber, setCardNumber] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [securityCode, setSecurityCode] = useState('');
    const navigation = useNavigation(); // Hook para la navegación

    const formatCardNumber = (value) => {
        const sanitizedValue = value.replace(/\D/g, '');
        const formattedValue = sanitizedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardNumber(formattedValue);
    };

    const formatExpirationDate = (value) => {
        const sanitizedValue = value.replace(/\D/g, '');
        const formattedValue = sanitizedValue.replace(/(\d{2})(?=\d)/, '$1/');
        setExpirationDate(formattedValue);
    };

    const handlePayment = () => {
        if (!cardNumber || !cardholderName || !expirationDate || !securityCode) {
            Alert.alert('Error', 'Por favor completa todos los campos.');
            return;
        }
        // Redirigir a ProcesandoPago.js
        navigation.navigate('ProcesandoPago', {
            isProfessional: false, // Cambiar a true si aplica para profesionales
            chatParams: { professionalId: 'userProfesional' }, // Ajustar los parámetros según corresponda
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Completa los datos de tu tarjeta</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Número de tarjeta</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej.: 1234 5678 9101 1121"
                    keyboardType="numeric"
                    maxLength={19}
                    value={cardNumber}
                    onChangeText={formatCardNumber}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre del titular</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej.: María López"
                    value={cardholderName}
                    onChangeText={setCardholderName}
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Vencimiento</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="MM/AA"
                        maxLength={5}
                        value={expirationDate}
                        onChangeText={formatExpirationDate}
                    />
                </View>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Código de seguridad</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej.: 123"
                        maxLength={4}
                        keyboardType="numeric"
                        value={securityCode}
                        onChangeText={setSecurityCode}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handlePayment}>
                <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#009EE3',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#F6F7FB',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    button: {
        backgroundColor: '#009EE3',
        padding: 15,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function Debito() {
    const [cardNumber, setCardNumber] = useState("");
    const [cardholderName, setCardholderName] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [securityCode, setSecurityCode] = useState("");
    const navigation = useNavigation();
    const route = useRoute();
    const { chatParams, tarifa, professionalName } = route.params || {};

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const formatCardNumber = (value) => {
        const sanitizedValue = value.replace(/\D/g, "");
        const formattedValue = sanitizedValue.replace(/(\d{4})(?=\d)/g, "$1 ");
        setCardNumber(formattedValue.substring(0, 19));
    };

    const formatExpirationDate = (value) => {
        const sanitizedValue = value.replace(/\D/g, "");
        const formattedValue = sanitizedValue.replace(/(\d{2})(\d{1,2})/, "$1/$2");
        setExpirationDate(formattedValue.substring(0, 5));
    };

    const formatSecurityCode = (value) => {
        const sanitizedValue = value.replace(/\D/g, "");
        setSecurityCode(sanitizedValue.substring(0, 4));
    };

    const handlePayment = () => {
        if (!cardNumber || !cardholderName || !expirationDate || !securityCode) {
            Alert.alert("Error", "Por favor completa todos los campos.");
            return;
        }

        if (cardNumber.length < 19 || expirationDate.length < 5 || securityCode.length < 3) {
            Alert.alert("Error", "Por favor verifica el formato de los campos.");
            return;
        }

        navigation.navigate("ProcesandoPago", {
            ...chatParams,
            tarifa,
            professionalName,
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.roundedBackground}>
                <View style={styles.content}>
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
                                value={expirationDate}
                                maxLength={5}
                                onChangeText={formatExpirationDate}
                            />
                        </View>
                        <View style={[styles.inputContainer, styles.halfWidth]}>
                            <Text style={styles.label}>Código de seguridad</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej.: 123"
                                keyboardType="numeric"
                                value={securityCode}
                                maxLength={4}
                                onChangeText={formatSecurityCode}
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handlePayment}>
                        <Text style={styles.buttonText}>Continuar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    roundedBackground: {
        width: "90%",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    content: {
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#009EE3",
        marginBottom: 20,
        textAlign: "center",
    },
    inputContainer: {
        marginBottom: 20,
        width: "100%",
    },
    label: {
        fontSize: 14,
        color: "#333",
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        backgroundColor: "#F6F7FB",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    halfWidth: {
        width: "48%",
    },
    button: {
        backgroundColor: "#009EE3",
        padding: 15,
        borderRadius: 6,
        alignItems: "center",
        width: "100%",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

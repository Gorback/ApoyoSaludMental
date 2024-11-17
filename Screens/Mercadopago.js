import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Mercadopago() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mercado Pago</Text>
            <Text style={styles.description}>
                Aquí puedes gestionar tus pagos o verificar el estado de tu transacción.
            </Text>
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginHorizontal: 20,
    },
});

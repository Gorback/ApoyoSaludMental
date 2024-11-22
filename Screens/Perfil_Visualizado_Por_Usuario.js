import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import colors from "../colors";

const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const PerfilVisualizadoPorUsuario = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { professional } = route.params;

    const handlePaymentAndChat = () => {
        try {
            if (!professional.tarifa || professional.tarifa <= 0) {
                throw new Error("La tarifa del profesional no es válida.");
            }

            if (!professional.userProfesional) {
                throw new Error("El nombre del profesional no está disponible.");
            }

            navigation.navigate("PAGOMercadoPago", {
                preferenceId: professional.tarifa,
                professionalName: professional.userProfesional,
                professionalPhoto: professional.photoURL,
            });
        } catch (error) {
            Alert.alert("Error", error.message || "No se pudo procesar el pago.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={{
                    uri: professional.photoURL
                        ? `data:image/jpeg;base64,${professional.photoURL}`
                        : "https://via.placeholder.com/150",
                }}
                style={styles.profileImage}
            />
            <Text style={styles.nameText}>{professional.userProfesional}</Text>
            <Text style={styles.infoText}>Edad: {calculateAge(professional.fechaNacimiento)} años</Text>
            <Text style={styles.infoText}>Especialidad: {professional.especialidad}</Text>
            <Text style={styles.infoText}>Tarifa: ${professional.tarifa}</Text>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>{professional.descripcion}</Text>

            <TouchableOpacity style={styles.chatButton} onPress={handlePaymentAndChat}>
                <Text style={styles.chatButtonText}>Pagar Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default PerfilVisualizadoPorUsuario;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
    },
    nameText: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: 10,
        textAlign: "center",
    },
    infoText: {
        fontSize: 18,
        color: "#333",
        marginBottom: 5,
        textAlign: "center",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.primary,
        marginVertical: 15,
        textAlign: "center",
    },
    descriptionText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },
    chatButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    chatButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

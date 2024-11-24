import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { auth } from "../config/firebase"; // Importa `auth` desde Firebase
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

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const handlePagoPress = () => {
        if (!professional.id || !professional.tarifa || !auth.currentUser?.uid) {
            Alert.alert("Error", "Faltan datos del profesional para realizar el pago.");
            return;
        }
    
        navigation.navigate("PAGOMercadoPago", {
            chatParams: {
                idUsuario: auth.currentUser.uid,
                idProfesional: professional.id,
                chatId: `${auth.currentUser.uid}_${professional.id}`,
                mensajeInicial: `Hola, soy ${auth.currentUser.displayName || "Usuario"}. Me gustaría iniciar una consulta contigo.`,
            },
            tarifa: professional.tarifa,
            professionalName: professional.userProfesional,
        });
    };
    

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="orange" />
            </TouchableOpacity>
            <View style={styles.professionalContainer}>
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
            </View>
            <TouchableOpacity style={styles.chatButton} onPress={handlePagoPress}>
                <Text style={styles.chatButtonText}>Pagar Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default PerfilVisualizadoPorUsuario;

// Estilos no modificados


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 20,
    },
    professionalContainer: {
        width: "90%",
        backgroundColor: "#F6F7FB",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
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

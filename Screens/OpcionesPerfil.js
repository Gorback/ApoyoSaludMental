import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { auth, database as db } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import colors from '../colors';

const OpcionesProfesional = () => {
    const navigation = useNavigation();
    const [userData, setUserData] = useState({
        userProfesional: '',
        especialidad: '',
        tarifa: '',
        descripcion: ''
    });
    const [loading, setLoading] = useState(true); // Estado de carga

    useEffect(() => {
        // Cargar los datos actuales del usuario de Firestore
        const fetchUserData = async () => {
            try {
                setLoading(true); // Comienza la carga
                const userId = auth.currentUser.uid;
                const docRef = doc(db, "profesionales", userId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                } else {
                    console.log("No se encontró el documento del usuario.");
                }
            } catch (error) {
                console.log("Error al obtener los datos del usuario:", error);
            } finally {
                setLoading(false); // Termina la carga
            }
        };

        fetchUserData();
    }, []);

    const handleSave = async () => {
        try {
            const userId = auth.currentUser.uid;
            const docRef = doc(db, "profesionales", userId);

            await updateDoc(docRef, {
                userProfesional: userData.userProfesional,
                especialidad: userData.especialidad,
                tarifa: userData.tarifa,
                descripcion: userData.descripcion
            });

            Alert.alert("Éxito", "Tus datos han sido actualizados correctamente.");
            navigation.goBack(); // Vuelve a la pantalla anterior
        } catch (error) {
            console.log("Error al actualizar los datos:", error);
            Alert.alert("Error", "No se pudieron actualizar los datos.");
        }
    };

    const handleChange = (field, value) => {
        setUserData((prevState) => ({
            ...prevState,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Text style={styles.title}>Editar Perfil Profesional</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre del Profesional"
                value={userData.userProfesional}
                onChangeText={(text) => handleChange("userProfesional", text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Especialidad"
                value={userData.especialidad}
                onChangeText={(text) => handleChange("especialidad", text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Tarifa"
                value={userData.tarifa}
                onChangeText={(text) => handleChange("tarifa", text)}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.descriptionInput}
                placeholder="Descripción"
                value={userData.descripcion}
                onChangeText={(text) => handleChange("descripcion", text)}
                multiline
                maxLength={500}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
        </View>
    );
};

export default OpcionesProfesional;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: "#F6F7FB",
        height: 50,
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    descriptionInput: {
        backgroundColor: "#F6F7FB",
        height: 100,
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: colors.primary,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

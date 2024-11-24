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
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
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
                setLoading(false);
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
            navigation.goBack();
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

            <View style={styles.background}>
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
        </View>
    );
};

export default OpcionesProfesional;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.lightGray,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    background: {
        width: '90%',
        backgroundColor: '#F6F7FB',
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    backButton: {
        position: "absolute",
        top: 40,
        left: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#fff",
        height: 50,
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
        width: "100%",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    descriptionInput: {
        backgroundColor: "#fff",
        height: 100,
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
        textAlignVertical: "top",
        width: "100%",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    saveButton: {
        backgroundColor: colors.primary,
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        width: "100%",
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
});

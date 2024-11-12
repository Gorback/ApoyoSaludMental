import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { auth, database as db } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import colors from '../colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";

const OpcionesUsuarios = () => {
    const navigation = useNavigation();
    const [userData, setUserData] = useState({
        user: '',
        email: '',
        fechaNacimiento: new Date(),
        genero: '',
        photoURL: ''
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userId = auth.currentUser.uid;
                const docRef = doc(db, "users", userId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData({
                        user: data.user,
                        email: data.email,
                        fechaNacimiento: new Date(data.fechaNacimiento),
                        genero: data.genero,
                        photoURL: data.photoURL ? `data:image/png;base64,${data.photoURL}` : null
                    });
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
            const docRef = doc(db, "users", userId);

            await updateDoc(docRef, {
                user: userData.user,
                email: userData.email,
                fechaNacimiento: userData.fechaNacimiento.toISOString(),
                genero: userData.genero,
                photoURL: userData.photoURL ? userData.photoURL.split(",")[1] : null
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

    const showDatePickerModal = () => setShowDatePicker(true);

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

            <Text style={styles.title}>Editar Perfil</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre de usuario"
                value={userData.user}
                onChangeText={(text) => handleChange("user", text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                value={userData.email}
                onChangeText={(text) => handleChange("email", text)}
                keyboardType="email-address"
            />

            {/* Campo de Fecha de Nacimiento */}
            <Text style={styles.label}>Fecha de Nacimiento</Text>
            <TouchableOpacity style={styles.input} onPress={showDatePickerModal}>
                <Text>{userData.fechaNacimiento ? userData.fechaNacimiento.toDateString() : "Fecha de Nacimiento"}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={userData.fechaNacimiento}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                            handleChange("fechaNacimiento", selectedDate);
                        }
                    }}
                    maximumDate={new Date()}
                />
            )}

            {/* Campo de Género */}
            <Text style={styles.label}>Género</Text>
            <Picker
                selectedValue={userData.genero}
                style={styles.input}
                onValueChange={(itemValue) => handleChange("genero", itemValue)}
            >
                <Picker.Item label="Masculino" value="Masculino" />
                <Picker.Item label="Femenino" value="Femenino" />
                <Picker.Item label="Otros" value="Otros" />
            </Picker>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
        </View>
    );
};

export default OpcionesUsuarios;

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
    label: {
        marginBottom: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
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

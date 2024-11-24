import React, { useEffect, useState, useLayoutEffect, useCallback } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { auth, database as db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import colors from '../colors';

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

const HomeProfesional = () => {
    const navigation = useNavigation();
    const [profileImage, setProfileImage] = useState(null);
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const userId = auth.currentUser.uid;
            const docRef = doc(db, "profesionales", userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserData(docSnap.data());
                if (docSnap.data().photoURL) {
                    setProfileImage(`data:image/jpeg;base64,${docSnap.data().photoURL}`);
                }
            }
        } catch (error) {
            console.log("Error al obtener los datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfileData();
        }, [])
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Bienvenido", // Texto que reemplaza la foto en el encabezado
            headerLeft: () => null, // Eliminar el botón "Atrás"
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 10 }}
                    onPress={() => auth.signOut().then(() => navigation.navigate("Login")).catch((error) => console.log("Error al cerrar sesión:", error))}
                >
                    <AntDesign name="logout" size={24} color={colors.gray} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <View style={styles.profileCard}>
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.profileImage}
                        />
                        <Text style={styles.nameText}>{userData.userProfesional}</Text>
                        <Text style={styles.specialtyText}>Especialidad: {userData.especialidad}</Text>
                        <Text style={styles.ageText}>Edad: {calculateAge(userData.fechaNacimiento)} años</Text>
                        <Text style={styles.rateText}>Tarifa: {userData.tarifa}</Text>

                        {/* Descripción en un contenedor ScrollView para desplazamiento */}
                        <ScrollView style={styles.descriptionContainer}>
                            <Text style={styles.descriptionText}>{userData.descripcion}</Text>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => navigation.navigate("OpcionesPerfil")}
                        >
                            <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Botón de chat en una posición fija */}
            <TouchableOpacity
                onPress={() => navigation.navigate("RegistroChatProfesional")}
                style={styles.chatButton}
            >
                <Entypo name="chat" size={24} color={colors.lightGray} />
            </TouchableOpacity>
        </View>
    );
};

export default HomeProfesional;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#fff",
    },
    container: {
        width: '90%',
        padding: 20,
        alignItems: 'center',
    },
    profileCard: {
        width: '100%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 10,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 5,
        textAlign: 'center',
    },
    specialtyText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    ageText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    rateText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    descriptionContainer: {
        maxHeight: 150,
        marginBottom: 10,
        width: '100%',
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginHorizontal: 10,
    },
    editButton: {
        backgroundColor: colors.primary,
        height: 45,
        width: 100,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    chatButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: colors.primary,
        height: 60,
        width: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

import React, { useLayoutEffect, useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Linking, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';
import { signOut } from "firebase/auth";
import { auth, database as db } from "../config/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import colors from '../colors';

const { width, height } = Dimensions.get('window'); // Obtener dimensiones del dispositivo

const Home = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [professionals, setProfessionals] = useState([]);
    const [photoURL, setPhotoURL] = useState(null);

    const handleOnPressCallContact = () => {
        Linking.openURL('tel:*4141'); // Simular llamada
    };

    const fetchProfessionals = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "profesionales"));
            const professionalsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProfessionals(professionalsList);
        } catch (error) {
            console.log("Error fetching professionals:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const fetchUserPhoto = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (userId) {
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    
                    if (userData.photoURL) {
                        setPhotoURL(`data:image/jpeg;base64,${userData.photoURL}`);
                    }
                } else {
                    console.log("Documento del usuario no existe");
                }
            } else {
                console.log("Usuario no autenticado");
            }
        } catch (error) {
            console.log("Error fetching user photo:", error);
        }
    };
    

    useEffect(() => {
        const fetchUserPhoto = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (userId) {
                    const userDoc = await getDoc(doc(db, "users", userId));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setPhotoURL(`data:image/png;base64,${userData.photoURL}`);
                    } else {
                        console.log("Documento del usuario no existe");
                    }
                } else {
                    console.log("Usuario no autenticado");
                }
            } catch (error) {
                console.log("Error fetching user photo:", error);
            }
        };
        fetchUserPhoto();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <TouchableOpacity onPress={() => navigation.navigate("OpcionesUsuarios")}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {photoURL ? (
                            <Image
                                source={{ uri: photoURL }}
                                style={{ width: 40, height: 40, borderRadius: 20 }}
                            />
                        ) : (
                            <Text style={{ fontSize: 18 }}>Cargando...</Text>
                        )}
                    </View>
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={onSignOut} style={{ marginRight: 10 }}>
                    <AntDesign name="logout" size={24} color={colors.gray} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, photoURL]);

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfessionals();
    };

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const renderProfessional = ({ item }) => (
        <TouchableOpacity
            style={styles.professionalCard}
            onPress={() => navigation.navigate("PerfilVisualizadoPorProfesional", { professional: item })}
        >
            <Image
                source={{
                    uri: item.photoURL
                        ? `data:image/jpeg;base64,${item.photoURL}`
                        : "https://via.placeholder.com/150"
                }}
                style={styles.professionalImage}
            />
            <View style={styles.professionalInfo}>
                <Text style={styles.professionalName}>{item.userProfesional}</Text>
                <Text style={styles.professionalDatos}>Especialidad: {item.especialidad}</Text>
                <Text style={styles.professionalDatos}>Tarifa: {item.tarifa}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={professionals}
                keyExtractor={(item) => item.id}
                renderItem={renderProfessional}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                onEndReached={fetchProfessionals}
                onEndReachedThreshold={0.1}
            />
            <TouchableOpacity
                onPress={() => navigation.navigate("RegistrosChat")}
                style={styles.chatButton}
            >
                <Entypo name="chat" size={24} color={colors.lightGray} />
            </TouchableOpacity>

            {/* Botón de llamada */}
            <TouchableOpacity
                onPress={handleOnPressCallContact}
                style={styles.callButton}
            >
                <Image
                    source={require("../assets/Llamada.webp")}
                    style={styles.callImage}
                />
            </TouchableOpacity>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 80,
    },
    professionalCard: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    professionalImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    professionalInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    professionalName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    professionalDatos: {
        fontSize: 14,
        color: '#666',
    },
    chatButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: colors.primary,
        height: 70,
        width: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
    },
    callButton: {
        position: 'absolute',
        bottom: 20, // Distancia desde la parte inferior
        left: 20, // Distancia desde la izquierda
        borderRadius: 150,
        
    },
    callImage: {
        width: 70, // Tamaño ajustado
        height: 70,
        resizeMode: 'contain', // Asegura que la imagen no se deforme
    },
});
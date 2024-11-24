import React, { useLayoutEffect, useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, FlatList, RefreshControl, Modal, Linking, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, AntDesign, Entypo } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth, database as db } from "../config/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import colors from "../colors";

const Home = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [professionals, setProfessionals] = useState([]);
    const [filteredProfessionals, setFilteredProfessionals] = useState([]);
    const [photoURL, setPhotoURL] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filter, setFilter] = useState({ sortBy: "", gender: "" });

    const handleOnPressCallContact = () => {
        Linking.openURL("tel:*4141");
    };

    const fetchProfessionals = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "profesionales"));
            const professionalsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProfessionals(professionalsList);
            setFilteredProfessionals(professionalsList);
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
        fetchProfessionals();
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
                <TouchableOpacity style={{ marginRight: 20 }} onPress={() => signOut(auth)}>
                    <AntDesign name="logout" size={24} color={colors.gray} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, photoURL]);

    const handleFilter = () => {
        let result = [...professionals];

        // Filtrar por género
        if (filter.gender) {
            result = result.filter(pro => pro.genero === filter.gender);
        }

        // Ordenar por tarifa o edad
        if (filter.sortBy === "tarifa") {
            result.sort((a, b) => parseFloat(a.tarifa) - parseFloat(b.tarifa));
        } else if (filter.sortBy === "edad") {
            result.sort((a, b) => new Date(a.fechaNacimiento) - new Date(b.fechaNacimiento));
        }

        setFilteredProfessionals(result);
        setModalVisible(false);
    };

    const renderProfessional = ({ item }) => (
        <TouchableOpacity
            style={styles.professionalCard}
            onPress={() => navigation.navigate("PerfilVisualizadoPorProfesional", { professional: item })}
        >
            <Image
                source={{
                    uri: item.photoURL
                        ? `data:image/jpeg;base64,${item.photoURL}`
                        : "https://via.placeholder.com/150",
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredProfessionals}
                keyExtractor={(item) => item.id}
                renderItem={renderProfessional}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchProfessionals} colors={[colors.primary]} />
                }
            />

            {/* Botón flotante de filtro */}
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setModalVisible(true)}
            >
                <FontAwesome name="filter" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Botón de registro chat */}
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

            {/* Modal de filtros */}
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filtrar Profesionales</Text>

                        <TouchableOpacity onPress={() => setFilter({ ...filter, sortBy: "tarifa" })}>
                            <Text style={styles.modalOption}>Ordenar por tarifa (menor a mayor)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFilter({ ...filter, sortBy: "edad" })}>
                            <Text style={styles.modalOption}>Ordenar por edad (mayor a menor)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFilter({ ...filter, gender: "Masculino" })}>
                            <Text style={styles.modalOption}>Filtrar por género: Masculino</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFilter({ ...filter, gender: "Femenino" })}>
                            <Text style={styles.modalOption}>Filtrar por género: Femenino</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFilter({ ...filter, gender: "Otros" })}>
                            <Text style={styles.modalOption}>Filtrar por género: Otros</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFilter({ ...filter, gender: "" })}>
                            <Text style={styles.modalOption}>Quitar filtros de género</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.applyButton} onPress={handleFilter}>
                            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        paddingBottom: 80,
    },
    professionalCard: {
        flexDirection: "row",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    professionalImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    professionalInfo: {
        flex: 1,
        justifyContent: "center",
    },
    professionalName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    professionalDatos: {
        fontSize: 14,
        color: "#666",
    },
    filterButton: {
        position: "absolute",
        bottom: 100,
        right: 20,
        backgroundColor: colors.primary,
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
    },
    chatButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: colors.primary,
        height: 70,
        width: 70,
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
    },
    callButton: {
        position: "absolute",
        bottom: 20,
        left: 20,
    },
    callImage: {
        width: 70,
        height: 70,
        resizeMode: "contain",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalOption: {
        fontSize: 16,
        marginVertical: 10,
    },
    applyButton: {
        marginTop: 20,
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    applyButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

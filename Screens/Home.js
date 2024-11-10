import React, { useLayoutEffect, useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';
import { signOut } from "firebase/auth";
import { auth, database as db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
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

const Home = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [professionals, setProfessionals] = useState([]);

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

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfessionals();
    };

    const onEndReached = () => {
        fetchProfessionals();
    };

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={onSignOut} style={{ marginRight: 10 }}>
                        <AntDesign name="logout" size={24} color={colors.gray} />
                    </TouchableOpacity>
                </View>
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

    const renderProfessional = ({ item }) => (
        <TouchableOpacity
            style={styles.professionalCard}
            onPress={() => navigation.navigate("PerfilVisualizadoPorProfesional", { professional: item })} // Navegar con datos
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
                <Text style={styles.professionalDatos}>Edad: {calculateAge(item.fechaNacimiento)}</Text>
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
                onEndReached={onEndReached}
                onEndReachedThreshold={0.1}
            />
            <TouchableOpacity
                onPress={() => navigation.navigate("RegistrosChat")}
                style={styles.chatButton}
            >
                <Entypo name="chat" size={24} color={colors.lightGray} />
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
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
    },
});

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { auth, database as db } from "../config/firebase";
import colors from '../colors';

const RegistroChat = () => {
    const [loading, setLoading] = useState(true);
    const [chatList, setChatList] = useState([]);
    const navigation = useNavigation();
    const handleOnPressCallContact = () => { Linking.openURL('tel:*4141') };

    useEffect(() => {
        // Establecer el título de la pantalla
        navigation.setOptions({
            headerTitle: "Conversaciones",
        });

        const currentUserId = auth.currentUser.uid;
        const collectionRef = collection(db, "chats");

        const q = query(
            collectionRef,
            where("participants", "array-contains", currentUserId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const chats = {};

            for (const docSnap of snapshot.docs) {
                const chatData = docSnap.data();
                const otherParticipantId = chatData.participants.find(id => id !== currentUserId);

                if (!chats[otherParticipantId]) {
                    // Intentar obtener datos de la colección "profesionales"
                    const userDocRef = doc(db, "profesionales", otherParticipantId);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const professionalName = userDocSnap.data().userProfesional || "Sin nombre";
                        chats[otherParticipantId] = {
                            id: otherParticipantId,
                            lastMessage: chatData.text || "Último mensaje...",
                            professionalName,
                            professionalPhoto: `data:image/jpeg;base64,${userDocSnap.data().photoURL}`,
                        };
                    } else {
                        chats[otherParticipantId] = {
                            id: otherParticipantId,
                            lastMessage: chatData.text || "Último mensaje...",
                            professionalName: "Usuario no encontrado",
                            professionalPhoto: "https://via.placeholder.com/150",
                        };
                    }
                }
            }

            setChatList(Object.values(chats));
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const navigateToChat = (professionalId) => {
        navigation.navigate("Chat", { professionalId });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const renderChatItem = ({ item }) => (
        <TouchableOpacity style={styles.chatItem} onPress={() => navigateToChat(item.id)}>
            <Image source={{ uri: item.professionalPhoto }} style={styles.professionalImage} />
            <View style={styles.chatInfo}>
                <Text style={styles.professionalName}>{item.professionalName}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={chatList}
                keyExtractor={(item) => item.id}
                renderItem={renderChatItem}
                contentContainerStyle={styles.listContent}
            />
            <TouchableOpacity
                onPress={() => Linking.openURL('tel:*4141')}
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

export default RegistroChat;

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
        padding: 15,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
    },
    professionalImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    chatInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    professionalName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
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

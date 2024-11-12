import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { auth, database as db } from "../config/firebase";
import colors from '../colors';

const RegistroChatProfesional = () => {
    const [loading, setLoading] = useState(true);
    const [chatList, setChatList] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const currentProfessionalId = auth.currentUser.uid;
        const collectionRef = collection(db, "chats");

        const q = query(
            collectionRef,
            where("participants", "array-contains", currentProfessionalId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const chats = {};

            for (const docSnap of snapshot.docs) {
                const chatData = docSnap.data();
                const otherParticipantId = chatData.participants.find(id => id !== currentProfessionalId);

                if (!chats[otherParticipantId]) {
                    // Intentar obtener datos de la colección "users"
                    const userDocRef = doc(db, "users", otherParticipantId);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userName = userDocSnap.data().user || "Sin nombre";
                        chats[otherParticipantId] = {
                            id: otherParticipantId,
                            lastMessage: chatData.text || "Último mensaje...",
                            userName,
                            userPhoto: `data:image/jpeg;base64,${userDocSnap.data().photoURL}`,
                        };
                    } else {
                        chats[otherParticipantId] = {
                            id: otherParticipantId,
                            lastMessage: chatData.text || "Último mensaje...",
                            userName: "Usuario no encontrado",
                            userPhoto: "https://via.placeholder.com/150",
                        };
                    }
                }
            }

            setChatList(Object.values(chats));
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const navigateToChat = (userId) => {
        navigation.navigate("ChatProfesional", { userId });
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
            <Image source={{ uri: item.userPhoto }} style={styles.userImage} />
            <View style={styles.chatInfo}>
                <Text style={styles.userName}>{item.userName}</Text>
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
        </View>
    );
};

export default RegistroChatProfesional;

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
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    chatInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
});

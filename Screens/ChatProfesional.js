import React, { useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { collection, addDoc, orderBy, query, onSnapshot, where, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import colors from '../colors';

export default function ChatProfesional() {
    const [messages, setMessages] = useState([]);
    const [professionalPhoto, setProfessionalPhoto] = useState(null);
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params;

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={{ marginRight: 10 }} onPress={onSignOut}>
                    <AntDesign name="logout" size={24} color={colors.gray} />
                </TouchableOpacity>
            )
        });
    }, [navigation]);

    useEffect(() => {
        // Obtener la foto del profesional
        const fetchProfessionalPhoto = async () => {
            try {
                const docRef = doc(database, 'profesionales', auth.currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const photoBase64 = docSnap.data().photoURL;
                    setProfessionalPhoto(`data:image/jpeg;base64,${photoBase64}`);
                } else {
                    setProfessionalPhoto("https://via.placeholder.com/150");
                }
            } catch (error) {
                console.error("Error al obtener la foto del profesional:", error);
            }
        };
        fetchProfessionalPhoto();

        const currentProfessionalId = auth.currentUser?.uid;
        if (!currentProfessionalId || !userId) {
            console.error("Error: ID del profesional o usuario no definido.");
            return;
        }

        // Consulta a Firestore
        const collectionRef = collection(database, 'chats');
        const q = query(
            collectionRef,
            where('participants', 'array-contains', currentProfessionalId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, querySnapshot => {
            setMessages(
                querySnapshot.docs
                    .filter(doc => doc.data().participants.includes(userId))
                    .map(doc => {
                        const data = doc.data();
                        // Validación de campos requeridos
                        return {
                            _id: data._id || doc.id,
                            createdAt: data.createdAt?.toDate?.() || new Date(),
                            text: data.text || "Mensaje vacío",
                            user: data.user || { _id: "sistema", name: "Sistema" },
                        };
                    })
            );
        });

        return unsubscribe;
    }, [userId]);

    const onSend = useCallback(
        (messages = []) => {
            const currentProfessionalId = auth.currentUser?.uid;
            if (!currentProfessionalId) {
                console.error("Error: ID del profesional no definido.");
                return;
            }

            setMessages(previousMessages => GiftedChat.append(previousMessages, messages));

            const { _id, createdAt, text, user } = messages[0];
            addDoc(collection(database, 'chats'), {
                _id,
                createdAt,
                text,
                user,
                participants: [currentProfessionalId, userId],
            }).catch(error => {
                console.error("Error al enviar el mensaje:", error);
            });
        },
        [userId]
    );

    return (
        <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
                _id: auth?.currentUser?.uid,
                avatar: professionalPhoto, // Foto del profesional
            }}
            messagesContainerStyle={{ backgroundColor: '#fff' }}
            textInputStyle={{ backgroundColor: '#fff', borderRadius: 20 }}
        />
    );
}

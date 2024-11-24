import React, { useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { collection, addDoc, orderBy, query, onSnapshot, where, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import colors from '../colors';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [userPhoto, setUserPhoto] = useState(null);
    const [professionalName, setProfessionalName] = useState("Cargando...");
    const navigation = useNavigation();
    const route = useRoute();
    const { professionalId } = route.params;

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    useLayoutEffect(() => {
        // Actualizar el nombre del profesional en la barra superior
        navigation.setOptions({
            headerTitle: professionalName,
            headerRight: () => (
                <TouchableOpacity style={{ marginRight: 10 }} onPress={onSignOut}>
                    <AntDesign name="logout" size={24} color={colors.gray} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, professionalName]);

    useEffect(() => {
        // Obtener la foto del usuario
        const fetchUserPhoto = async () => {
            try {
                const userDocRef = doc(database, 'users', auth.currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const photoBase64 = userDocSnap.data().photoURL;
                    setUserPhoto(`data:image/jpeg;base64,${photoBase64}`);
                } else {
                    setUserPhoto("https://via.placeholder.com/150");
                }
            } catch (error) {
                console.error("Error al obtener la foto del usuario:", error);
            }
        };

        // Obtener el nombre del profesional
        const fetchProfessionalName = async () => {
            try {
                const professionalDocRef = doc(database, 'profesionales', professionalId);
                const professionalDocSnap = await getDoc(professionalDocRef);
                if (professionalDocSnap.exists()) {
                    setProfessionalName(professionalDocSnap.data().userProfesional || "Sin nombre");
                } else {
                    setProfessionalName("Profesional no encontrado");
                }
            } catch (error) {
                console.error("Error al obtener el nombre del profesional:", error);
                setProfessionalName("Error al cargar");
            }
        };

        fetchUserPhoto();
        fetchProfessionalName();

        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId || !professionalId) {
            console.error("Error: ID del usuario o profesional no definido.");
            return;
        }

        // Consulta a Firestore
        const collectionRef = collection(database, 'chats');
        const q = query(
            collectionRef,
            where('participants', 'array-contains', currentUserId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, querySnapshot => {
            setMessages(
                querySnapshot.docs
                    .filter(doc => doc.data().participants.includes(professionalId)) // Filtro agregado
                    .map(doc => {
                        const data = doc.data();
                        return {
                            _id: data._id || doc.id,
                            createdAt: data.createdAt?.toDate?.() || new Date(),
                            text: data.text || "", // Asegúrate de que el texto esté presente
                            user: data.user || { _id: "sistema", name: "Sistema" },
                        };
                    })
                    .filter(message => message.text.trim() !== "") // Filtra mensajes vacíos
            );
        });

        return unsubscribe;
    }, [professionalId]);

    const onSend = useCallback(
        (messages = []) => {
            const currentUserId = auth.currentUser?.uid;
            if (!currentUserId) {
                console.error("Error: ID del usuario no definido.");
                return;
            }

            setMessages(previousMessages => GiftedChat.append(previousMessages, messages));

            const { _id, createdAt, text, user } = messages[0];
            addDoc(collection(database, 'chats'), {
                _id,
                createdAt,
                text,
                user,
                participants: [currentUserId, professionalId],
            }).catch(error => {
                console.error("Error al enviar el mensaje:", error);
            });
        },
        [professionalId]
    );

    return (
        <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
                _id: auth?.currentUser?.uid,
                avatar: userPhoto, // Foto del usuario
            }}
            messagesContainerStyle={{ backgroundColor: '#fff' }}
            textInputStyle={{ backgroundColor: '#fff', borderRadius: 20 }}
        />
    );
}

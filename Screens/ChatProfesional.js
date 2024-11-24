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
    const [userName, setUserName] = useState("Cargando...");
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params;

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    useLayoutEffect(() => {
        // Actualizar el título con el nombre del usuario
        navigation.setOptions({
            headerTitle: userName,
            headerRight: () => (
                <TouchableOpacity style={{ marginRight: 10 }} onPress={onSignOut}>
                    <AntDesign name="logout" size={24} color={colors.gray} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, userName]);

    useEffect(() => {
        // Obtener el nombre del usuario
        const fetchUserName = async () => {
            try {
                const userDocRef = doc(database, 'users', userId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserName(userDocSnap.data().user || "Sin nombre");
                } else {
                    setUserName("Usuario no encontrado");
                }
            } catch (error) {
                console.error("Error al obtener el nombre del usuario:", error);
                setUserName("Error al cargar");
            }
        };

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

        fetchUserName();
        fetchProfessionalPhoto();

        const currentProfessionalId = auth.currentUser?.uid;
        if (!currentProfessionalId || !userId) {
            console.error("Error: ID del profesional o usuario no definido.");
            return;
        }

        // Consulta a Firestore para obtener los mensajes
        const collectionRef = collection(database, 'chats');
        const q = query(
            collectionRef,
            where('participants', 'array-contains', currentProfessionalId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, querySnapshot => {
            setMessages(
                querySnapshot.docs
                    .filter(doc => doc.data().participants.includes(userId)) // Filtrar por participantes
                    .map(doc => {
                        const data = doc.data();
                        return {
                            _id: data._id || doc.id,
                            createdAt: data.createdAt?.toDate?.() || new Date(),
                            text: data.text || "", // Evitar mostrar texto vacío
                            user: data.user || { _id: "sistema", name: "Sistema" },
                        };
                    })
                    .filter(message => message.text.trim() !== "") // Filtrar mensajes con texto vacío
            );
        });
        

        return unsubscribe;
    }, [userId]);

    const onSend = useCallback(
        (messages = []) => {
            const { text } = messages[0];
            if (!text.trim()) return; // Ignorar mensajes vacíos
    
            setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
    
            const { _id, createdAt, user } = messages[0];
            addDoc(collection(database, 'chats'), {
                _id,
                createdAt,
                text,
                user,
                participants: [auth.currentUser?.uid, userId],
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
                avatar: professionalPhoto,
            }}
            messagesContainerStyle={{ backgroundColor: '#fff' }}
            textInputStyle={{ backgroundColor: '#fff', borderRadius: 20 }}
        />
    );
}

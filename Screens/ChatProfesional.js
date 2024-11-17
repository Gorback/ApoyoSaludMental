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
<<<<<<< HEAD
    const [userPhoto, setUserPhoto] = useState("https://via.placeholder.com/150"); // Imagen de respaldo
=======
    const [professionalPhoto, setProfessionalPhoto] = useState(null);
>>>>>>> 2c2c0ff (Las fotos de los usuarios y profesional se muestran en el chat y agregue los servicios de mercado pago)
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
<<<<<<< HEAD
        const fetchUserPhoto = async () => {
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const photoBase64 = userDocSnap.data().photoURL;
                setUserPhoto(`data:image/jpeg;base64,${photoBase64}`);
            }
        };
        fetchUserPhoto();
=======
        const fetchProfessionalPhoto = async () => {
            const docRef = doc(database, 'profesionales', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const photoBase64 = docSnap.data().photoURL;
                setProfessionalPhoto(`data:image/jpeg;base64,${photoBase64}`);
            } else {
                setProfessionalPhoto("https://via.placeholder.com/150");
            }
        };
        fetchProfessionalPhoto();
>>>>>>> 2c2c0ff (Las fotos de los usuarios y profesional se muestran en el chat y agregue los servicios de mercado pago)

        const currentProfessionalId = auth.currentUser.uid;
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
                    .map(doc => ({
                        _id: doc.data()._id,
                        createdAt: doc.data().createdAt.toDate(),
                        text: doc.data().text,
                        user: doc.data().user,
                    }))
            );
        });

        return unsubscribe;
    }, [userId]);

    const onSend = useCallback((messages = []) => {
        const currentProfessionalId = auth.currentUser.uid;
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));

        const { _id, createdAt, text, user } = messages[0];
        addDoc(collection(database, 'chats'), {
            _id,
            createdAt,
            text,
            user,
            participants: [currentProfessionalId, userId],
        });
    }, [userId]);

    return (
        <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
                _id: auth?.currentUser?.uid,
<<<<<<< HEAD
                avatar: userPhoto,
=======
                avatar: professionalPhoto, // Foto del profesional
>>>>>>> 2c2c0ff (Las fotos de los usuarios y profesional se muestran en el chat y agregue los servicios de mercado pago)
            }}
            messagesContainerStyle={{ backgroundColor: '#fff' }}
            textInputStyle={{ backgroundColor: '#fff', borderRadius: 20 }}
        />
    );
}

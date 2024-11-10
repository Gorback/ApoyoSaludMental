import React, { useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { collection, addDoc, orderBy, query, onSnapshot, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import colors from '../colors';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const navigation = useNavigation();
    const route = useRoute();
    const { professionalId } = route.params; // ID del profesional destinatario

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
        const currentUserId = auth.currentUser.uid;
        const collectionRef = collection(database, 'chats');
        const q = query(
            collectionRef,
            where('participants', 'array-contains', currentUserId), // Filtrar por el usuario actual
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, querySnapshot => {
            setMessages(
                querySnapshot.docs
                    .filter(doc => doc.data().participants.includes(professionalId)) // Filtrar mensajes solo del destinatario actual
                    .map(doc => ({
                        _id: doc.data()._id,
                        createdAt: doc.data().createdAt.toDate(),
                        text: doc.data().text,
                        user: doc.data().user,
                    }))
            );
        });

        return unsubscribe;
    }, [professionalId]);

    const onSend = useCallback((messages = []) => {
        const currentUserId = auth.currentUser.uid;
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        
        const { _id, createdAt, text, user } = messages[0];
        addDoc(collection(database, 'chats'), {
            _id,
            createdAt,
            text,
            user,
            participants: [currentUserId, professionalId], // Agrega ambos usuarios en 'participants'
        });
    }, [professionalId]);

    return (
        <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
                _id: auth?.currentUser?.uid,
                avatar: 'https://i.pravatar.cc/300'
            }}
            messagesContainerStyle={{ backgroundColor: '#fff' }}
            textInputStyle={{ backgroundColor: '#fff', borderRadius: 20 }}
        />
    );
}

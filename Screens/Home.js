import React, { useLayoutEffect } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';
import colors from '../colors';
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const catImageUrl = "https://i.guim.co.uk/img/media/26392d05302e02f7bf4eb143bb84c8097d09144b/446_167_3683_2210/master/3683.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=49ed3252c0b2ffb49cf8b508892e452d";

const Home = () => {

    const navigation = useNavigation();

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    const handleOnPressCallContact = () => {
        Linking.openURL('tel:*4141'); // Cambia *4141 por el número de teléfono real
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={{ uri: catImageUrl }}
                        style={{
                            width: 40,
                            height: 40,
                            marginRight: 190,
                        }}
                    />
                    <TouchableOpacity
                        style={{
                            marginRight: 10
                        }}
                        onPress={onSignOut}
                    >
                        <AntDesign name="logout" size={24} color={colors.gray} style={{ marginRight: 10 }} />
                    </TouchableOpacity>
                </View>
            )
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.navigate("Chat")}
                style={styles.chatButton}
            >
                <Entypo name="chat" size={24} color={colors.lightGray} />
            </TouchableOpacity>

            {/* Aquí hacemos que la imagen sea presionable y limitamos su área */}
            <TouchableOpacity onPress={handleOnPressCallContact}
                style={{
                    width: 70,
                    height: 70,
                    position: 'absolute',
                    bottom: 50,  
                    right: 290,   
                }}>
                <Image
                    source={require("../assets/Llamada.webp")}
                    style={{
                        width: 70,
                        height: 70,
                    }}
                />
            </TouchableOpacity>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        backgroundColor: "#fff",
    },
    chatButton: {
        backgroundColor: colors.primary,
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: .9,
        shadowRadius: 8,
        marginRight: 20,
        marginBottom: 50,
    }
});

import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, database as db } from "../config/firebase"
import { doc, getDoc } from "firebase/firestore";


export default function LoginProfesional({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleOnPressCallContact = () => { Linking.openURL('tel:*4141') };

    const onHandleLogin = async () => {
        if (email !== "" && password !== "") {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const userId = userCredential.user.uid;

                const profesionalDoc = await getDoc(doc(db, "profesionales", userId));

                if (profesionalDoc.exists()) {
                    navigation.navigate("HomeProfesional");
                } else {
                    await signOut(auth);
                    Alert.alert("Error", "Este correo no pertenece a un profesional.");
                }
            } catch (err) {
                Alert.alert("Error en el inicio de sesión", err.message);
            }
        } else {
            Alert.alert("Error", "Por favor completa todos los campos.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.whiteSheet} />
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Login para Profesionales</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAdress"
                    autoFocus={true}
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter Password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                    textContentType="password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />
                <TouchableOpacity style={styles.button} onPress={onHandleLogin}>

                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Log in</Text>

                </TouchableOpacity>
                <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Don't have an account </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("SignUpProfesionales")}>
                        <Text style={{ color: '#f57c00', fontWeight: '600', fontSize: 14 }}>SignUp Profesional</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>I have a user account </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={{ color: '#f57c00', fontWeight: '600', fontSize: 14 }}>Login Usuario</Text>
                    </TouchableOpacity>
                </View>
                <View title='call contact' onPress={handleOnPressCallContact}>
                    <TouchableOpacity title='call contact' onPress={handleOnPressCallContact}
                        style={{
                            width: 70,
                            height: 70,
                            position: 'absolute',
                            bottom: -100,
                            right: -3,
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
            </SafeAreaView>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: "orange",
        alignSelf: "center",
        paddingBottom: 24,
    },
    input: {
        backgroundColor: "#F6F7FB",
        height: 58,
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
    backImage: {
        width: "100%",
        height: 340,
        position: "absolute",
        top: 0,
        resizeMode: 'cover',
    },
    whiteSheet: {
        width: '100%',
        height: '75%',
        position: "absolute",
        bottom: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 60,
    },
    form: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 30,
    },
    button: {
        backgroundColor: '#f57c00',
        height: 58,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
});
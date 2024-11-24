import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Image, SafeAreaView, TouchableOpacity, Alert, Linking, Dimensions } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, database as db } from "../../config/firebase";

const { width, height } = Dimensions.get("window");

export default function Login({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleOnPressCallContact = () => {
        Linking.openURL('tel:*4141');
    };

    const onHandleLogin = async () => {
        if (email !== "" && password !== "") {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const userId = userCredential.user.uid;

                const userDoc = await getDoc(doc(db, "users", userId));

                if (userDoc.exists()) {
                    // Verificar si el usuario es profesional o un usuario regular
                    const isProfesional = userDoc.data().isProfesional;

                    // Redirigir al stack correcto según el rol del usuario
                    if (isProfesional) {
                        navigation.replace("HomeProfesional");
                    } else {
                        navigation.replace("Home");
                    }
                } else {
                    await signOut(auth);
                    Alert.alert("Error", "Este correo no pertenece a un usuario regular.");
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
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Login Usuario</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
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
                    <Text style={styles.buttonText}>Log in</Text>
                </TouchableOpacity>

                <View style={styles.linkContainer}>
                    <Text style={styles.linkText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                        <Text style={styles.linkAction}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.linkContainer}>
                    <Text style={styles.linkText}>Login for Profesional </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("LoginProfesional")}>
                        <Text style={styles.linkAction}>LoginProfesional</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleOnPressCallContact} style={styles.callButton}>
                    <Image
                        source={require("../../assets/Llamada.webp")}
                        style={styles.callImage}
                    />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: width * 0.08, // Tamaño relativo a la anchura
        fontWeight: "bold",
        color: "orange",
        alignSelf: "center",
        paddingBottom: 24,
    },
    input: {
        backgroundColor: "#F6F7FB",
        height: height * 0.07, // Altura relativa
        marginBottom: 20,
        fontSize: width * 0.045,
        borderRadius: 10,
        padding: 12,
    },
    form: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: width * 0.1, // Espaciado relativo
    },
    button: {
        backgroundColor: "#f57c00",
        height: height * 0.07,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        fontWeight: "bold",
        color: "#fff",
        fontSize: width * 0.05,
    },
    linkContainer: {
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
    },
    linkText: {
        color: "gray",
        fontWeight: "600",
        fontSize: width * 0.04,
    },
    linkAction: {
        color: "#f57c00",
        fontWeight: "600",
        fontSize: width * 0.04,
    },
    callButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        borderRadius: 35,
        width: 70,
        height: 70,
    },
    callImage: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
});

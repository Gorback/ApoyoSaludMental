import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { database as db } from "../config/firebase";

export default function SignUpProfesionalesDetail({ route, navigation }) {
    const { email, password, userProfesional, fechaNacimiento, genero, otroGenero } = route.params;
    const [especialidad, setEspecialidad] = useState("");
    const [tarifa, setTarifa] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const onHandleCompleteSignUp = () => {
        if (especialidad && tarifa && descripcion) {
            // Finalmente registrar al usuario en Firebase
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const userId = userCredential.user.uid;
                    return setDoc(doc(db, "profesionales", userId), {
                        userProfesional,
                        email,
                        fechaNacimiento,
                        genero: genero === "Otros" ? otroGenero : genero,
                        especialidad,
                        tarifa,
                        descripcion
                    });
                })
                .then(() => {
                    Alert.alert("Registro exitoso");
                    navigation.navigate("HomeProfesional");  // O la pantalla que desees
                })
                .catch((error) => {
                    Alert.alert("Error", error.message);
                });
        } else {
            Alert.alert("Error", "Completa todos los campos");
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Completar Registro</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Especialidad"
                    value={especialidad}
                    onChangeText={setEspecialidad}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Tarifa"
                    value={tarifa}
                    onChangeText={setTarifa}
                    keyboardType="numeric"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Descripción"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    multiline
                />

                <TouchableOpacity  style={styles.button} onPress={onHandleCompleteSignUp} >
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }} >Completar Registro</Text>
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

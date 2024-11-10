import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, Alert, Image } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, database as db, storage } from "../../config/firebase";
import * as ImagePicker from 'expo-image-picker';

export default function SignUpProfesionalesDetail({ route, navigation }) {
    const { email, password, userProfesional, fechaNacimiento, genero, otroGenero } = route.params;
    const [especialidad, setEspecialidad] = useState("");
    const [tarifa, setTarifa] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [image, setImage] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a tus fotos');
            }
        })();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        } else {
            Alert.alert("Error", "No se seleccionó ninguna imagen.");
        }
    };

    const uploadImageAsBase64 = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]); // Obtener solo el string base64
            };
            reader.onerror = reject;
        });
    };
    

    const onHandleCompleteSignUp = async () => {
        if (especialidad && tarifa && descripcion && image) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const userId = userCredential.user.uid;
                const imageUrl = await uploadImageAsBase64(image);

                await setDoc(doc(db, "profesionales", userId), {
                    userProfesional,
                    email,
                    fechaNacimiento,
                    genero: genero === "Otros" ? otroGenero : genero,
                    especialidad,
                    tarifa,
                    descripcion,
                    photoURL: imageUrl
                });

                Alert.alert("Registro exitoso", "Tu cuenta ha sido creada correctamente");
                navigation.navigate("HomeProfesional");
            } catch (error) {
                Alert.alert("Error", error.message);
            }
        } else {
            Alert.alert("Error", "Por favor completa todos los campos y selecciona una foto de perfil");
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Completar Registro</Text>

                <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <Text>Seleccionar foto de perfil</Text>
                    )}
                </TouchableOpacity>

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

                <TouchableOpacity style={styles.button} onPress={onHandleCompleteSignUp}>
                    <Text style={styles.buttonText}>Completar Registro</Text>
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
        marginTop: 10,
    },
    buttonText: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 18,
    },
    imageContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#F6F7FB',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

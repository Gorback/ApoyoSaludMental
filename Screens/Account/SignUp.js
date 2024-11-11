import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, Image, Alert, Linking } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import { doc, setDoc } from "firebase/firestore";
import { auth, database as db } from "../../config/firebase";
import * as ImagePicker from 'expo-image-picker';

export default function SignUp({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [genero, setGenero] = useState("");
    const [otroGenero, setOtroGenero] = useState("");
    const [image, setImage] = useState(null);

    const handleOnPressCallContact = () => { Linking.openURL('tel:*4141'); };

    const pickImage = async () => {
        // Solicitar permiso para acceder a la galería
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permiso requerido", "Necesitamos permiso para acceder a tus fotos.");
            return;
        }

        // Abrir la galería de imágenes
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.cancelled) {
            setImage(result.uri);
        } else {
            Alert.alert("Error", "No se seleccionó ninguna imagen.");
        }
    };

    const uploadImageAsBase64 = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result.split(',')[1]; // Obtener solo el string base64
                resolve(base64data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const onHandleSignUp = async () => {
        if (email && password && user && fechaNacimiento && genero) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const userId = userCredential.user.uid;
                let imageUrl = null;
                if (image) {
                    imageUrl = await uploadImageAsBase64(image);
                }
                await setDoc(doc(db, "users", userId), {
                    user: user,
                    email: email,
                    fechaNacimiento: fechaNacimiento.toISOString(),
                    genero: genero === "Otros" ? otroGenero : genero,
                    photoURL: imageUrl,
                });
                console.log("Registro y datos guardados con éxito");
                // Navegar a la pantalla de inicio u otra después del registro
                navigation.navigate("Home");
            } catch (err) {
                Alert.alert("Error en el registro", err.message);
            }
        } else {
            Alert.alert("Error", "Por favor completa todos los campos.");
        }
    };

    const showDatePickerModal = () => {
        setShowDatePicker(true);
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || fechaNacimiento;
        setShowDatePicker(false);
        setFechaNacimiento(currentDate);
    };

    return (
        <View style={styles.container}>
            <View style={styles.whiteSheet} />
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Sign Up Usuario</Text>

                {/* Botón para seleccionar imagen */}
                <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <Text style={styles.imageText}>Seleccionar foto de perfil</Text>
                    )}
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder="Nombre de usuario"
                    autoCapitalize="none"
                    value={user}
                    onChangeText={(text) => setUser(text)}
                />

                <Text style={styles.label}>Fecha de Nacimiento</Text>
                <TouchableOpacity style={styles.input} onPress={showDatePickerModal}>
                    <Text>{fechaNacimiento ? fechaNacimiento.toDateString() : "Fecha de Nacimiento"}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={fechaNacimiento}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}

                <Text style={styles.label}>Género</Text>
                <Picker
                    selectedValue={genero}
                    style={styles.input}
                    onValueChange={(itemValue) => setGenero(itemValue)}
                >
                    <Picker.Item label="Masculino" value="Masculino" />
                    <Picker.Item label="Femenino" value="Femenino" />
                    <Picker.Item label="Otros" value="Otros" />
                </Picker>
                {genero === "Otros" && (
                    <TextInput
                        style={styles.input}
                        placeholder="Especifica tu género"
                        value={otroGenero}
                        onChangeText={(text) => setOtroGenero(text)}
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Correo Electrónico"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    autoCapitalize="none"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />

                <TouchableOpacity style={styles.button} onPress={onHandleSignUp}>
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Registrarse</Text>
                </TouchableOpacity>

                {/* Enlaces adicionales */}
                <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>¿Ya tienes una cuenta?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={{ color: '#f57c00', fontWeight: '600', fontSize: 14 }}> Iniciar sesión</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>¿Eres profesional?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("SignUpProfesionales")}>
                        <Text style={{ color: '#f57c00', fontWeight: '600', fontSize: 14 }}> Regístrate aquí</Text>
                    </TouchableOpacity>
                </View>

                {/* Botón para llamar */}
                <View title='call contact' onPress={handleOnPressCallContact}>
                    <TouchableOpacity onPress={handleOnPressCallContact}
                        style={{
                            width: 70,
                            height: 70,
                            position: 'absolute',
                            bottom: -70,
                            right: 280,
                        }}>
                        <Image
                            source={require("../../assets/Llamada.webp")}
                            style={{
                                width: 70,
                                height: 70,
                            }}
                        />
                    </TouchableOpacity>
                </View>
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
    label: {
        marginBottom: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
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
        marginTop: 20,
    },
    imageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
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
    imageText: {
        color: '#aaa',
        fontSize: 16,
    },
});

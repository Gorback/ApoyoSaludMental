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
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (!permissionResult.granted) {
            Alert.alert("Permiso requerido", "Necesitamos permiso para acceder a tus fotos.");
            return;
        }
    
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });
    
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const selectedUri = result.assets[0].uri;
    
            try {
                const response = await fetch(selectedUri);
                const blob = await response.blob();
    
                if (blob.size > 1000000) { // Límite de 1 MB
                    Alert.alert(
                        "Imagen demasiado pesada",
                        "La imagen seleccionada es demasiado pesada. Por favor selecciona una imagen menor a 1 MB."
                    );
                    return;
                }
    
                setImage(selectedUri); // Establece la imagen solo si cumple el tamaño
            } catch (error) {
                Alert.alert("Error", "Ocurrió un problema al procesar la imagen.");
            }
        } else {
            Alert.alert("Error", "No se seleccionó ninguna imagen.");
        }
    };
    

    const uploadImageAsBase64 = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const reader = new FileReader();
    
            return new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1]; // Obtener solo el string base64
                    console.log("Base64 Encoded Data:", base64data); // Verificar que el dato base64 se genera
                    resolve(base64data);
                };
                reader.onerror = (error) => {
                    console.error("Error al leer blob como base64:", error);
                    reject(error);
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error al convertir la imagen a base64:", error);
            throw new Error("La conversión de imagen a base64 falló.");
        }
    };
    

    const onHandleSignUp = async () => {
        if (email && password && user && fechaNacimiento && genero) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const userId = userCredential.user.uid;
                let imageUrl = null;
                
                if (image) {
                    // Esperar a que la imagen se convierta a base64 antes de continuar
                    imageUrl = await uploadImageAsBase64(image);
                }
    
                // Guardar el documento del usuario con todos los datos, incluyendo la imagen
                await setDoc(doc(db, "users", userId), {
                    user: user,
                    email: email,
                    fechaNacimiento: fechaNacimiento.toISOString(),
                    genero: genero === "Otros" ? otroGenero : genero,
                    photoURL: imageUrl,
                });
    
                console.log("Registro y datos guardados con éxito");
                
                // Navegar a la pantalla de inicio después de guardar todos los datos
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
        paddingBottom: 20,
    },
input: {
    backgroundColor: "#fff",
    height: 50,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    width: "100%", // Asegura que el Picker ocupe todo el ancho del contenedor
    borderWidth: 1,
    borderColor: "#ddd",
},
picker: {
    height: 50,
    width: "100%", // Configuración para que el Picker use todo el ancho disponible
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
        marginTop: 5,
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

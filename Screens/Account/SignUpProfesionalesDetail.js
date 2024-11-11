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

    const onHandleSignUp = () => {
        if (email && password && user && fechaNacimiento && genero) {
            createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    const userId = userCredential.user.uid;
                    let imageUrl = null;
                    if (image) {
                        imageUrl = await uploadImageAsBase64(image);
                    }
                    await setDoc(doc(db, "users", userId), {
                        user,
                        email,
                        fechaNacimiento: fechaNacimiento.toISOString(),
                        genero: genero === "Otros" ? otroGenero : genero,
                        photoURL: imageUrl,
                    });
                    console.log("Registro y datos guardados con éxito");
                    Alert.alert("Éxito", "Registro y datos guardados con éxito");
                })
                .catch((err) => {
                    Alert.alert("Error", err.message);
                });
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

    return (
        <View style={styles.container}>
            <View style={styles.whiteSheet} />
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Sign Up Usuario</Text>

                {/* Botón de selección de imagen */}
                <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <Text>Seleccionar foto de perfil</Text>
                    )}
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder="Enter User"
                    autoCapitalize="none"
                    value={user}
                    onChangeText={(text) => setUser(text)}
                />

                <Text style={styles.label}>Selecciona tu fecha de Nacimiento</Text>
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

                <Text style={styles.label}>Selecciona tu género</Text>
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
                    placeholder="Enter Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Enter Password"
                    autoCapitalize="none"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />

                <TouchableOpacity style={styles.button} onPress={onHandleSignUp}>
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Sign Up</Text>
                </TouchableOpacity>

                {/* Botones de navegación */}
                <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>I have an account</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={{ color: '#f57c00', fontWeight: '600', fontSize: 14 }}> Login</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>I'm Profesional</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("SignUpProfesionales")}>
                        <Text style={{ color: '#f57c00', fontWeight: '600', fontSize: 14 }}> SignUpProfesionales</Text>
                    </TouchableOpacity>
                </View>

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

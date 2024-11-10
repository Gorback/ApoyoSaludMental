import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput, SafeAreaView, TouchableOpacity, StatusBar, Image, Alert, Platform, Linking } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import { doc, setDoc } from "firebase/firestore";
import { auth, database as db } from "../../config/firebase";


export default function SignUp({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [genero, setGenero] = useState("")
    const [otroGenero, setOtroGenero] = useState("");
    const handleOnPressCallContact = () => { Linking.openURL('tel:*4141') };

    const onHandleSignUp = () => {
        if (email !== "" && password !== "" && user !== "" && fechaNacimiento !== "" && genero !== "") {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const userId = userCredential.user.uid;
                    return setDoc(doc(db, "users", userId), {
                        user: user,
                        email: email,
                        fechaNacimiento: fechaNacimiento.toISOString(),
                        genero: genero === "Otros" ? otroGenero : genero
                    });
                })
                .then(() => {
                    console.log("Registro y datos guardados con éxito");
                })
                .catch((err) => {
                    Alert.alert("Login error", err.message);
                });
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
                        onClose={() => setShowDatePicker(false)} // Asegura que se cierre después de seleccionar
                    />
                )}
                {/* Selección de género */}
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
                    <TouchableOpacity title='call contact' onPress={handleOnPressCallContact}
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
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
});
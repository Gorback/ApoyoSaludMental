import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";

export default function SignUpProfesionales({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userProfesional, setUserProfesional] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [genero, setGenero] = useState("");
    const [otroGenero, setOtroGenero] = useState("");

    const onHandleSignUp = () => {
        if (!email || !password || !userProfesional || !fechaNacimiento || !genero || (genero === "Otros" && !otroGenero)) {
            Alert.alert("Error", "Por favor completa todos los campos correctamente.");
            return;
        }

        // Navegación a la siguiente pantalla
        navigation.navigate("SignUpProfesionalesDetail", {
            email,
            password,
            userProfesional,
            fechaNacimiento: fechaNacimiento.toISOString(),
            genero,
            otroGenero: genero === "Otros" ? otroGenero : null  // Solo envía `otroGenero` si es necesario
        });
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
            <SafeAreaView style={styles.form}>
                <Text style={styles.title}>Sign Up Profesionales</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nombre del Profesional"
                    value={userProfesional}
                    onChangeText={setUserProfesional}
                />

                <Text style={styles.label}>Fecha de Nacimiento</Text>
                <TouchableOpacity style={styles.input} onPress={showDatePickerModal}>
                    <Text>{fechaNacimiento ? fechaNacimiento.toDateString() : "Fecha de Nacimiento"}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={fechaNacimiento}
                        mode="date"
                        onChange={onDateChange}
                    />
                )}

                <Text style={styles.label}>Género</Text>
                <Picker
                    selectedValue={genero}
                    style={styles.input}
                    onValueChange={setGenero}
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
                        onChangeText={setOtroGenero}
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Correo Electrónico"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={onHandleSignUp}>
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Siguiente</Text>
                </TouchableOpacity>


                <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                    <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>I have a user account </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("LoginProfesional")}>
                        <Text style={{ color: '#f57c00', fontWeight: '600', fontSize: 14 }}>Login Profesional</Text>
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
    label: {
        marginBottom: 10,
        fontSize: 16,
    },
});

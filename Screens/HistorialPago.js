import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import { database } from "../config/firebase";

export default function HistorialPago() {
    const route = useRoute();
    const { professionalId } = route.params || {};
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!professionalId) {
            console.error("Error: professionalId no definido.");
            setLoading(false);
            return;
        }

        const collectionRef = collection(database, "pagos");
        const q = query(
            collectionRef,
            where("professionalId", "==", professionalId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const pagosConNombres = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const pago = docSnap.data();
                    let userName = "Usuario desconocido"; // Valor por defecto

                    try {
                        // Consultar la colección "users" para obtener el nombre del usuario
                        const userDocRef = doc(database, "users", pago.idUsuario);
                        const userDocSnap = await getDoc(userDocRef);

                        if (userDocSnap.exists()) {
                            userName = userDocSnap.data().user || "Usuario sin nombre"; // Obtenemos el campo "user"
                        }
                    } catch (error) {
                        console.error(`Error al obtener el usuario ${pago.idUsuario}:`, error);
                    }

                    return {
                        id: docSnap.id,
                        ...pago,
                        userName, // Incluye el nombre real del usuario
                    };
                })
            );

            setPagos(pagosConNombres);
            setLoading(false);
        });

        return unsubscribe;
    }, [professionalId]);

    const renderPago = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.title}>Usuario: {item.userName}</Text>
            <Text style={styles.detail}>Monto: ${item.tarifa || "No disponible"}</Text>
            <Text style={styles.detail}>
                Fecha: {item.createdAt?.toDate().toLocaleString() || "Sin fecha"}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#009EE3" />
            ) : pagos.length > 0 ? (
                <FlatList
                    data={pagos}
                    renderItem={renderPago}
                    keyExtractor={(item) => item.id}
                />
            ) : (
                <Text style={styles.emptyText}>No se encontraron pagos.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    card: {
        backgroundColor: "#F6F7FB",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    detail: {
        fontSize: 14,
        color: "#555",
        marginTop: 5,
    },
    emptyText: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginTop: 20,
    },
});

const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// Inicializa Firebase Admin SDK
const serviceAccount = require("./path/to/serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
app.use(bodyParser.json());

// Ruta para el Webhook de Mercado Pago
app.post("/webhook", async (req, res) => {
    const { id, topic } = req.body;

    if (topic === "merchant_order") {
        try {
            // Obtén información del pedido desde la API de Mercado Pago
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                },
            });
            const payment = await response.json();

            // Actualiza el estado del pago en Firestore
            await db.collection("payments").doc(payment.id).update({
                status: payment.status,
                updatedAt: new Date(),
            });

            res.sendStatus(200);
        } catch (error) {
            console.error("Error al procesar el webhook:", error);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(400);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

import axios from "axios";

const BASE_URL = "https://api.mercadopago.com";
const ACCESS_TOKEN = "TEST-5099361486343963-111315-34cd78d0dc43da0aee1898844d6bf963-635317043";

export const createPaymentPreference = async ({ title, price, userEmail }) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/checkout/preferences`,
            {
                items: [
                    {
                        title,
                        quantity: 1,
                        currency_id: "CLP", // Moneda chilena
                        unit_price: parseFloat(price),
                    },
                ],
                payer: {
                    email: userEmail || "usuario_prueba@gmail.com", // Cambia esto por un email de prueba
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                },
            }
        );

        return response.data.init_point; // URL de pago
    } catch (error) {
        console.error("Error al crear la preferencia de pago:", error.response?.data || error.message);
        throw new Error(`Error al crear la preferencia: ${error.response?.data || error.message}`);
    }
};

// Ejemplo de uso:
(async () => {
    try {
        const paymentUrl = await createPaymentPreference({
            title: "Sesión de prueba",
            price: 5000,
            userEmail: "usuario_prueba@gmail.com",
        });
        console.log("URL de pago:", paymentUrl);
    } catch (error) {
        console.error(error.message);
    }
})();

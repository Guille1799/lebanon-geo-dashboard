// Este es el archivo: netlify/functions/ask-gemini.js

// Importamos 'GenerativeAI' del paquete oficial de Google
// Netlify lo instalará automáticamente por nosotros.
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Esta es la "función" que Netlify ejecutará
exports.handler = async (event, context) => {
    
    // 1. Validar que la petición sea un POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // 2. Obtener la clave API secreta desde las variables de Netlify
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return { statusCode: 500, body: "API Key no encontrada." };
    }

    try {
        // 3. Inicializar el cliente de Google AI
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 4. Obtener el "prompt" que envió el app.js
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return { statusCode: 400, body: "No se ha proporcionado un prompt." };
        }

        // 5. Llamar a la API de Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 6. Devolver la respuesta de la IA a nuestro app.js
        return {
            statusCode: 200,
            body: JSON.stringify({ message: text }),
        };

    } catch (error) {
        console.error("Error al llamar a la API de Gemini:", error);
        return { statusCode: 500, body: `Error interno del servidor: ${error.message}` };
    }
};
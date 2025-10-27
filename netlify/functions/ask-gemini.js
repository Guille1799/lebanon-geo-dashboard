// Este es el archivo: netlify/functions/ask-gemini.js (VERSIÓN 2 - BLINDADA)
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Función auxiliar para devolver un error en JSON
function createErrorResponse(statusCode, message) {
    return {
        statusCode: statusCode,
        body: JSON.stringify({ error: message }),
    };
}

exports.handler = async (event, context) => {
    
    // 1. Validar que la petición sea un POST
    if (event.httpMethod !== "POST") {
        return createErrorResponse(405, "Method Not Allowed");
    }

    // 2. Obtener la clave API secreta
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return createErrorResponse(500, "API Key no encontrada. Asegúrate de que la variable de entorno GEMINI_API_KEY esté configurada en Netlify.");
    }

    let prompt;
    
    try {
        // 4. Obtener el "prompt" que envió el app.js
        prompt = JSON.parse(event.body).prompt;
        if (!prompt) {
            return createErrorResponse(400, "No se ha proporcionado un prompt.");
        }
    } catch (e) {
        return createErrorResponse(400, "Cuerpo de la petición (body) mal formado. Debe ser JSON.");
    }

    try {
        // 5. Inicializar el cliente de Google AI y llamar
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 6. Devolver la respuesta de la IA a nuestro app.js
        return {
            statusCode: 200,
            body: JSON.stringify({ message: text }),
        };

    } catch (error) {
        console.error("Error al llamar a la API de Gemini:", error.message);
        return createErrorResponse(500, `Error interno del servidor al contactar la IA: ${error.message}`);
    }
};


import { v2 as cloudinary } from "cloudinary";
import { Buffer } from "buffer";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

// Configurar Cloudinary con tus credenciales
cloudinary.config({
  cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

// @ts-ignore
export const POST = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No se ha enviado ningún archivo" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("📸 Archivo recibido:", file.name);

    // Convertir el archivo a buffer y luego a Base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, { folder: "uploads" });
    const imageUrl = result.secure_url;

    console.log(imageUrl);

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Usar el nuevo modelo
      messages: [
        { role: "system", content: "Eres un asistente que extrae texto de imágenes y debes analizar e interpretar la información extraída. Y tambien la informacion visual e intentar identificar la imagen que se está analizando si se trata de un coche marca y modelo si es un escudo a quien pertenece etc." },
        { role: "user", content: [
          { type: "text", text: "Extrae el texto de esta imagen:" },
          { type: "image_url", image_url: { url: imageUrl } }
        ]},
      ],
      max_tokens: 500,
    });
    const text =response.choices[0].message.content
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error("OpenAI no devolvió una respuesta válida.");
    }
    return new Response(JSON.stringify({ message: "Imagen subida correctamente", 
      imageUrl: result.secure_url,
      // @ts-ignore
      response: text
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: Error | any) {
    console.error("❌ ERROR en la API:", error);
    return new Response(JSON.stringify({ error: error.message || "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

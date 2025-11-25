import axios from "axios";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL;

export async function analyzeFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${backendUrl}/api/analyze`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Unknown error from server");
    }

    // return full AI wrapper (may include { raw, structured, model })
    return {
      text: response.data.text || "",
      ai: response.data.ai || null,
      model: response.data.model || response.data.ai?.model || null,
    };
  } catch (error) {
    console.error("Error calling analyze API:", error);
    throw new Error(
      error.response?.data?.error || error.message || "Failed to call API"
    );
  }
}

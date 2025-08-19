// src/app/api/chat/route.js

export async function POST(request) {
  try {
    const { message } = await request.json();

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return Response.json({
        role: "bot",
        text: "Error: HF_API_KEY missing",
      });
    }

    // Call HF Inference
    const response = await fetch(
  "https://api-inference.huggingface.co/models/google/flan-t5-small",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ inputs: message }),
  }
);

      


    const data = await response.json();
    const botText =
      typeof data === "string"
        ? data
        : data?.[0]?.generated_text || "Sorry, something went wrong.";

    return Response.json({
      role: "bot",
      text: botText,
      ts: Date.now(),
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { text: "Server error. Try again later." },
      { status: 500 }
    );
  }
}

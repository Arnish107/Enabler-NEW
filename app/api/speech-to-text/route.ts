import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, hasOpenAI, transcribeAudio } from "@/lib/openai";
import { addHistory } from "@/lib/history-store";
import { mapTextToSigns } from "@/lib/sign-mapping";

export async function POST(request: NextRequest) {
  try {
    if (!hasOpenAI()) {
      return NextResponse.json(
        {
          error: "missing_key",
          message:
            "OPENAI_API_KEY is not configured. Add it to .env.local or Vercel environment variables.",
        },
        { status: 503 },
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let transcript = "";
    let language = "en";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const audio = form.get("audio");
      language = String(form.get("language") || "en");
      const textField = form.get("transcript");

      if (typeof textField === "string" && textField.trim()) {
        transcript = textField.trim();
      } else if (audio instanceof Blob) {
        const buffer = Buffer.from(await audio.arrayBuffer());
        transcript = await transcribeAudio(buffer, "speech.webm");
      }
    } else {
      const body = await request.json();
      language = body.language || "en";
      if (body.transcript) {
        transcript = String(body.transcript).trim();
      } else if (body.audio) {
        const buffer = Buffer.from(body.audio, "base64");
        transcript = await transcribeAudio(buffer);
      }
    }

    if (!transcript) {
      return NextResponse.json(
        { error: "missing_input", message: "Provide transcript or audio." },
        { status: 400 },
      );
    }

    const cleaned = await chatCompletion(
      "You clean speech transcripts for an accessibility app. Return only the cleaned, punctuated transcript. Keep the original language. Do not add commentary.",
      transcript,
      { temperature: 0.1 },
    );

    const finalText = cleaned || transcript;
    const signs = mapTextToSigns(finalText);

    addHistory({
      type: "speech-sign",
      title: "Speech → Sign",
      content: finalText,
      meta: { language, signs },
    });

    return NextResponse.json({
      transcript: finalText,
      confidence: 0.92,
      language,
      signs,
      source: "openai",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Speech processing failed";
    return NextResponse.json({ error: "failed", message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { processSpeechInput } from "@/lib/speech-processor";
import { processWithAI } from "@/lib/ai-process";
import { transcribeAudioBase64, hasOpenAI } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      transcript,
      language = "en-US",
      audio,
      mimeType = "audio/webm",
      enhance = true,
    } = body;

    if (!transcript && !audio) {
      return NextResponse.json(
        {
          error: "Missing input",
          message: "Provide a transcript from Web Speech API or base64 audio data.",
        },
        { status: 400 },
      );
    }

    let rawTranscript = transcript ?? "";
    let source: "web-speech" | "audio-processing" = "web-speech";
    let audioConfidence = 0.85;

    if (audio && !transcript) {
      if (!hasOpenAI()) {
        return NextResponse.json(
          {
            error: "Audio processing unavailable",
            message:
              "Server-side audio STT requires OPENAI_API_KEY. Use browser Web Speech API and send the transcript field, or configure OpenAI for Whisper.",
            fallback: true,
          },
          { status: 422 },
        );
      }

      const whisper = await transcribeAudioBase64(audio, mimeType);
      rawTranscript = whisper.transcript;
      audioConfidence = whisper.confidence;
      source = "audio-processing";
    }

    const result = processSpeechInput(rawTranscript, language, source);
    result.confidence = Math.max(result.confidence, audioConfidence);

    if (enhance && rawTranscript.trim()) {
      const enhanced = await processWithAI(rawTranscript, "enhance-transcript");
      result.transcript = enhanced.result;
      result.confidence = Math.max(
        result.confidence,
        enhanced.confidence,
      );
      result.pipeline.push({
        id: "ai-enhance",
        label: "AI transcript enhancement",
        status: "complete",
        detail: enhanced.source,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not process speech input.";
    return NextResponse.json(
      { error: "Processing failed", message },
      { status: 500 },
    );
  }
}

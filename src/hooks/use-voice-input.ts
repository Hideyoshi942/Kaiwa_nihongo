"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [whisperAvailable, setWhisperAvailable] = useState(false);
  const [mode, setMode] = useState<"browser" | "whisper">("browser");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetch("/api/transcribe")
      .then((r) => r.json())
      .then((data: { available: boolean }) => {
        setWhisperAvailable(data.available);
        if (data.available) setMode("whisper");
      })
      .catch(() => setWhisperAvailable(false));
  }, []);

  const browserSupported = !!getSpeechRecognition();
  const supported = browserSupported || whisperAvailable;

  const startBrowserRecognition = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return false;

    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      setTranscript(result[0].transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    return true;
  }, []);

  const startWhisperRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        if (blob.size > 0 && whisperAvailable) {
          setIsTranscribing(true);
          try {
            const formData = new FormData();
            formData.append("audio", blob);
            const res = await fetch("/api/transcribe", { method: "POST", body: formData });
            if (res.ok) {
              const data = await res.json();
              setTranscript(data.text ?? "");
            }
          } catch {
            /* fall through */
          } finally {
            setIsTranscribing(false);
          }
        }
        setIsListening(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      return true;
    } catch {
      return false;
    }
  }, [whisperAvailable]);

  const startListening = useCallback(async () => {
    setTranscript("");
    setIsListening(true);

    if (mode === "whisper" && whisperAvailable) {
      const ok = await startWhisperRecording();
      if (ok) return;
    }

    const ok = startBrowserRecognition();
    if (!ok) setIsListening(false);
  }, [mode, whisperAvailable, startWhisperRecording, startBrowserRecognition]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => setTranscript(""), []);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "whisper" && whisperAvailable ? "browser" : "whisper"));
  }, [whisperAvailable]);

  return {
    isListening,
    isTranscribing,
    transcript,
    supported,
    whisperAvailable,
    mode,
    toggleMode,
    startListening,
    stopListening,
    resetTranscript,
  };
}

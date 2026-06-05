"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VoiceButton({
  isListening,
  isTranscribing,
  supported,
  whisperMode,
  disabled,
  onStart,
  onStop,
  onToggleMode,
  label,
  listeningLabel,
  transcribingLabel,
  whisperLabel,
}: {
  isListening: boolean;
  isTranscribing?: boolean;
  supported: boolean;
  whisperMode?: boolean;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleMode?: () => void;
  label: string;
  listeningLabel: string;
  transcribingLabel?: string;
  whisperLabel?: string;
}) {
  if (!supported) return null;

  const busy = isListening || isTranscribing;

  return (
    <div className="flex items-center gap-1">
      {whisperLabel && onToggleMode && (
        <button
          type="button"
          onClick={onToggleMode}
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-medium border transition-colors",
            whisperMode
              ? "border-crimson/40 bg-crimson/10 text-crimson"
              : "border-border text-muted hover:text-foreground"
          )}
          title={whisperLabel}
        >
          {whisperMode ? "AI" : "Web"}
        </button>
      )}
      <Button
        type="button"
        variant={busy ? "default" : "outline"}
        size="default"
        disabled={disabled || isTranscribing}
        onClick={busy ? onStop : onStart}
        title={isTranscribing ? transcribingLabel : isListening ? listeningLabel : label}
        className={cn(busy && "animate-pulse bg-crimson")}
      >
        {isTranscribing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

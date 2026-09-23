"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Languages, Loader2, Volume2 } from "lucide-react";
import type { AchievementId, ChatMessage, Conversation } from "@/lib/types";
import { getMessageTranslation } from "@/lib/types";
import type { Scenario } from "@/lib/types";
import { getLocalizedScenario, getOpeningTranslation } from "@/lib/scenario-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { AdaptiveLevel } from "@/lib/adaptive-difficulty";
import { AdaptiveBadge } from "@/components/adaptive-badge";
import { FeedbackPanel } from "@/components/feedback-panel";
import { VoiceButton } from "@/components/voice-button";
import { AchievementToast } from "@/components/achievement-toast";
import { SessionSummaryDialog } from "@/components/session-summary-dialog";
import { summarizeSession, type SessionSummary } from "@/lib/session-summary";
import { useLocale } from "@/components/locale-provider";
import { speakJapanese } from "@/lib/speech";
import { useVoiceInput } from "@/hooks/use-voice-input";
import {
  ChatError,
  addGuestReviewCard,
  checkAchievements,
  fetchAdaptiveLevel,
  grantGuestXp,
  saveGuestConversation,
  sendChatTurn,
  trackGuestVoiceMessage,
} from "@/lib/data-service";
import { getAiAvatar } from "@/lib/avatars";
import { AiAvatarBadge } from "@/components/ai-avatar";
import { cn } from "@/lib/utils";

function buildOpeningMessage(scenario: Scenario, locale: "en" | "vi"): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: scenario.openingMessage,
    translations: {
      en: getOpeningTranslation(scenario, "en"),
      vi: getOpeningTranslation(scenario, "vi"),
    },
    translation: getOpeningTranslation(scenario, locale),
    createdAt: new Date().toISOString(),
  };
}

const ERROR_TEXT_JA = "申し訳ございません。エラーが発生しました。もう一度お試しください。";

/** False for error notices, including ones saved by older versions of the app. */
function isRealMessage(msg: ChatMessage): boolean {
  return !msg.failed && !(msg.role === "assistant" && msg.content === ERROR_TEXT_JA);
}

export function ChatInterface({
  scenario,
  existingConversation,
}: {
  scenario: Scenario;
  existingConversation?: Conversation;
}) {
  const router = useRouter();
  const { locale, messages: m } = useLocale();
  const localized = getLocalizedScenario(scenario, locale);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [conversationId] = useState(existingConversation?.id ?? crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessage[]>(
    existingConversation?.messages ?? [buildOpeningMessage(scenario, locale)]
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [latestFeedback, setLatestFeedback] = useState(
    existingConversation?.messages.filter((msg) => msg.feedback).at(-1)?.feedback
  );
  const [newAchievements, setNewAchievements] = useState<AchievementId[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [adaptiveLevel, setAdaptiveLevel] = useState<AdaptiveLevel>("N4");
  const pendingVoiceSend = useRef(false);
  const sendMessageRef = useRef<(text?: string, voice?: boolean) => Promise<void>>(async () => {});

  const {
    isListening,
    isTranscribing,
    transcript,
    supported: voiceSupported,
    whisperAvailable,
    mode,
    toggleMode,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput();

  useEffect(() => {
    fetchAdaptiveLevel().then((info) => setAdaptiveLevel(info.level));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (transcript && !pendingVoiceSend.current) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    if (
      pendingVoiceSend.current &&
      !isListening &&
      !isTranscribing &&
      transcript.trim()
    ) {
      pendingVoiceSend.current = false;
      sendMessageRef.current(transcript.trim(), true);
    }
  }, [isListening, isTranscribing, transcript]);

  const existingCreatedAt = existingConversation?.createdAt;
  const persistGuest = useCallback(
    (msgs: ChatMessage[], overallScore?: number) => {
      const conv: Conversation = {
        id: conversationId,
        scenarioId: scenario.id,
        scenarioTitle: localized.title,
        messages: msgs,
        overallScore,
        createdAt: existingCreatedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveGuestConversation(conv);
    },
    [conversationId, scenario.id, localized.title, existingCreatedAt]
  );

  const sendMessage = useCallback(
    async (textOverride?: string, voiceMode = false) => {
      const text = (textOverride ?? input).trim();
      if (!text || loading) return;

      // Error notices are UI-only: keep them out of the AI history and saved data.
      const conversationSoFar = messages.filter(isRealMessage);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        isVoice: voiceMode,
        createdAt: new Date().toISOString(),
      };
      const streamingId = crypto.randomUUID();
      const streamingMsg: ChatMessage = {
        id: streamingId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, streamingMsg]);
      setInput("");
      resetTranscript();
      setLoading(true);

      try {
        const data = await sendChatTurn(
          {
            scenarioId: scenario.id,
            conversationId,
            userMessage: text,
            history: conversationSoFar.map((msg) => ({ role: msg.role, content: msg.content })),
            locale,
            voiceMode,
            adaptiveLevel,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          (replySoFar) =>
            setMessages((prev) =>
              prev.map((msg) => (msg.id === streamingId ? { ...msg, content: replySoFar } : msg))
            )
        );

        const assistantMsg: ChatMessage = {
          id: data.assistantMessageId ?? streamingId,
          role: "assistant",
          content: data.reply,
          translations: data.translations,
          translation: data.translations?.[locale],
          createdAt: new Date().toISOString(),
        };
        const updatedUserMsg: ChatMessage = {
          ...userMsg,
          id: data.userMessageId ?? userMsg.id,
          feedback: data.feedback,
        };
        const finalMessages = [...conversationSoFar, updatedUserMsg, assistantMsg];

        setLatestFeedback(data.feedback);
        setMessages(finalMessages);
        setDemoMode(data.mock);

        if (data.persisted) {
          // The server already stored the turn and applied XP/achievements.
          if (data.unlocked && data.unlocked.length > 0) setNewAchievements(data.unlocked);
        } else {
          persistGuest(finalMessages, data.feedback.overall);
          if (voiceMode) trackGuestVoiceMessage();
          // Demo replies are canned, so they don't earn XP or review cards.
          if (!data.mock) {
            grantGuestXp(Math.round(data.feedback.overall / 10));
            addGuestReviewCard(updatedUserMsg.id, scenario.id, text, data.feedback);
          }
          const unlocked = await checkAchievements();
          if (unlocked.length > 0) setNewAchievements(unlocked);
        }
      } catch (error) {
        const code = error instanceof ChatError ? error.code : "internal";
        const notice =
          code === "rate_limited"
            ? m.chat.rateLimited
            : code === "ai_unavailable"
              ? m.chat.aiUnavailable
              : m.chat.errorMessage;
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: ERROR_TEXT_JA,
          translations: { en: notice, vi: notice },
          translation: notice,
          failed: true,
          createdAt: new Date().toISOString(),
        };
        // Drop the unanswered turn and give the text back so it can be resent.
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== userMsg.id && msg.id !== streamingId),
          errMsg,
        ]);
        setInput(text);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, scenario.id, locale, conversationId, adaptiveLevel, m.chat.errorMessage, m.chat.rateLimited, m.chat.aiUnavailable, resetTranscript, persistGuest]
  );

  // Layout effects run before passive effects, so the voice auto-send effect
  // above always sees the latest sendMessage.
  useLayoutEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const handleVoiceStop = () => {
    pendingVoiceSend.current = true;
    stopListening();
    if (mode === "browser" && transcript.trim()) {
      pendingVoiceSend.current = false;
      sendMessage(transcript.trim(), true);
    }
  };

  const endConversation = async () => {
    const unlocked = await checkAchievements();
    if (unlocked.length > 0) setNewAchievements(unlocked);
    const result = summarizeSession(messages);
    if (result) setSummary(result);
    else router.push("/history");
  };

  const translationLabel = locale === "vi" ? "VI" : "EN";
  const aiAvatar = getAiAvatar(scenario);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* min-w-0: grid items default to min-width:auto and would grow past the screen on mobile. */}
        <div className="flex min-w-0 flex-col rounded-xl border border-border bg-surface-elevated">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <AiAvatarBadge avatar={aiAvatar} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{localized.title}</h2>
                <AdaptiveBadge level={adaptiveLevel} />
              </div>
              <p className="text-sm text-muted">
                {m.chat.aiRole}: {localized.aiRole}
              </p>
            </div>
          </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTranslation((v) => !v)}
              >
                <Languages className="h-4 w-4" />
                {showTranslation ? m.chat.hideTranslation : m.chat.showTranslation} {translationLabel}
              </Button>
              <Button variant="outline" size="sm" onClick={endConversation}>
                {m.chat.finish}
              </Button>
            </div>
          </div>

          {demoMode && (
            <p className="border-b border-border bg-surface px-4 py-2 text-xs text-muted">
              {m.chat.demoMode}
            </p>
          )}

          <div className="chat-messages-area flex-1 space-y-4 overflow-y-auto p-4" style={{ minHeight: 400, maxHeight: 520 }}>
            {messages.map((msg) => {
              if (msg.role === "assistant" && !msg.content) return null;
              const translation = getMessageTranslation(msg, locale);
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && <AiAvatarBadge avatar={aiAvatar} size="sm" />}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      msg.role === "user"
                        ? "bg-crimson text-white"
                        : "bg-surface border border-border"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <p className="flex-1 text-base leading-relaxed">{msg.content}</p>
                      {msg.role === "assistant" && (
                        <button
                          type="button"
                          onClick={() => speakJapanese(msg.content)}
                          className="shrink-0 text-muted hover:text-crimson transition-colors"
                          title={m.chat.listen}
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {msg.isVoice && (
                      <Badge variant="secondary" className="mt-1.5 text-xs bg-white/20 text-white border-0">
                        🎙️ {m.chat.voiceMessage}
                      </Badge>
                    )}
                    {showTranslation && translation && (
                      <p
                        className={cn(
                          "mt-1.5 text-sm",
                          msg.role === "user" ? "text-white/70" : "text-muted"
                        )}
                      >
                        {translation}
                      </p>
                    )}
                    {msg.feedback && (
                      <Badge
                        variant="secondary"
                        className="mt-2 bg-white/20 text-white border-0"
                      >
                        {m.chat.score}: {msg.feedback.overall}/100
                      </Badge>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crimson/15 text-base">
                      <span role="img" aria-label={m.history.you}>🧑</span>
                    </div>
                  )}
                </div>
              );
            })}
          {(loading || isTranscribing) && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isTranscribing ? m.chat.transcribing : m.chat.evaluating}
            </div>
          )}
            <div ref={bottomRef} />
          </div>

          {scenario.suggestedResponses && messages.length === 1 && (
            <div className="border-t border-border px-4 py-2">
              <p className="mb-2 text-xs text-muted">{m.chat.suggestedResponses}</p>
              <div className="flex flex-wrap gap-2">
                {scenario.suggestedResponses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:border-crimson hover:text-crimson transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 border-t border-border p-4">
            <VoiceButton
              isListening={isListening}
              isTranscribing={isTranscribing}
              supported={voiceSupported}
              whisperMode={mode === "whisper"}
              disabled={loading}
              onStart={startListening}
              onStop={handleVoiceStop}
              onToggleMode={whisperAvailable ? toggleMode : undefined}
              label={m.chat.voiceStart}
              listeningLabel={m.chat.voiceStop}
              transcribingLabel={m.chat.transcribing}
              whisperLabel={m.chat.whisperMode}
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={m.chat.placeholder}
              disabled={loading || isListening || isTranscribing}
              className="flex-1"
            />
            <Button onClick={() => sendMessage()} disabled={loading || !input.trim() || isListening || isTranscribing}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {!voiceSupported && (
            <p className="border-t border-border px-4 py-2 text-xs text-muted">
              {m.chat.voiceUnsupported}
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          {latestFeedback ? (
            <FeedbackPanel feedback={latestFeedback} />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
              {m.chat.feedbackHint}
            </div>
          )}
        </div>
      </div>

      {summary && (
        <SessionSummaryDialog
          summary={summary}
          onContinue={() => setSummary(null)}
          onViewHistory={() => router.push("/history")}
        />
      )}

      <AchievementToast
        achievementIds={newAchievements}
        onDismiss={() => setNewAchievements([])}
      />
    </>
  );
}

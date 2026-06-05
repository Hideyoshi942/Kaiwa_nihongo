import { notFound } from "next/navigation";
import { getScenarioById } from "@/lib/scenarios";
import { ChatInterface } from "@/components/chat-interface";
import { ChatHeader } from "@/components/chat-header";
import { ChatBackButton } from "@/components/chat-back-button";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenario = getScenarioById(id);

  if (!scenario) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 md:py-8 md:pb-8">
      <ChatBackButton />

      <ChatHeader scenario={scenario} />
      <ChatInterface scenario={scenario} />
    </div>
  );
}

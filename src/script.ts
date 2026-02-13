import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function chat(messages: Message[]) {
  const reply = await invoke("chat_completion", {
    apiUrl: "https://openrouter.ai/api",
    apiKey: "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",
    model: "stepfun/step-3.5-flash:free",
    messages: messages,
  });
  return reply;
}

export function usePetLogic() {
  const petMessage = ref("");
  const userInput = ref("");
  const messages = ref<Message[]>([
    { role: "system", content: "你是一只桌面宠物，用简短可爱的语气回复。" },
  ]);

  async function onPetClick() {
    messages.value.push({ role: "user", content: "（戳了你一下）" });
    petMessage.value = "思考中...";
    try {
      const reply = (await chat(messages.value)) as string;
      messages.value.push({ role: "assistant", content: reply });
      petMessage.value = reply;
    } catch (e) {
      petMessage.value = "出错了...";
      console.error(e);
    }
    setTimeout(() => {
      petMessage.value = "";
    }, 5000);
  }

  async function onPetChat() {
    if (!userInput.value) return;
    const text = userInput.value;
    userInput.value = "";

    messages.value.push({ role: "user", content: text });
    petMessage.value = "思考中...";

    try {
      const reply = (await chat(messages.value)) as string;
      messages.value.push({ role: "assistant", content: reply });
      petMessage.value = reply;
    } catch (e) {
      petMessage.value = "出错了...";
      console.error(e);
    }

    setTimeout(() => {
      petMessage.value = "";
    }, 5000);
  }

  return {
    userInput,
    petMessage,
    onPetClick,
    onPetChat
  };
}

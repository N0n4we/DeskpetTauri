import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";

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
  const petAvatar = ref("");
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

  const menuVisible = ref(false);
  const menuX = ref(0);
  const menuY = ref(0);

  function onContextMenu(e: MouseEvent) {
    e.preventDefault();
    menuX.value = e.clientX;
    menuY.value = e.clientY;
    menuVisible.value = true;
  }

  function closeMenu() {
    menuVisible.value = false;
  }

  function clearHistory() {
    messages.value = [messages.value[0]];
    petMessage.value = "记忆已清除~";
    closeMenu();
    setTimeout(() => { petMessage.value = ""; }, 2000);
  }

  function quitApp() {
    getCurrentWindow().close();
  }

  async function uploadImage() {
    closeMenu();
    const win = getCurrentWindow();
    await win.setAlwaysOnTop(false);

    try {
      const file = await open({
        filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg", "gif", "webp"] }],
      });
      await win.setAlwaysOnTop(true);
      if (!file) return;

      petMessage.value = "正在生成桌宠...";
      const base64: string = await invoke("read_image_base64", { path: file });
      const imageUrl: string = await invoke("generate_pet_image", {
        apiUrl: "https://openrouter.ai/api",
        apiKey: "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",
        imageBase64: base64,
      });
      petAvatar.value = imageUrl;
      petMessage.value = "get~";
    } catch (e) {
      await win.setAlwaysOnTop(true);
      petMessage.value = "生成失败了...";
      console.error(e);
    }
    setTimeout(() => { petMessage.value = ""; }, 3000);
  }

  return {
    userInput,
    petMessage,
    petAvatar,
    menuVisible,
    menuX,
    menuY,
    onPetClick,
    onPetChat,
    onContextMenu,
    closeMenu,
    clearHistory,
    quitApp,
    uploadImage,
  };
}

import { ref, computed } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";

const BACKEND = "http://localhost:3000";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

class AuthError extends Error {
  constructor() {
    super("请先登录");
    this.name = "AuthError";
  }
}

const token = ref(localStorage.getItem("token") || "");
const isLoggedIn = computed(() => !!token.value);

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token.value) h["Authorization"] = `Bearer ${token.value}`;
  return h;
}

function handleUnauth() {
  token.value = "";
  localStorage.removeItem("token");
  throw new AuthError();
}

async function chat(messages: Message[]): Promise<string> {
  const resp = await fetch(`${BACKEND}/api/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ messages }),
  });
  if (resp.status === 401) handleUnauth();
  if (!resp.ok) throw new Error(`Backend error ${resp.status}`);
  const data = await resp.json();
  return data.reply;
}

let audioCtx: AudioContext | null = null;

async function speakText(text: string, character = "mika") {
  try {
    const resp = await fetch(`${BACKEND}/api/tts`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ text, character }),
    });
    if (!resp.ok) return;
    const arrayBuffer = await resp.arrayBuffer();
    if (!audioCtx) audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    await new Promise<void>((resolve) => {
      source.onended = () => resolve();
      source.start();
    });
  } catch (e) {
    console.error("TTS failed:", e);
  }
}

export function usePetLogic() {
  const petMessage = ref("");
  const userInput = ref("");
  const petAvatar = ref("");
  const messages = ref<Message[]>([
    { role: "system", content: "你是一只桌面宠物，用简短可爱的语气回复。" },
  ]);

  // Auth state
  const authVisible = ref(false);
  const authMode = ref<"login" | "register">("login");
  const authUsername = ref("");
  const authPassword = ref("");
  const authError = ref("");

  async function login() {
    authError.value = "";
    try {
      const resp = await fetch(`${BACKEND}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername.value, password: authPassword.value }),
      });
      const data = await resp.json();
      if (!resp.ok) { authError.value = data.error; return; }
      token.value = data.token;
      localStorage.setItem("token", data.token);
      authVisible.value = false;
      authUsername.value = "";
      authPassword.value = "";
    } catch { authError.value = "网络错误"; }
  }

  async function register() {
    authError.value = "";
    try {
      const resp = await fetch(`${BACKEND}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername.value, password: authPassword.value }),
      });
      const data = await resp.json();
      if (!resp.ok) { authError.value = data.error; return; }
      token.value = data.token;
      localStorage.setItem("token", data.token);
      authVisible.value = false;
      authUsername.value = "";
      authPassword.value = "";
    } catch { authError.value = "网络错误"; }
  }

  function logout() {
    token.value = "";
    localStorage.removeItem("token");
    closeMenu();
  }

  function showAuth() {
    authMode.value = "login";
    authError.value = "";
    authVisible.value = true;
    closeMenu();
  }

  async function onPetClick() {
    messages.value.push({ role: "user", content: "（戳了你一下）" });
    petMessage.value = "思考中...";
    try {
      const reply = (await chat(messages.value)) as string;
      messages.value.push({ role: "assistant", content: reply });
      petMessage.value = reply;
      await speakText(reply);
    } catch (e) {
      if (e instanceof AuthError) {
        petMessage.value = "请先登录~";
        authVisible.value = true;
      } else {
        petMessage.value = "出错了...";
      }
      console.error(e);
    }
    setTimeout(() => {
      petMessage.value = "";
    }, 2000);
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
      await speakText(reply);
    } catch (e) {
      if (e instanceof AuthError) {
        petMessage.value = "请先登录~";
        authVisible.value = true;
      } else {
        petMessage.value = "出错了...";
      }
      console.error(e);
    }

    setTimeout(() => {
      petMessage.value = "";
    }, 2000);
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

      const resp = await fetch(`${BACKEND}/api/generate-pet`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ imageBase64: base64 }),
      });
      if (resp.status === 401) handleUnauth();
      if (!resp.ok) throw new Error(`Backend error ${resp.status}`);
      const data = await resp.json();
      petAvatar.value = data.imageUrl;
      petMessage.value = "get~";
    } catch (e) {
      await win.setAlwaysOnTop(true);
      if (e instanceof AuthError) {
        petMessage.value = "请先登录~";
        authVisible.value = true;
      } else {
        petMessage.value = "生成失败了...";
      }
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
    isLoggedIn,
    authVisible,
    authMode,
    authUsername,
    authPassword,
    authError,
    onPetClick,
    onPetChat,
    onContextMenu,
    closeMenu,
    clearHistory,
    quitApp,
    uploadImage,
    login,
    register,
    logout,
    showAuth,
  };
}

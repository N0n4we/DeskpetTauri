<script setup lang="ts">
import { usePetLogic } from "./script";

const {
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
  ttsEnabled,
  toggleTts,
} = usePetLogic();

function submitAuth() {
  if (authMode.value === "login") login();
  else register();
}
</script>

<template>
  <main class="container" @click="closeMenu">
    <div v-if="petMessage" class="pet-bubble">{{ petMessage }}</div>
    <img v-if="petAvatar" class="pet-avatar" :src="petAvatar" @click="onPetClick" @contextmenu="onContextMenu" />
    <div v-else class="pet-ball" @click="onPetClick" @contextmenu="onContextMenu"></div>

    <form class="row" @submit.prevent="onPetChat">
      <input id="user-input" v-model="userInput" placeholder="Speak to pet..." />
    </form>

    <div v-if="menuVisible" class="context-menu" :style="{ left: menuX + 'px', top: menuY + 'px' }">
      <div class="menu-item" @click="toggleTts">{{ ttsEnabled ? '关闭语音' : '开启语音' }}</div>
      <div class="menu-item" @click="clearHistory">清除记忆</div>
      <div class="menu-item" @click="uploadImage">上传图片</div>
      <div v-if="isLoggedIn" class="menu-item" @click="logout">退出登录</div>
      <div v-else class="menu-item" @click="showAuth">登录</div>
      <div class="menu-item quit" @click="quitApp">退出</div>
    </div>

    <!-- Auth Modal -->
    <div v-if="authVisible" class="auth-overlay" @click.self="authVisible = false">
      <form class="auth-card" @submit.prevent="submitAuth">
        <div class="auth-title">{{ authMode === 'login' ? '登录' : '注册' }}</div>
        <input v-model="authUsername" placeholder="用户名" autocomplete="username" />
        <input v-model="authPassword" type="password" placeholder="密码" autocomplete="current-password" />
        <div v-if="authError" class="auth-error">{{ authError }}</div>
        <button type="submit">{{ authMode === 'login' ? '登录' : '注册' }}</button>
        <div class="auth-switch" @click="authMode = authMode === 'login' ? 'register' : 'login'">
          {{ authMode === 'login' ? '没有账号？去注册' : '已有账号？去登录' }}
        </div>
      </form>
    </div>
  </main>
</template>

<style>
* {
  font-family: 'Cascadia Code';
  margin: 0;
  padding: 0;
}

html, body {
  background: transparent !important;
  overflow: hidden;
}

:root {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: #0f0f0f;
  background-color: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  padding-top: 10vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: 0.75s;
}

.row {
  display: flex;
  justify-content: center;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

h1 {
  text-align: center;
}

input,
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  color: #0f0f0f;
  background-color: #ffffff;
  transition: border-color 0.25s;
  box-shadow: none;
}

button {
  cursor: pointer;
}

button:hover {
  border-color: #396cd8;
  border: 8px;
}
button:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}

input,
button {
  outline: none;
}

#user-input {
  margin-right: 5px;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: transparent;
  }

  a:hover {
    color: #24c8db;
  }

  input,
  button {
    color: #ffffff;
    background-color: #0f0f0f98;
  }
  button:active {
    background-color: #0f0f0f69;
  }
}

.pet-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1em auto 2em;
}

.pet-ball {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  color: #999999;
  border: 8px solid currentColor;
  cursor: pointer;
  margin: 1em auto 2em;
}

.pet-avatar {
  width: 120px;
  height: 120px;
  object-fit: contain;
  cursor: pointer;
  margin: 1em auto 2em;
}

.pet-bubble {
  position: absolute;
  background: #0f0f0f;
  color: #fff;
  font-size: 0.85em;
  margin: 1em auto 2em;
  transform: translateX(90px);
  white-space: nowrap;
}

@media (prefers-color-scheme: dark) {
  .pet-bubble {
    background: #f6f6f6;
    color: #0f0f0f;
  }
}

.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 4px 0;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 999;
}

.menu-item {
  padding: 6px 16px;
  cursor: pointer;
  font-size: 0.85em;
  color: #333;
}

.menu-item:hover {
  background: #f0f0f0;
}

.menu-item.quit {
  color: #e55;
}

@media (prefers-color-scheme: dark) {
  .context-menu {
    background: #1a1a1a;
    border-color: #333;
  }
  .menu-item {
    color: #ddd;
  }
  .menu-item:hover {
    background: #2a2a2a;
  }
}

.auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.auth-card {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.auth-title {
  font-size: 1.1em;
  font-weight: 600;
  text-align: center;
  color: #333;
}

.auth-card input {
  width: 100%;
  box-sizing: border-box;
}

.auth-card button {
  background: #396cd8;
  color: #fff;
  border: none;
  cursor: pointer;
}

.auth-card button:hover {
  background: #2a5cbf;
}

.auth-error {
  color: #e55;
  font-size: 0.8em;
  text-align: center;
}

.auth-switch {
  font-size: 0.8em;
  color: #666;
  text-align: center;
  cursor: pointer;
}

.auth-switch:hover {
  color: #396cd8;
}

@media (prefers-color-scheme: dark) {
  .auth-card {
    background: #1a1a1a;
  }
  .auth-title {
    color: #eee;
  }
  .auth-switch {
    color: #999;
  }
  .auth-switch:hover {
    color: #6b9aff;
  }
}
</style>

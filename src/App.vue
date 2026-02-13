<script setup lang="ts">
import { usePetLogic } from "./script";

const {
  userInput,
  petMessage,
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
} = usePetLogic();
</script>

<template>
  <main class="container" @click="closeMenu">
    <div v-if="petMessage" class="pet-bubble">{{ petMessage }}</div>
    <div class="pet-ball" @click="onPetClick" @contextmenu="onContextMenu"></div>

    <form class="row" @submit.prevent="onPetChat">
      <input id="user-input" v-model="userInput" placeholder="Speak to pet..." />
    </form>

    <div v-if="menuVisible" class="context-menu" :style="{ left: menuX + 'px', top: menuY + 'px' }">
      <div class="menu-item" @click="clearHistory">清除记忆</div>
      <div class="menu-item" @click="uploadImage">上传图片</div>
      <div class="menu-item quit" @click="quitApp">退出</div>
    </div>
  </main>
</template>

<style>
* {
  font-family: 'Cascadia Code';
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
</style>

<template>
  <div id="app">
    <nav v-if="showNav">
      <router-link to="/home">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view/>
    <div class="env-switcher" @click="toggleEnv">
      <span>{{ envLabel }}</span>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    showNav() {
      return this.$route.path === '/home' || this.$route.path === '/about';
    },
    envLabel() {
      const isMock = localStorage.getItem('USE_MOCK') === 'true';
      return isMock ? '当前环境：本地Mock' : '当前环境：生产API';
    }
  },
  methods: {
    toggleEnv() {
      const isMock = localStorage.getItem('USE_MOCK') === 'true';
      localStorage.setItem('USE_MOCK', isMock ? 'false' : 'true');
      window.location.reload();
    }
  },
  mounted() {
    if (localStorage.getItem('USE_MOCK') === null) {
      localStorage.setItem('USE_MOCK', 'false');
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #42b983;
}

body {
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

.env-switcher {
  position: fixed;
  right: 24px;
  bottom: 24px;
  background: #1B1B61;
  color: #fff;
  padding: 10px 20px;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  cursor: pointer;
  font-size: 14px;
  z-index: 9999;
  user-select: none;
  transition: background 0.2s;
}
.env-switcher:hover {
  background: #304156;
}
</style>

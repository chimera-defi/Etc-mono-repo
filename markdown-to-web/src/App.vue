<template>
  <div
    id="app"
    class="app-container"
  >
    <!-- Navigation Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <nav class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <router-link 
          to="/" 
          class="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
        >
          {{ siteTitle }}
        </router-link>
        <div class="flex items-center gap-6">
          <router-link 
            to="/" 
            class="text-gray-300 hover:text-emerald-400 transition-colors"
          >
            Home
          </router-link>
          <a 
            v-if="githubUrl"
            :href="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-300 hover:text-emerald-400 transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 border-t border-gray-800 py-8 px-4">
      <div class="max-w-6xl mx-auto text-center text-gray-400 text-sm">
        <p class="mb-2">
          Built with 
          <a 
            href="https://github.com/SharedStake/SharedStake-ui" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-emerald-400 hover:text-emerald-300"
          >
            markdown-to-web
          </a>
          — extracted from SharedStake UI
        </p>
        <p>
          Data sources: GitHub API, Wallet documentation, WalletBeat
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import { siteConfig } from '@/config.js';

export default {
  name: 'App',
  data() {
    return {
      siteTitle: siteConfig.title,
      githubUrl: siteConfig.github
    };
  }
};
</script>

<style>
/* Global app styles */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container main {
  flex: 1;
}
</style>

<template>
  <div class="home-page min-h-screen bg-gray-900 text-white">
    <!-- Hero Section -->
    <div class="relative pt-32 pb-12 md:pt-36 md:pb-20 px-4 text-center">
      <div class="max-w-4xl mx-auto">
        <Breadcrumb
          :items="breadcrumbItems"
          class="mb-8"
        />
        <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {{ siteTitle }}
        </h1>
        <p class="text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 md:mb-8 px-4">
          {{ siteDescription }}
        </p>
        
        <!-- Source indicator -->
        <div class="inline-flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full text-sm text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Content loaded from <code class="bg-gray-700 px-2 py-0.5 rounded">/wallets/</code>
        </div>
      </div>
    </div>

    <!-- Featured Content Section -->
    <div
      v-if="featuredContent.length > 0"
      class="py-8 md:py-12 px-4"
    >
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
          Featured
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <ContentCard
            v-for="item in featuredContent"
            :key="item.id"
            :content="item"
            variant="featured"
          />
        </div>
      </div>
    </div>

    <!-- All Content Section -->
    <div class="py-8 md:py-12 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <!-- Main Content -->
          <div class="lg:w-2/3">
            <h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
              All Documents
            </h2>

            <!-- Filter Tabs -->
            <div class="flex flex-wrap gap-2 mb-6 md:mb-8">
              <button
                :class="[
                  'px-3 py-2 md:px-4 rounded-full text-xs md:text-sm font-semibold transition-colors',
                  selectedTag === null
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                ]"
                @click="selectedTag = null"
              >
                All
              </button>
              <button
                v-for="tag in allTags"
                :key="tag"
                :class="[
                  'px-3 py-2 md:px-4 rounded-full text-xs md:text-sm font-semibold transition-colors',
                  selectedTag === tag
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                ]"
                @click="selectedTag = tag"
              >
                {{ formatTag(tag) }}
              </button>
            </div>

            <!-- Content List -->
            <div class="space-y-4 md:space-y-6">
              <ContentCard
                v-for="item in filteredContent"
                :key="item.id"
                :content="item"
                variant="list"
              />
            </div>

            <!-- No Content Message -->
            <div
              v-if="filteredContent.length === 0"
              class="text-center py-12"
            >
              <p class="text-gray-400 text-lg">
                No content found for the selected filter.
              </p>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:w-1/3">
            <div class="bg-gray-800 rounded-lg p-4 md:p-6 sticky top-40">
              <h3 class="text-lg md:text-xl font-bold mb-4 md:mb-6">
                About
              </h3>
              <p class="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
                {{ siteAbout }}
              </p>

              <h4 class="text-base md:text-lg font-semibold mb-3 md:mb-4">
                Tags
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in allTags"
                  :key="tag"
                  class="bg-gray-700 hover:bg-emerald-500 text-gray-300 hover:text-white px-2 py-1 md:px-3 rounded-full text-xs md:text-sm cursor-pointer transition-colors"
                  @click="selectedTag = tag"
                >
                  {{ formatTag(tag) }}
                </span>
              </div>
              
              <!-- Architecture info -->
              <div class="mt-6 pt-6 border-t border-gray-700">
                <h4 class="text-base font-semibold mb-3 text-emerald-400">
                  How This Works
                </h4>
                <ul class="text-xs text-gray-400 space-y-2">
                  <li>• Content from <code class="bg-gray-700 px-1 rounded">/wallets/</code></li>
                  <li>• Library from <code class="bg-gray-700 px-1 rounded">markdown-web</code></li>
                  <li>• Frontmatter auto-generated</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Breadcrumb, ContentCard, useContent, formatTag } from 'markdown-web';
import { contentLoader } from '../content/loader.js';
import { siteConfig } from '../config.js';

export default {
  name: 'HomePage',
  components: {
    Breadcrumb,
    ContentCard
  },
  data() {
    const content = useContent(contentLoader);
    return {
      selectedTag: null,
      siteTitle: siteConfig.title,
      siteDescription: siteConfig.description,
      siteAbout: siteConfig.about,
      ...content
    };
  },
  computed: {
    breadcrumbItems() {
      return [{ name: 'Home', url: '/' }];
    },
    featuredContent() {
      return this.getFeaturedPages();
    },
    allTags() {
      return this.getAllTags();
    },
    filteredContent() {
      return this.getFilteredPages(this.selectedTag);
    }
  },
  mounted() {
    this.setPageMeta(this.siteTitle, this.siteDescription);
  },
  methods: {
    formatTag
  }
};
</script>

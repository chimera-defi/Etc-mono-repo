<template>
  <div class="content-page min-h-screen bg-gray-900 text-white">
    <ContentStyles />

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center min-h-screen"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
        <p class="text-gray-400">
          Loading...
        </p>
      </div>
    </div>

    <!-- Page Not Found -->
    <div
      v-else-if="!page"
      class="flex items-center justify-center min-h-screen"
    >
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">
          Page Not Found
        </h1>
        <p class="text-gray-400 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <router-link
          to="/"
          class="bg-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-600 transition-colors"
        >
          Back to Home
        </router-link>
      </div>
    </div>

    <!-- Page Content -->
    <div v-else>
      <!-- Hero Section -->
      <div class="relative pt-32 pb-12 md:pt-36 md:pb-16 px-4">
        <div class="max-w-4xl mx-auto">
          <Breadcrumb
            :items="breadcrumbItems"
            class="mb-6"
          />

          <div class="mb-6 md:mb-8">
            <div class="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
              <span
                v-for="tag in page.tags"
                :key="tag"
                class="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ formatTag(tag) }}
              </span>
            </div>

            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              {{ page.title }}
            </h1>

            <div class="flex items-center gap-4 text-sm md:text-base text-gray-400 flex-wrap">
              <span>By {{ page.author }}</span>
              <span>•</span>
              <span>{{ formatDate(page.publishDate) }}</span>
              <span
                v-if="page.sourcePath"
                class="text-xs bg-gray-800 px-2 py-1 rounded"
              >
                Source: {{ page.sourcePath.split('/').pop() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="py-6 md:py-8 px-4">
        <div class="max-w-4xl mx-auto">
          <article class="prose prose-lg prose-invert max-w-none overflow-hidden">
            <div
              class="md-content"
              v-html="page.content"
            />
          </article>

          <!-- Page Footer -->
          <div class="mt-12 pt-8 border-t border-gray-800">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div class="flex items-center gap-4">
                <span class="text-gray-400 font-medium">Share:</span>
                <a
                  :href="twitterShareUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <svg
                    class="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Twitter
                </a>
              </div>

              <router-link
                to="/"
                class="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Home
              </router-link>
            </div>
          </div>

          <!-- Related Content -->
          <div
            v-if="relatedPages.length > 0"
            class="mt-16"
          >
            <h3 class="text-2xl font-bold mb-8">
              Related
            </h3>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <router-link
                v-for="relatedPage in relatedPages"
                :key="relatedPage.id"
                :to="`/${relatedPage.slug}`"
              >
                <ContentCard
                  :content="relatedPage"
                  variant="related"
                />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ContentStyles,
  Breadcrumb,
  ContentCard,
  useContent,
  useStructuredData,
  formatDate,
  formatTag,
  generateTwitterShareUrl
} from 'markdown-web';
import { contentLoader } from '../content/loader.js';
import { siteConfig } from '../config.js';

export default {
  name: 'ContentPage',
  components: {
    ContentStyles,
    Breadcrumb,
    ContentCard
  },
  data() {
    const content = useContent(contentLoader);
    const structuredData = useStructuredData(siteConfig);

    return {
      page: null,
      loading: true,
      ...content,
      ...structuredData
    };
  },
  computed: {
    breadcrumbItems() {
      return this.getBreadcrumbItems(this.page);
    },
    relatedPages() {
      return this.getRelatedPages(this.page);
    },
    twitterShareUrl() {
      if (!this.page) return '';
      return generateTwitterShareUrl(this.page.title, window.location.href);
    }
  },
  watch: {
    '$route.params.slug': {
      immediate: true,
      handler(newSlug) {
        this.handleLoadPage(newSlug);
      }
    }
  },
  beforeUnmount() {
    this.cleanupPageSchemas();
  },
  methods: {
    formatDate,
    formatTag,
    async handleLoadPage(slug) {
      this.loading = true;
      this.page = null;

      this.cleanupPageSchemas();

      const loadedPage = await this.loadPage(slug);
      this.page = loadedPage;
      this.loading = false;

      if (loadedPage) {
        this.setPageMeta(`${loadedPage.title} - ${siteConfig.title}`, loadedPage.meta?.description);
        this.injectPageSchemas(loadedPage, window.location.href);
      }
    }
  }
};
</script>

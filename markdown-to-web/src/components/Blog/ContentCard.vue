<template>
  <div 
    :class="[
      'group transition-all duration-300',
      variant === 'featured' 
        ? 'bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:transform hover:scale-105' 
        : 'bg-gray-800/50 hover:bg-gray-800/80 rounded-xl p-6'
    ]"
  >
    <div
      v-if="variant === 'featured'"
      class="p-6"
    >
      <div class="flex items-center mb-4">
        <span class="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Featured
        </span>
      </div>
      <h3 class="text-xl font-bold mb-3 line-clamp-2 text-white">
        {{ content.title }}
      </h3>
      <p class="text-gray-300 mb-4 line-clamp-3">
        {{ content.excerpt }}
      </p>
      <div class="flex items-center justify-between text-sm text-gray-400">
        <span>{{ formatDate(content.publishDate) }}</span>
        <span>{{ content.author }}</span>
      </div>
      <router-link 
        :to="`/${content.slug}`"
        class="inline-block mt-4 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
      >
        Read More →
      </router-link>
    </div>

    <div
      v-else-if="variant === 'list'"
      class="flex flex-col md:flex-row md:items-start gap-4"
    >
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-3">
          <span 
            v-if="content.featured"
            class="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-semibold"
          >
            Featured
          </span>
          <span class="text-sm text-gray-400">{{ formatDate(content.publishDate) }}</span>
        </div>
        <h3 class="text-xl font-bold mb-3 hover:text-emerald-400 transition-colors text-white">
          <router-link :to="`/${content.slug}`">
            {{ content.title }}
          </router-link>
        </h3>
        <p class="text-gray-300 mb-4 line-clamp-2">
          {{ content.excerpt }}
        </p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <span>By {{ content.author }}</span>
            <div class="flex gap-2">
              <span 
                v-for="tag in (content.tags || []).slice(0, 3)" 
                :key="tag"
                class="bg-gray-700 px-2 py-1 rounded text-xs"
              >
                {{ formatTag(tag) }}
              </span>
            </div>
          </div>
          <router-link 
            :to="`/${content.slug}`"
            class="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            Read More →
          </router-link>
        </div>
      </div>
    </div>

    <div
      v-else-if="variant === 'related'"
      class="group"
    >
      <div class="flex items-center gap-2 mb-3">
        <span 
          v-for="tag in (content.tags || []).slice(0, 2)" 
          :key="tag"
          class="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs font-medium"
        >
          {{ formatTag(tag) }}
        </span>
      </div>
      <h4 class="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors text-white">
        {{ content.title }}
      </h4>
      <p class="text-gray-400 text-sm mb-3 line-clamp-2">
        {{ content.excerpt }}
      </p>
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>{{ formatDate(content.publishDate) }}</span>
        <span class="group-hover:text-emerald-400 transition-colors">Read more →</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate, formatTag } from '@/utils/contentUtils.js';

export default {
  name: 'ContentCard',
  props: {
    content: {
      type: Object,
      required: true
    },
    variant: {
      type: String,
      default: 'list',
      validator: (value) => ['featured', 'list', 'related'].includes(value)
    }
  },
  methods: {
    formatDate,
    formatTag
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

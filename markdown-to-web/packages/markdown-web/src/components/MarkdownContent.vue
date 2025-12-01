<template>
  <div class="markdown-content">
    <ContentStyles />
    <article class="md-content">
      <div v-html="renderedContent" />
    </article>
  </div>
</template>

<script>
import ContentStyles from './ContentStyles.vue';
import { parseMarkdown } from '../utils/markdown.js';

export default {
  name: 'MarkdownContent',
  components: {
    ContentStyles
  },
  props: {
    /**
     * Raw markdown string to render
     */
    markdown: {
      type: String,
      default: ''
    },
    /**
     * Pre-rendered HTML content (if already parsed)
     */
    html: {
      type: String,
      default: ''
    }
  },
  computed: {
    renderedContent() {
      // If HTML is provided, use it directly
      if (this.html) {
        return this.html;
      }
      // Otherwise, parse the markdown
      if (this.markdown) {
        return parseMarkdown(this.markdown);
      }
      return '';
    }
  }
};
</script>

<style scoped>
.markdown-content {
  width: 100%;
}
</style>

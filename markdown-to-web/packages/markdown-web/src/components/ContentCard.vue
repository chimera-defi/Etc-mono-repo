<template>
  <div
    :class="[
      'content-card',
      `content-card--${variant}`
    ]"
  >
    <div
      v-if="variant === 'featured'"
      class="content-card__inner"
    >
      <div class="content-card__badge-row">
        <span class="content-card__badge content-card__badge--featured">
          Featured
        </span>
      </div>
      <h3 class="content-card__title content-card__title--featured">
        {{ content.title }}
      </h3>
      <p class="content-card__excerpt">
        {{ content.excerpt }}
      </p>
      <div class="content-card__meta">
        <span>{{ formatDate(content.publishDate) }}</span>
        <span>{{ content.author }}</span>
      </div>
      <router-link
        :to="`/${content.slug}`"
        class="content-card__link"
      >
        Read More →
      </router-link>
    </div>

    <div
      v-else-if="variant === 'list'"
      class="content-card__list-layout"
    >
      <div class="content-card__list-content">
        <div class="content-card__badge-row">
          <span
            v-if="content.featured"
            class="content-card__badge content-card__badge--featured"
          >
            Featured
          </span>
          <span class="content-card__date">{{ formatDate(content.publishDate) }}</span>
        </div>
        <h3 class="content-card__title">
          <router-link :to="`/${content.slug}`">
            {{ content.title }}
          </router-link>
        </h3>
        <p class="content-card__excerpt content-card__excerpt--clamp">
          {{ content.excerpt }}
        </p>
        <div class="content-card__footer">
          <div class="content-card__author-tags">
            <span>By {{ content.author }}</span>
            <div class="content-card__tags">
              <span
                v-for="tag in (content.tags || []).slice(0, 3)"
                :key="tag"
                class="content-card__tag"
              >
                {{ formatTag(tag) }}
              </span>
            </div>
          </div>
          <router-link
            :to="`/${content.slug}`"
            class="content-card__link"
          >
            Read More →
          </router-link>
        </div>
      </div>
    </div>

    <div
      v-else-if="variant === 'related'"
      class="content-card__related-layout"
    >
      <div class="content-card__tags content-card__tags--top">
        <span
          v-for="tag in (content.tags || []).slice(0, 2)"
          :key="tag"
          class="content-card__tag content-card__tag--pill"
        >
          {{ formatTag(tag) }}
        </span>
      </div>
      <h4 class="content-card__title content-card__title--related">
        {{ content.title }}
      </h4>
      <p class="content-card__excerpt content-card__excerpt--small">
        {{ content.excerpt }}
      </p>
      <div class="content-card__meta content-card__meta--small">
        <span>{{ formatDate(content.publishDate) }}</span>
        <span class="content-card__read-more">Read more →</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate, formatTag } from '../utils/contentUtils.js';

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
.content-card {
  transition: all 0.3s;
}

.content-card--featured {
  background: var(--md-color-surface, #1f2937);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.content-card--featured:hover {
  transform: scale(1.05);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.content-card--list {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.content-card--list:hover {
  background: rgba(31, 41, 55, 0.8);
}

.content-card__inner {
  padding: 1.5rem;
}

.content-card__badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.content-card__badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.content-card__badge--featured {
  background: var(--md-color-primary, #10b981);
  color: white;
}

.content-card__title {
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: white;
}

.content-card__title--featured {
  font-size: 1.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-card__title a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.content-card__title a:hover {
  color: var(--md-color-primary, #10b981);
}

.content-card__excerpt {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.content-card__excerpt--clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-card__excerpt--small {
  font-size: 0.875rem;
  color: #9ca3af;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-card__meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #9ca3af;
}

.content-card__meta--small {
  font-size: 0.75rem;
  color: #6b7280;
}

.content-card__link {
  display: inline-block;
  margin-top: 1rem;
  color: var(--md-color-primary, #10b981);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.content-card__link:hover {
  color: var(--md-color-primary-light, #34d399);
}

.content-card__list-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-card__list-content {
  flex: 1;
}

.content-card__date {
  font-size: 0.875rem;
  color: #9ca3af;
}

.content-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content-card__author-tags {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.content-card__tags {
  display: flex;
  gap: 0.5rem;
}

.content-card__tags--top {
  margin-bottom: 0.75rem;
}

.content-card__tag {
  background: var(--md-color-border, #374151);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.content-card__tag--pill {
  background: rgba(16, 185, 129, 0.2);
  color: var(--md-color-primary, #10b981);
  border-radius: 9999px;
  font-weight: 500;
}

.content-card__title--related {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  transition: color 0.2s;
}

.content-card--related:hover .content-card__title--related {
  color: var(--md-color-primary, #10b981);
}

.content-card__read-more {
  transition: color 0.2s;
}

.content-card--related:hover .content-card__read-more {
  color: var(--md-color-primary, #10b981);
}

@media (min-width: 768px) {
  .content-card__list-layout {
    flex-direction: row;
    align-items: flex-start;
  }
}
</style>

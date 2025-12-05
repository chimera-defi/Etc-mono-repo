<template>
  <nav
    aria-label="Breadcrumb"
    class="breadcrumb"
  >
    <ol class="breadcrumb-list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumb-item"
      >
        <router-link
          v-if="index < items.length - 1"
          :to="item.url"
          class="breadcrumb-link"
        >
          {{ item.name }}
        </router-link>
        <span
          v-else
          class="breadcrumb-current"
          aria-current="page"
        >
          {{ item.name }}
        </span>
        <span
          v-if="index < items.length - 1"
          class="breadcrumb-separator"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<script>
export default {
  name: 'Breadcrumb',
  props: {
    items: {
      type: Array,
      required: true,
      validator: (items) => items.every(item => item.name && item.url)
    }
  }
};
</script>

<style scoped>
.breadcrumb {
  font-size: 0.875rem;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.5rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-link {
  color: var(--md-color-primary, #10b981);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: var(--md-color-primary-light, #34d399);
  text-decoration: underline;
}

.breadcrumb-current {
  color: var(--md-color-text-muted, #9ca3af);
}

.breadcrumb-separator {
  color: var(--md-color-text-muted, #6b7280);
}
</style>

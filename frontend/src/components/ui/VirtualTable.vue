<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  itemHeight: {
    type: Number,
    default: 50
  },
  containerHeight: {
    type: Number,
    default: 400
  },
  overscan: {
    type: Number,
    default: 5
  },
  keyField: {
    type: String,
    default: '_id'
  }
});

const emit = defineEmits(['scroll']);

// Reactive references
const scrollContainer = ref(null);
const scrollTop = ref(0);

// Computed properties for virtual scrolling
const totalHeight = computed(() => props.items.length * props.itemHeight);

const visibleCount = computed(() => Math.ceil(props.containerHeight / props.itemHeight));

const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight) - props.overscan;
  return Math.max(0, index);
});

const endIndex = computed(() => {
  const index = startIndex.value + visibleCount.value + props.overscan * 2;
  return Math.min(props.items.length - 1, index);
});

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value + 1).map((item, index) => ({
    ...item,
    virtualIndex: startIndex.value + index,
    top: (startIndex.value + index) * props.itemHeight
  }));
});

const offsetY = computed(() => startIndex.value * props.itemHeight);

// Handle scroll events
const handleScroll = (event) => {
  scrollTop.value = event.target.scrollTop;
  emit('scroll', {
    scrollTop: scrollTop.value,
    startIndex: startIndex.value,
    endIndex: endIndex.value
  });
};

// Scroll to specific item
const scrollToIndex = (index) => {
  if (scrollContainer.value) {
    const targetScrollTop = index * props.itemHeight;
    scrollContainer.value.scrollTop = targetScrollTop;
    scrollTop.value = targetScrollTop;
  }
};

// Smooth scroll to item
const scrollToItem = (itemKey, behavior = 'smooth') => {
  const index = props.items.findIndex(item => item[props.keyField] === itemKey);
  if (index !== -1 && scrollContainer.value) {
    scrollContainer.value.scrollTo({
      top: index * props.itemHeight,
      behavior
    });
  }
};

// Expose methods to parent
defineExpose({
  scrollToIndex,
  scrollToItem,
  getScrollPosition: () => scrollTop.value
});
</script>

<template>
  <div 
    ref="scrollContainer"
    class="virtual-scroll-container overflow-auto"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <!-- Total height placeholder -->
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <!-- Visible items container -->
      <div 
        class="virtual-items-container"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="item in visibleItems"
          :key="item[keyField]"
          class="virtual-item"
          :style="{ 
            height: itemHeight + 'px',
            position: 'absolute',
            top: '0px',
            left: '0px',
            right: '0px',
            transform: `translateY(${item.virtualIndex * itemHeight - offsetY}px)`
          }"
        >
          <slot 
            :item="item" 
            :index="item.virtualIndex"
            :is-visible="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-scroll-container {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.virtual-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.virtual-items-container {
  position: relative;
  width: 100%;
}

.virtual-item {
  box-sizing: border-box;
}
</style>
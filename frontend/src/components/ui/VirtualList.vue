<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  itemHeight: {
    type: [Number, Function],
    default: 60
  },
  containerHeight: {
    type: Number,
    default: 400
  },
  overscan: {
    type: Number,
    default: 3
  },
  keyField: {
    type: String,
    default: '_id'
  },
  direction: {
    type: String,
    default: 'vertical', // 'vertical' or 'horizontal'
    validator: (value) => ['vertical', 'horizontal'].includes(value)
  }
});

const emit = defineEmits(['scroll', 'item-click']);

// Reactive references
const scrollContainer = ref(null);
const scrollTop = ref(0);
const itemHeights = ref(new Map());
const isVertical = computed(() => props.direction === 'vertical');

// Calculate item height (supports dynamic heights)
const getItemHeight = (index) => {
  if (typeof props.itemHeight === 'function') {
    return props.itemHeight(props.items[index], index);
  }
  return props.itemHeight;
};

// For dynamic heights, we need to track actual heights
const updateItemHeight = (index, height) => {
  itemHeights.value.set(index, height);
};

// Calculate positions for variable height items
const itemPositions = computed(() => {
  const positions = [];
  let offset = 0;
  
  for (let i = 0; i < props.items.length; i++) {
    positions.push({
      index: i,
      top: offset,
      height: getItemHeight(i)
    });
    offset += getItemHeight(i);
  }
  
  return positions;
});

const totalHeight = computed(() => {
  if (typeof props.itemHeight === 'function') {
    return itemPositions.value.reduce((total, pos) => total + pos.height, 0);
  }
  return props.items.length * props.itemHeight;
});

const visibleRange = computed(() => {
  const containerHeight = props.containerHeight;
  let startIndex = 0;
  let endIndex = 0;
  
  if (typeof props.itemHeight === 'function') {
    // Variable height calculation
    for (let i = 0; i < itemPositions.value.length; i++) {
      const pos = itemPositions.value[i];
      if (pos.top + pos.height >= scrollTop.value) {
        startIndex = Math.max(0, i - props.overscan);
        break;
      }
    }
    
    for (let i = startIndex; i < itemPositions.value.length; i++) {
      const pos = itemPositions.value[i];
      if (pos.top >= scrollTop.value + containerHeight) {
        endIndex = Math.min(props.items.length - 1, i + props.overscan);
        break;
      }
      endIndex = i;
    }
  } else {
    // Fixed height calculation
    startIndex = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan);
    const visibleCount = Math.ceil(containerHeight / props.itemHeight);
    endIndex = Math.min(props.items.length - 1, startIndex + visibleCount + props.overscan * 2);
  }
  
  return { startIndex, endIndex };
});

const visibleItems = computed(() => {
  const { startIndex, endIndex } = visibleRange.value;
  return props.items.slice(startIndex, endIndex + 1).map((item, index) => {
    const actualIndex = startIndex + index;
    const position = typeof props.itemHeight === 'function' 
      ? itemPositions.value[actualIndex]
      : { top: actualIndex * props.itemHeight, height: props.itemHeight };
    
    return {
      ...item,
      virtualIndex: actualIndex,
      top: position.top,
      height: position.height
    };
  });
});

const offsetY = computed(() => {
  if (visibleItems.value.length === 0) return 0;
  return visibleItems.value[0].top;
});

// Handle scroll events
const handleScroll = (event) => {
  const newScrollTop = event.target.scrollTop;
  scrollTop.value = newScrollTop;
  
  emit('scroll', {
    scrollTop: newScrollTop,
    startIndex: visibleRange.value.startIndex,
    endIndex: visibleRange.value.endIndex,
    visibleItems: visibleItems.value
  });
};

// Handle item click
const handleItemClick = (item, index) => {
  emit('item-click', { item, index });
};

// Scroll to specific item
const scrollToIndex = (index, behavior = 'smooth') => {
  if (scrollContainer.value && index >= 0 && index < props.items.length) {
    const position = typeof props.itemHeight === 'function'
      ? itemPositions.value[index]?.top || 0
      : index * props.itemHeight;
    
    scrollContainer.value.scrollTo({
      top: position,
      behavior
    });
  }
};

// Scroll to item by key
const scrollToItem = (itemKey, behavior = 'smooth') => {
  const index = props.items.findIndex(item => item[props.keyField] === itemKey);
  if (index !== -1) {
    scrollToIndex(index, behavior);
  }
};

// Scroll to top
const scrollToTop = (behavior = 'smooth') => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({ top: 0, behavior });
  }
};

// Scroll to bottom
const scrollToBottom = (behavior = 'smooth') => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({ top: totalHeight.value, behavior });
  }
};

// Watch for items changes and reset scroll if needed
watch(() => props.items.length, (newLength, oldLength) => {
  if (newLength !== oldLength && scrollTop.value > 0) {
    // Reset item heights cache for dynamic heights
    if (typeof props.itemHeight === 'function') {
      itemHeights.value.clear();
    }
  }
});

// Expose methods to parent
defineExpose({
  scrollToIndex,
  scrollToItem,
  scrollToTop,
  scrollToBottom,
  getScrollPosition: () => scrollTop.value,
  updateItemHeight
});
</script>

<template>
  <div 
    ref="scrollContainer"
    class="virtual-list-container"
    :class="{
      'virtual-list-vertical': isVertical,
      'virtual-list-horizontal': !isVertical
    }"
    :style="{ 
      height: isVertical ? containerHeight + 'px' : 'auto',
      width: !isVertical ? containerHeight + 'px' : 'auto'
    }"
    @scroll="handleScroll"
  >
    <!-- Spacer for total content height -->
    <div 
      class="virtual-list-spacer"
      :style="{ 
        height: isVertical ? totalHeight + 'px' : 'auto',
        width: !isVertical ? totalHeight + 'px' : 'auto',
        position: 'relative'
      }"
    >
      <!-- Visible items container -->
      <div 
        class="virtual-list-items"
        :style="{ 
          transform: isVertical 
            ? `translateY(${offsetY}px)` 
            : `translateX(${offsetY}px)`
        }"
      >
        <div
          v-for="(item, index) in visibleItems"
          :key="item[keyField]"
          class="virtual-list-item"
          :style="{ 
            height: isVertical ? item.height + 'px' : 'auto',
            width: !isVertical ? item.height + 'px' : 'auto',
            position: 'absolute',
            top: isVertical ? '0px' : undefined,
            left: !isVertical ? '0px' : undefined,
            right: isVertical ? '0px' : undefined,
            bottom: !isVertical ? '0px' : undefined,
            transform: isVertical 
              ? `translateY(${item.virtualIndex * (typeof props.itemHeight === 'number' ? props.itemHeight : item.height) - offsetY}px)`
              : `translateX(${item.virtualIndex * (typeof props.itemHeight === 'number' ? props.itemHeight : item.height) - offsetY}px)`
          }"
          @click="handleItemClick(item, item.virtualIndex)"
        >
          <slot 
            :item="item" 
            :index="item.virtualIndex"
            :is-visible="true"
          >
            <!-- Default item rendering -->
            <div class="p-2 border-b border-gray-200">
              {{ item }}
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-list-container {
  position: relative;
  overflow: auto;
}

.virtual-list-vertical {
  overflow-y: auto;
  overflow-x: hidden;
}

.virtual-list-horizontal {
  overflow-x: auto;
  overflow-y: hidden;
}

.virtual-list-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.virtual-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.virtual-list-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.virtual-list-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.virtual-list-items {
  position: relative;
  width: 100%;
  height: 100%;
}

.virtual-list-item {
  box-sizing: border-box;
}

.virtual-list-spacer {
  min-height: 100%;
  min-width: 100%;
}
</style>
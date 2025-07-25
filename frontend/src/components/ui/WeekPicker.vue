<template>
  <div class="flex items-center space-x-3">
    <!-- Previous Week Button -->
    <button
      @click="selectPreviousWeek"
      :disabled="disabled"
      class="p-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      type="button"
    >
      <ChevronLeftIcon class="h-5 w-5 text-gray-600" />
    </button>

    <!-- Week Display -->
    <div class="flex-1 text-center">
      <div class="px-4 py-2 bg-gray-50 rounded-md border">
        <span class="text-sm font-medium text-gray-900">
          {{ displayText }}
        </span>
      </div>
    </div>

    <!-- Next Week Button -->
    <button
      @click="selectNextWeek"
      :disabled="disabled"
      class="p-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      type="button"
    >
      <ChevronRightIcon class="h-5 w-5 text-gray-600" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  },
  year: {
    type: Number,
    required: true
  },
  campaignFormat: {
    type: String,
    default: null // e.g., "25-26"
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

// Get ISO week number
const getISOWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

// Get Monday of week
const getMondayOfWeek = (year, weekNumber) => {
  const date = new Date(year, 0, 1);
  const dayOfWeek = date.getDay();
  const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  date.setDate(date.getDate() + daysToMonday + (weekNumber - 2) * 7);
  return date;
};

// Get week boundaries
const getWeekBoundaries = (year, weekNumber) => {
  const monday = getMondayOfWeek(year, weekNumber);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return { start: monday, end: sunday };
};

// Selected week info
const selectedWeekNumber = computed(() => props.modelValue);

const selectedWeekBoundaries = computed(() => {
  if (!selectedWeekNumber.value) return null;
  return getWeekBoundaries(props.year, selectedWeekNumber.value);
});

const selectedWeekStart = computed(() => selectedWeekBoundaries.value?.start);
const selectedWeekEnd = computed(() => selectedWeekBoundaries.value?.end);

// Display text
const displayText = computed(() => {
  if (!selectedWeekNumber.value) {
    return 'Sélectionnez une semaine';
  }
  
  const weekStr = `S${selectedWeekNumber.value}`;
  const year = props.year;
  
  if (selectedWeekStart.value && selectedWeekEnd.value) {
    const dateRange = formatDateRange(selectedWeekStart.value, selectedWeekEnd.value);
    return `${year} - ${weekStr} (${dateRange})`;
  }
  
  return `${year} - ${weekStr}`;
});

// Format date range
const formatDateRange = (start, end) => {
  if (!start || !end) return '';
  
  const startDay = start.getDate();
  const startMonth = start.getMonth();
  const endDay = end.getDate();
  const endMonth = end.getMonth();
  
  const monthNames = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
  
  if (startMonth === endMonth) {
    return `${startDay} - ${endDay} ${monthNames[startMonth]}`;
  } else {
    return `${startDay} ${monthNames[startMonth]} - ${endDay} ${monthNames[endMonth]}`;
  }
};

// Navigation methods
const selectPreviousWeek = () => {
  if (props.disabled) return;
  
  if (selectedWeekNumber.value) {
    const newWeek = selectedWeekNumber.value > 1 ? selectedWeekNumber.value - 1 : 52;
    emit('update:modelValue', newWeek);
  } else {
    // Default to current week if none selected
    const now = new Date();
    const currentWeek = getISOWeekNumber(now);
    const newWeek = currentWeek > 1 ? currentWeek - 1 : 52;
    emit('update:modelValue', newWeek);
  }
};

const selectNextWeek = () => {
  if (props.disabled) return;
  
  if (selectedWeekNumber.value) {
    const newWeek = selectedWeekNumber.value < 52 ? selectedWeekNumber.value + 1 : 1;
    emit('update:modelValue', newWeek);
  } else {
    // Default to current week if none selected
    const now = new Date();
    const currentWeek = getISOWeekNumber(now);
    const newWeek = currentWeek < 52 ? currentWeek + 1 : 1;
    emit('update:modelValue', newWeek);
  }
};
</script>
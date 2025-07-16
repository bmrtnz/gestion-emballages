<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
    open: {
        type: Boolean,
        required: true,
    },
    title: {
        type: String,
        default: "",
    },
    size: {
        type: String,
        default: "md", // sm, md, lg, xl
        validator: (value) => ["sm", "md", "lg", "xl"].includes(value),
    },
});

const emit = defineEmits(["close"]);

const sizeClasses = {
    sm: "w-full max-w-sm lg:w-96",
    md: "w-full max-w-md lg:w-[32rem]",
    lg: "w-full max-w-lg lg:w-[40rem]",
    xl: "w-full max-w-xl lg:w-[48rem]",
};
</script>

<template>
    <TransitionRoot as="template" :show="open">
        <Dialog as="div" class="relative z-50" @close="$emit('close')">
            <!-- Backdrop -->
            <TransitionChild
                as="template"
                enter="ease-in-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in-out duration-300"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-6 lg:pl-8">
                        <TransitionChild
                            as="template"
                            enter="transform transition ease-in-out duration-300"
                            enter-from="translate-x-full"
                            enter-to="translate-x-0"
                            leave="transform transition ease-in-out duration-300"
                            leave-from="translate-x-0"
                            leave-to="translate-x-full"
                        >
                            <DialogPanel :class="['pointer-events-auto', sizeClasses[size]]">
                                <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                    <!-- Header -->
                                    <div class="bg-white px-4 py-6 sm:px-6">
                                        <div class="flex items-start justify-between">
                                            <DialogTitle
                                                v-if="title"
                                                class="text-lg font-semibold leading-6 text-gray-900"
                                            >
                                                {{ title }}
                                            </DialogTitle>
                                            <div class="ml-3 flex h-7 items-center">
                                                <button
                                                    type="button"
                                                    class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                                    @click="$emit('close')"
                                                >
                                                    <span class="sr-only">Fermer</span>
                                                    <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Content -->
                                    <div class="relative flex-1 px-4 sm:px-6">
                                        <slot />
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

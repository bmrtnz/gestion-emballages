<script setup>
import { computed } from "vue";
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon,
} from "@heroicons/vue/24/outline";
import { useNotification } from "../../composables/useNotification";
import { cn } from "../../utils/styles";

const { notifications, removeNotification } = useNotification();

const getIcon = (type) => {
    const icons = {
        success: CheckCircleIcon,
        error: XCircleIcon,
        warning: ExclamationTriangleIcon,
        info: InformationCircleIcon,
    };
    return icons[type] || InformationCircleIcon;
};

const getStyles = (type) => {
    const styles = {
        success: {
            container: "bg-green-50 border-green-200",
            icon: "text-green-400",
            title: "text-green-800",
            message: "text-green-700",
            button: "text-green-500 hover:text-green-600",
        },
        error: {
            container: "bg-red-50 border-red-200",
            icon: "text-red-400",
            title: "text-red-800",
            message: "text-red-700",
            button: "text-red-500 hover:text-red-600",
        },
        warning: {
            container: "bg-yellow-50 border-yellow-200",
            icon: "text-yellow-400",
            title: "text-yellow-800",
            message: "text-yellow-700",
            button: "text-yellow-500 hover:text-yellow-600",
        },
        info: {
            container: "bg-blue-50 border-blue-200",
            icon: "text-blue-400",
            title: "text-blue-800",
            message: "text-blue-700",
            button: "text-blue-500 hover:text-blue-600",
        },
    };
    return styles[type] || styles.info;
};
</script>

<template>
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full hidden lg:block">
        <transition-group
            enter-active-class="transform ease-out duration-300 transition"
            enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-for="notification in notifications"
                :key="notification.id"
                :class="cn('rounded-lg border p-4 shadow-lg', getStyles(notification.type).container)"
            >
                <div class="flex">
                    <div class="flex-shrink-0">
                        <component
                            :is="getIcon(notification.type)"
                            :class="cn('h-5 w-5', getStyles(notification.type).icon)"
                        />
                    </div>
                    <div class="ml-3 flex-1">
                        <h3
                            v-if="notification.title"
                            :class="cn('text-sm font-medium', getStyles(notification.type).title)"
                        >
                            {{ notification.title }}
                        </h3>
                        <div
                            :class="
                                cn('text-sm', getStyles(notification.type).message, notification.title ? 'mt-1' : '')
                            "
                        >
                            {{ notification.message }}
                        </div>
                    </div>
                    <div class="ml-4 flex flex-shrink-0">
                        <button
                            type="button"
                            :class="
                                cn(
                                    'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                                    getStyles(notification.type).button
                                )
                            "
                            @click="removeNotification(notification.id)"
                        >
                            <span class="sr-only">Dismiss</span>
                            <XMarkIcon class="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </transition-group>
    </div>
</template>

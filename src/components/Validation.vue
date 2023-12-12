<template >
    <q-icon :name="iconName" class="iconStatus" :style="{color: (isValid) ? 'green' : 'red'}" />
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    isValid: {
        type: Boolean,
        default: false
    }
})

const iconName = ref(props.isValid ? 'task_alt' : 'schedule')

watch(() => props.isValid, (newStatus) => {
    console.log('watch Validation:', newStatus)
    if (newStatus) {
        iconName.value = 'task_alt'
    } else {
        iconName.value = 'schedule' // hourglass_empty'
    }
}, { inmediate: true })

</script >

<style lang="scss">
.iconStatus {
    font-size: 24px;
    font-weight: bold;
    margin: auto;
    text-shadow: 1px 1px 1px gray;
}
</style>

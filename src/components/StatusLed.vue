<template >
    <div class="ledFrame" :style="{backgroundImage: color}">
        <div class="led">
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
    status: {
        type: String
    }
})

const color = ref('gray')

onMounted(() => {
    evalColor(props.status)
})

const evalColor = (st) => {
    let col = 'gray'
    switch (st) {
        case 'pending':
            col = 'red'
            break
        case 'partial':
            col = '#ffd100'
            break
        case 'total':
            col = '#00b900'
            break
    }
    const cc = `radial-gradient( farthest-corner at -5px -5px,white 20%, ${col}  70% )`
    color.value = cc
}

watch(() => props.status, (newStatus) => {
    evalColor(newStatus)
}, { inmediate: true })

</script >

<style lang="scss">
.ledFrame {
    position: relative;
    border-radius: 50%;
    box-shadow: 1px 1px 2px gray;
    width: 20px !important;
    height: 20px !important;
    margin: auto;
    padding: none;
}
</style>

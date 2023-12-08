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

console.log('StatusLed CONSTRUCTOR', props.status)

onMounted(() => {
    evalColor(props.status)
})

const evalColor = (st) => {
    let col = 'gray'
    switch (st) {
        case 'pendiente':
            col = 'red'
            break
        case 'pagado':
            col = '#ffd100'
            break
        case 'validado':
            col = 'green'
            break
    }
    const cc = `radial-gradient( farthest-corner at -5px -5px,white 30%, ${col}  70% )`
    color.value = cc
    console.log('new Status:', st, 'color:', col, 'gradient:', cc)
}

watch(() => props.status, (newStatus) => {
    evalColor(newStatus)
}, { inmediate: true })

</script >

<style lang="scss">
.ledFrame {
    position: relative;
    border-radius: 50%;
    border: 1px solid black;
    box-shadow: 1px 1px 3px black;
    width: 20px !important;
    height: 20px !important;
    margin: auto;
    padding: none;
}
</style>

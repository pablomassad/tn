<template >
    <div @click="selSortCol" class="grdSort">
        <div class="lblArrow">
            {{ label }}
            <q-icon v-if="activeCol === col" :name="arrowIcon" class="arrowIcon" />
            <div v-else class="arrowEmpty"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    col: {
        type: String
    },
    label: {
        type: String
    },
    sortMethod: {
        type: Function
    },
    activeCol: {
        type: String
    }
})

const sortDir = ref(1)
const arrowIcon = computed(() => {
    const icon = (sortDir.value < 0) ? 'arrow_drop_down' : 'arrow_drop_up'
    return icon
})

const selSortCol = () => {
    sortDir.value = -sortDir.value
    props.sortMethod(props.col, sortDir.value)
}
</script >

<style lang="scss">
.grdSort {
    display: grid;
    align-items: center;
    height: 40px;
}

.lblArrow {
    display: flex;
    align-items: center;
    margin-right: -5px;
}

.arrowIcon {
    font-size: 23px;
    margin: -2px;
}

.arrowEmpty {
    width: 18px;
}
</style>

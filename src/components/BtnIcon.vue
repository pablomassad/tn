<template >
    <div class="btnFrame">
        <div class="btn" :class="{'btnPressed': !!pressed, 'btnDisabled': disabled}" @click="emit('click')">
            <q-icon :name="icon" class="btnIcon"></q-icon>
        </div>
        <div class="panelDisabled" v-if="disabled"></div>
    </div>
</template>

<script setup>
const emit = defineEmits(['click'])

const props = defineProps({
    icon: {
        type: String
    },
    disabled: {
        type: Boolean,
        default: false
    },
    pressed: {
        type: Boolean,
        default: false
    }
})
</script >

<style lang="scss">
.btnFrame {
    position: relative;
}

.btn {
    position: relative;
    display: grid;
    margin: 5px auto;
    border-radius: 5px;
    box-shadow: 1px 1px 3px gray;
    background-color: cornflowerblue;
    width: 30px;
    height: 30px;
    text-shadow: 1px 1px 1px black;
}

.btn:active {
    background: #4e8fa3;
    transform: translateY(2px);
    text-shadow: 0px -1px 1px black;
    box-shadow: inset 2px 2px 4px black;
}

.btnPressed {
    background: #4e8fa3;
    transform: translateY(2px);
    text-shadow: 0px -1px 1px black;
    box-shadow: inset 2px 2px 4px black;
}

.btnDisabled {
    opacity: .4;
}

.panelDisabled {
    position: absolute;
    /* background-color: red; */
    height: 40px;
    width: 40px;
    top: 2px;
    left: 10px;
}

.btnIcon {
    padding: 5px;
    font-size: 20px;
    color: white;
}
</style>

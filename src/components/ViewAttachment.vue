<template >
    <div class="viewFrame" v-if="showView">
        <q-icon name="close" class="btnClose" @click="onClose" />
        <img :src="imgUrl" class="image" />
        <q-btn glossy round color="primary" icon="edit" @click="attach" class="btnAtt" />
        <input type="file" ref="refAttachment" @change="onUploadAttachment" style="display:none" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['onAttach'])
const showView = ref(false)
const imgUrl = ref()
const refAttachment = ref()

onMounted(() => {
    console.log('ViewAttachment onMounted')
})
onUnmounted(() => {
    console.log('ViewAttachment onUnmounted')
})
const onClose = () => {
    showView.value = false
}
const attach = () => {
    refAttachment.value.click()
}
const onUploadAttachment = async (e) => {
    const o = e.target.files[0]
    emit('onAttach', o)
    show(o)
    refAttachment.value.value = ''
}
const show = (o) => {
    showView.value = true
    if (typeof o === 'object' && o !== null) {
        imgUrl.value = URL.createObjectURL(o)
    } else {
        imgUrl.value = o
    }
}
defineExpose({ show })
</script >

<style lang="scss">
.viewFrame {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: lightcyan;
    z-index: 6001;
}

.btnClose {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 40px;
}

.image {
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.btnAtt {
    position: absolute;
    bottom: 10px;
    right: 10px;
}
</style>

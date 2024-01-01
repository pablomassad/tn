<template >
    <div class="grd">
        <div class="attFrame">
            <div v-if="!localUrl">
                <q-icon name="attachment" class="clip"></q-icon>
                <div class="emptyText" @click="attachShow">{{ emptyLabel }}</div>
            </div>
            <img v-else :src="imgUrl" class="image" />
        </div>
        <div class="deleteText" @click="onDelete">
            Borrar
        </div>
    </div>

    <input type="file" ref="refAttachment" @change="onSelFile" style="display:none" />
    <div class="viewFrame" v-if="showImgFlag">
        <q-btn glossy round color="primary" icon="close" @click="onClose" class="btnClose" />
        <img :src="imgUrl" class="image" />
    </div>
    <!--<div class="grdBtns">
        <q-btn glossy color="primary" icon="attachment" @click="attach" />
        <q-btn glossy color="primary" icon="visibility" @click="showAttachment" :disable="!localUrl" />
        <q-btn glossy color="red" icon="delete" @click="onDelete" :disable="!localUrl" />
    </div>
-->
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['onAttach', 'onDelete'])
const props = defineProps(['src', 'emptyLabel'])

const showImgFlag = ref(false)
const imgUrl = ref()
const localUrl = ref()
const refAttachment = ref()

onMounted(() => {
    console.log('Attachment onMounted:', props.src)
    localUrl.value = props.src
})
onUnmounted(() => {
    console.log('Attachment onUnmounted')
})
const onClose = () => {
    showImgFlag.value = false
}
const onDelete = () => {
    showImgFlag.value = false
    if (localUrl.value) {
        localUrl.value = undefined
    }
    emit('onDelete', undefined)
}
const attachShow = () => {
    if (localUrl.value) {
        showAttachment()
    } else {
        refAttachment.value.click()
    }
}
const onSelFile = async (e) => {
    const o = e.target.files[0]
    refAttachment.value.value = ''
    showAttachment(o)
    emit('onAttach', o)
}
const showAttachment = (o) => {
    const tmp = new Image()
    if (o.name) {
        localUrl.value = URL.createObjectURL(o)
    }
    tmp.src = localUrl.value
    tmp.onload = function () {
        console.log('La URL es una imagen')
        showImgFlag.value = true
        imgUrl.value = tmp.src
    }
    tmp.onerror = function () {
        console.log('La URL no es una imagen')
        window.open(tmp.src, 'blank')
    }
}
</script >

<style lang="scss">
.grd {
    display: grid;
    grid-template-rows: 1fr 10px;
}

.attFrame {
    background-color: #dedede;
    box-shadow: inset 1px 1px 5px #b2b2b2;
    border-radius: 20px;
    overflow: hidden;
}

.clip {
    display: grid;
    padding-top: 20%;
    color: gray;
    font-size: 50px;
    margin: auto;
}

.emptyText {
    color: gray;
    text-shadow: 1px 1px 1px white;
    text-align: center;
    font-size: 20px;
}

.deleteText {
    text-decoration: underline;
    font-size: 16px;
    color: #7b7b7b;
    font-weight: bold;
    text-align: right;
}

.grdBtns {
    display: grid;
    grid-template-columns: 40px 40px 40px;
    column-gap: 10px;
}

.viewFrame {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: lightcyan;
    z-index: 1;
}

.btnClose {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 16px;
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

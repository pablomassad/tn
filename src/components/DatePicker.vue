<template @keypress.esc="close">
    <transition name="modal-animation">
        <div v-if="modalActive" class="modal" @click="close">
            <transition name="modal-animation-inner">
                <div class="modalInner" v-on:click.stop="prevent">
                    <q-date v-model="dtPicker" :mask="MASK" title="Fecha" text-color="white" :locale="myLocale" />
                    <q-btn style="width: 100%" color="primary" label="Aceptar" @click="accept" />
                </div>
            </transition>
        </div>
    </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import moment from 'moment'

const emit = defineEmits(['close'])

const MASK = 'DD/MM/YY'
const dtPicker = ref()
const modalActive = ref(false)

const myLocale = {
    days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split(
        '_'
    ),
    daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
    months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split(
        '_'
    ),
    monthsShort:
        'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split(
            '_'
        ),
    firstDayOfWeek: 1
}

onMounted(() => {
    console.log('onMounted DatePicker')
})
onUnmounted(() => {
    console.log('onUnmounted DatePicker')
})

const accept = () => {
    console.log('accept event')
    modalActive.value = false
    const dt = moment(dtPicker.value, MASK).unix() * 1000
    emit('close', dt)
}
const close = () => {
    console.log('close event')
    modalActive.value = false
    emit('close')
}
const prevent = (e) => {
    console.log('prevent:', e)
}
const show = (initDate) => {
    dtPicker.value = moment(initDate).format(MASK)
    modalActive.value = true
}

defineExpose({ show })
</script >

<style lang="scss" scoped>
.modal-animation-enter-active,
.modal-animation-leave-active {
    transition: opacity 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-animation-enter-from,
.modal-animation-leave-to {
    opacity: 0;
}

/*.modal-animation-leave-from
.modal-animation-enter-to {
    opacity:1;
}*/

.modal-animation-inner-enter-active {
    transition: opacity 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s;
}

.modal-animation-inner-leave-active {
    transition: opacity 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-animation-inner-enter-from {
    opacity: 0;
    transform: scale(0.8);
}

.modal-animation-inner-leave-to {
    transform: scale(0.8);
}

.modal {
    z-index: 6001;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    position: fixed;
    background: rgba(173, 216, 230, 0.473);
}

.modalInner {
    position: relative;
    display: grid;
    box-shadow: 3px 3px 10px;
    border-radius: 10px;
    background-color: white;
}

.ico {
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
}
</style>

<template>
    <div class="grdComps">
        <div class="fila receipt encabezado">
            <div class="celda central">Fecha</div>
            <div class="celda precio">Importe</div>
            <div class="celda texto">Forma de pago</div>
            <div class="celda central">Ver</div>
        </div>
        <div v-if="userReceipts">
            <div v-for="(cp) in userReceipts" :key="cp" class="fila receipt">
                <div class="celda central">{{ moment(cp.datetime).format('DD/MM/YY') }}</div>
                <div class="celda precio">{{ cp.amount }}</div>
                <div class="celda texto">{{ cp.payType }}</div>
                <BtnIcon class="celda central" icon="visibility" @click="viewComp(cp)" />
            </div>
            <div class="fila receipt total">
                <div class="celda central">TOTAL</div>
                <div class="celda precio">{{ userExpense.paid }}</div>
            </div>
        </div>
        <q-btn glossy round color="primary" icon="add" @click="addComp" class="addBtn"></q-btn>
    </div>
    <ReceiptFormTerra ref="refReceiptFormTerra" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import moment from 'moment'
import ReceiptFormTerra from 'src/components/ReceiptFormTerra.vue'
import BtnIcon from 'src/components/BtnIcon.vue'

console.log('ReceiptsTerra CONSTRUCTOR')

const emit = defineEmits(['onCheck'])
const props = defineProps({
    userExpense: {
        type: Object
    },
    userReceipts: {
        type: Object
    }
})

const refReceiptFormTerra = ref()

onMounted(async () => {
    console.log('ReceiptsTerra onMounted')
})
onUnmounted(() => {
    console.log('ReceiptsTerra onUnmounted')
})
const addComp = () => {
    refReceiptFormTerra.value.show(props.userExpense.expName)
}
const viewComp = (cp) => {
    refReceiptFormTerra.value.show(props.userExpense.expName, cp)
}

watch(() => props.userExpense, (newVal) => {
    console.log('watch Receipts userExpense:', newVal)
})
</script>

<style scoped>
.grdComps {
    padding: 20px;
    background: lightgray;
    display: grid;
    justify-content: center;
}

.receipt {
    grid-template-columns: 70px 80px 40px 40px;
    width: 320px;
    /*display: grid;
    align-items: center;
    background: white;
    column-gap: 20px;
    padding: 5px 15px;
    border-bottom: 1px solid gray;
    margin: auto;*/
}

.addBtn {
    position: absolute;
    right: 4px;
    bottom: 4px;
}
</style>

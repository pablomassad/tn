<template>
    <div class="grdComps">
        <div class="rowComp encabezado">
            <div class="centro">Fecha</div>
            <div class="importe">Importe</div>
            <div class="importe">Forma de pago</div>
            <div class="centro">Ver</div>
        </div>
        <div v-if="userReceipts">
            <div v-for="(cp) in userReceipts" :key="cp" class="rowComp">
                <div class="centro">{{ moment(cp.datetime).format('DD/MM/YY') }}</div>
                <div class="importe">{{ cp.amount.toFixed(1) }}</div>
                <div class="centro">{{ cp.payType }}</div>
                <BtnIcon icon="visibility" @click="viewComp(cp)" />
            </div>
            <div class="rowComp total">
                <div class="centro">TOTAL</div>
                <div class="importe">{{ userExpense.paid.toFixed(1) }}</div>
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
    position: relative;
    background: lightgray;
}

.rowComp {
    display: grid;
    grid-template-columns: 70px 80px 40px 40px;
    align-items: center;
    width: 320px;
    background: white;
    column-gap: 20px;
    padding: 5px 15px;
    border-bottom: 1px solid gray;
    margin: auto;
}

.encabezado {
    background-color: lightblue;
    font-weight: bold;
    border-radius: 10px 10px 0 0;
}

.importe {
    text-align: right;
}

.centro {
    text-align: center;
}

.total {
    position: relative;
    background: lightyellow !important;
    font-weight: bold;
    height: 60px;
}

.addBtn {
    position: absolute;
    right: 4px;
    bottom: 4px;
}
</style>

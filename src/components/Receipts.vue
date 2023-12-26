<template>
    <div class="grdComps">
        <div class="fila receipt encabezado">
            <SortColumn class="celda central" col="date" label="Fecha" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <SortColumn class="celda precio" col="amount" label="Importe" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <div class="celda central">Ver</div>
            <SortColumn class="celda central" col="isValid" label="Válido" :sortMethod="sortReceipts" :activeCol="activeCol" />
        </div>
        <div v-if="userReceipts">
            <div v-for="(cp) in receipts" :key="cp" class="fila receipt">
                <div class="celda central">{{ moment(cp.date).format('DD/MM/YY') }}</div>
                <div class="celda precio">{{ cp.amount }}</div>
                <BtnIcon class="celda central" icon="visibility" @click="viewComp(cp)" />
                <Validation :isValid="cp.isValid" @click="toggleValidation(cp)" />
            </div>
            <div class="fila receipt total">
                <div class="celda central">TOTAL</div>
                <div class="celda precio">{{ userExpense.paid }}</div>
                <q-btn glossy round color="primary" icon="add" @click="addComp" class="addBtn"></q-btn>
            </div>
        </div>
    </div>
    <ReceiptForm ref="refReceiptForm" :refreshFn="refreshFn" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import moment from 'moment'
import ReceiptForm from 'src/components/ReceiptForm.vue'
import BtnIcon from 'src/components/BtnIcon.vue'
import Validation from 'src/components/Validation.vue'
import SortColumn from 'src/components/SortColumn.vue'

console.log('Receipts CONSTRUCTOR')

const emit = defineEmits(['onCheck'])
const props = defineProps({
    userExpense: {
        type: Object
    },
    userReceipts: {
        type: Object
    },
    refreshFn: {
        type: Function
    }
})

const activeCol = ref()
const refReceiptForm = ref()
const receipts = ref()

onMounted(async () => {
    console.log('Receipts onMounted')
    receipts.value = [...props.userReceipts]
})
onUnmounted(() => {
    console.log('Receipts onUnmounted')
})
const addComp = () => {
    refReceiptForm.value.show(props.userExpense.expName)
}
const viewComp = (cp) => {
    refReceiptForm.value.show(props.userExpense.expName, cp)
}
const toggleValidation = (cp) => {
    console.log('toggleValidation:', cp)
    emit('onCheck', cp)
}
const sortReceipts = (field, dir) => {
    const arr = sortArray(receipts.value, field, dir)
    receipts.value = arr
    activeCol.value = field
}
const sortArray = (arr, key, dir) => {
    const res = arr.sort((a, b) => {
        if (a[key] > b[key]) return 1 * dir
        if (a[key] < b[key]) return -1 * dir
        return 0
    })
    return res
}
watch(() => props.userReceipts, (newReceipts) => {
    console.log('watch Receipts:', newReceipts)
    receipts.value = [...newReceipts]
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
    grid-template-columns: 90px 80px 60px 60px;
    width: 300px;
    background-color: white;
    box-shadow: 1px 1px 4px gray;
}

.addBtn {
    position: absolute;
    right: 4px;
    bottom: 4px;
}
</style>

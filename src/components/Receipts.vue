<template>
    <div class="grdComps">
        <div class="rowComp encabezado">
            <SortColumn class="texto" col="date" label="Fecha" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <SortColumn class="precio" col="amount" label="Importe" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <div class="central">Ver</div>
            <SortColumn class="central" col="isValid" label="Válido" :sortMethod="sortReceipts" :activeCol="activeCol" />
        </div>
        <div v-if="userReceipts">
            <div v-for="(cp) in receipts" :key="cp" class="rowComp">
                <div class="centro">{{ moment(cp.date).format('DD/MM/YY') }}</div>
                <div class="importe">{{ cp.amount.toFixed(1) }}</div>
                <BtnIcon icon="visibility" @click="viewComp(cp)" />
                <Validation :isValid="cp.isValid" @click="toggleValidation(cp)" />
            </div>
            <div class="rowComp total">
                <div class="centro">TOTAL</div>
                <div class="importe">{{ userExpense.paid.toFixed(1) }}</div>
                <q-btn glossy round color="primary" icon="add" @click="addComp" class="addBtn"></q-btn>
            </div>
        </div>
    </div>
    <ReceiptForm ref="refReceiptForm" />
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

<template>
    <div class="grdComps">
        <div class="fila receipt encabezado">
            <SortColumn class="celda central" col="date" label="Fecha" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <SortColumn class="celda precio" col="amount" label="Importe" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <div class="celda central">Ver</div>
            <SortColumn class="celda central" col="isValid" label="Válido" :sortMethod="sortReceipts" :activeCol="activeCol" />
        </div>
        <div v-if="receipts">
            <div v-for="(cp) in receipts" :key="cp" class="fila receipt">
                <div class="celda central">{{ moment(cp.date).format(appStore.state.dateMask) }}</div>
                <div class="celda precio">{{ cp.amount }}</div>
                <BtnIcon class="celda central" icon="visibility" @click="viewComp(cp)" />
                <Validation :isValid="cp.isValid" @click="toggleValidation(cp)" />
            </div>
            <div class="fila receipt total">
                <div class="celda central">TOTAL</div>
                <div class="celda precio">{{ appStore.state.selUserExpense.paid }}</div>
                <q-btn glossy round color="primary" icon="add" @click="addComp" class="addBtn"></q-btn>
            </div>
        </div>
    </div>
    <ReceiptForm ref="refReceiptForm" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ui } from 'fwk-q-ui'
import moment from 'moment'
import appStore from 'src/pages/appStore'
import ReceiptForm from 'src/components/ReceiptForm.vue'
import BtnIcon from 'src/components/BtnIcon.vue'
import Validation from 'src/components/Validation.vue'
import SortColumn from 'src/components/SortColumn.vue'

console.log('Receipts CONSTRUCTOR')

const emit = defineEmits(['onCheck'])

const activeCol = ref()
const refReceiptForm = ref()
const receipts = ref()

onMounted(async () => {
    console.log('Receipts onMounted')
    receipts.value = await appStore.actions.userExpenses.getReceiptsByUserExp()
})
onUnmounted(() => {
    console.log('Receipts onUnmounted')
})
const addComp = () => {
    refReceiptForm.value.show()
}
const viewComp = (cp) => {
    refReceiptForm.value.show(cp)
}
const toggleValidation = async (cp) => {
    console.log('toggleValidation:', cp)
    if (appStore.state.selUnit.role === 'admin') {
        ui.actions.showLoading()
        await appStore.actions.userExpenses.toggleValidation(cp)
        ui.actions.hideLoading()
    }
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

<template>
    <div class="grdComps">
        <div class="fila receipt encabezado">
            <SortColumn class="celda central" col="date" label="Fecha" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <SortColumn class="celda precio" col="amount" label="Importe" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <SortColumn class="celda central" col="payType" label="Forma de pago" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <div class="celda central">Ver</div>
        </div>
        <div v-if="receipts">
            <div v-for="(cp) in receipts" :key="cp" class="fila receipt">
                <div class="celda central">{{ moment(cp.datetime).format(appStore.state.dateMask) }}</div>
                <div class="celda precio">{{ cp.amount }}</div>
                <div class="celda central">{{ cp.payType }}</div>
                <BtnIcon class="celda central" icon="visibility" @click="viewComp(cp)" />
            </div>
            <div class="fila receipt total">
                <div class="celda central">TOTAL</div>
                <div class="celda precio">{{ appStore.state.selTicket.paid }}</div>
                <q-btn glossy round color="primary" icon="add" @click="addComp" class="addBtn"></q-btn>
            </div>
        </div>
    </div>
    <ReceiptFormTerra ref="refReceiptFormTerra" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import moment from 'moment'
import appStore from 'src/pages/appStore'
import ReceiptFormTerra from 'src/components/ReceiptFormTerra.vue'
import BtnIcon from 'src/components/BtnIcon.vue'
import SortColumn from 'src/components/SortColumn.vue'

console.log('ReceiptsTerra CONSTRUCTOR')

const emit = defineEmits(['onCheck'])

const activeCol = ref()
const refReceiptFormTerra = ref()
const receipts = ref()

onMounted(async () => {
    console.log('ReceiptsTerra onMounted')
    receipts.value = await appStore.actions.tickets.getReceiptsByTicket()
})
onUnmounted(() => {
    console.log('ReceiptsTerra onUnmounted')
})
const addComp = () => {
    refReceiptFormTerra.value.show()
}
const viewComp = (cp) => {
    refReceiptFormTerra.value.show(cp)
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
    grid-template-columns: 80px 90px 130px 60px;
    width: 360px;
    background-color: white;
    box-shadow: 1px 1px 4px gray;
}

.addBtn {
    position: absolute;
    right: 4px;
    bottom: 4px;
}
</style>

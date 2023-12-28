<template>
    <div class="grdComps">
        <div class="fila receipt encabezado">
            <SortColumn class="celda central" col="date" label="Fecha" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <SortColumn class="celda precio" col="amount" label="Importe" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <SortColumn class="celda central" col="payType" label="Forma de pago" :sortMethod="sortReceipts" :activeCol="activeCol" />
            <div class="celda central">Ver</div>
        </div>
        <div v-if="ticketReceipts">
            <div v-for="(cp) in ticketReceipts" :key="cp" class="fila receipt">
                <div class="celda central">{{ moment(cp.datetime).format(appStore.state.dateMask) }}</div>
                <div class="celda precio">{{ cp.amount }}</div>
                <div class="celda central">{{ cp.payType }}</div>
                <BtnIcon class="celda central" icon="visibility" @click="viewComp(cp)" />
            </div>
            <div class="fila receipt total">
                <div class="celda central">TOTAL pagado</div>
                <div class="celda precio">{{ appStore.state.selTicket.paid }}</div>
                <q-btn glossy round color="primary" icon="add" @click="addComp" class="addBtn"></q-btn>
            </div>
        </div>
    </div>
    <TicketReceiptForm ref="refTicketReceiptForm" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import moment from 'moment'
import appStore from 'src/pages/appStore'
import TicketReceiptForm from './TicketReceiptForm.vue'
import BtnIcon from 'src/components/BtnIcon.vue'
import SortColumn from 'src/components/SortColumn.vue'

console.log('ReceiptsTerra CONSTRUCTOR')

const emit = defineEmits(['onCheck'])

const activeCol = ref()
const refTicketReceiptForm = ref()
const ticketReceipts = ref()

onMounted(async () => {
    console.log('ReceiptsTerra onMounted')
    ticketReceipts.value = await appStore.actions.tickets.getReceiptsByTicket()
})
onUnmounted(() => {
    console.log('ReceiptsTerra onUnmounted')
})
const addComp = () => {
    refTicketReceiptForm.value.show()
}
const viewComp = (cp) => {
    refTicketReceiptForm.value.show(cp)
}
const sortReceipts = (field, dir) => {
    const arr = sortArray(ticketReceipts.value, field, dir)
    ticketReceipts.value = arr
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
    grid-template-columns: 100px 90px 130px 60px;
    width: 380px;
    background-color: white;
    box-shadow: 1px 1px 4px gray;
}

.addBtn {
    position: absolute;
    right: 4px;
    bottom: 4px;
}
</style>

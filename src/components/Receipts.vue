<template>
    <div class="grdComps">
        <div class="rowComp encabezado">
            <div class="centro">Fecha</div>
            <div class="importe">Importe</div>
            <div class="centro">Ver</div>
            <div class="centro">Estado</div>
        </div>
        <div v-if="expense">
            <div v-for="(cp) in expense.receipts" :key="cp" class="rowComp">
                <div class="centro">{{ moment(cp.datetime).format('DD/MM/YY') }}</div>
                <div class="importe">{{ cp.amount.toFixed(1) }}</div>
                <BtnIcon icon="visibility" @click="viewComp(cp)" />
                <StatusLed :status="cp.status ? 'valid' : 'pending'" />
            </div>
            <div class="rowComp total">
                <div class="centro">TOTAL</div>
                <div class="importe">{{ expense.paid.toFixed(1) }}</div>
                <q-btn glossy round color="primary" icon="add" @click="addComp" class="addBtn"></q-btn>
            </div>
        </div>

    </div>
    <ReceiptForm ref="refReceipt" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import moment from 'moment'
import ReceiptForm from 'src/components/ReceiptForm.vue'
import BtnIcon from 'src/components/BtnIcon.vue'
import StatusLed from 'src/components/StatusLed.vue'

console.log('Receipts CONSTRUCTOR')

const props = defineProps({
    expense: {
        type: Object
    }
})

const refReceipt = ref()

onMounted(async () => {
    console.log('Receipts onMounted')
})
const addComp = () => {
    refReceipt.value.show(props.expense)
}
const viewComp = (cp) => {
    refReceipt.value.show(props.expense, cp)
}
</script>

<style scoped>
.grdComps {
    padding: 20px;
    position: relative;
    background: lightgray;
}

.rowComp {
    display: grid;
    grid-template-columns: 70px 80px 60px 70px;
    align-items: center;
    width: 364px;
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

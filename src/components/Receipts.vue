<template>
    <div class="grdComps">
        <div class="rowComp encabezado">
            <div class="centro">Fecha</div>
            <div class="importe">Importe</div>
            <div class="centro">Ver</div>
            <div class="centro">Válido</div>
        </div>
        <div v-if="userExpense">
            <div v-for="(cp) in userExpense.receipts" :key="cp" class="rowComp">
                <div class="centro">{{ moment(cp.datetime).format('DD/MM/YY') }}</div>
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
    <ReceiptForm ref="refReceipt" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import moment from 'moment'
import ReceiptForm from 'src/components/ReceiptForm.vue'
import BtnIcon from 'src/components/BtnIcon.vue'
import Validation from 'src/components/Validation.vue'

console.log('Receipts CONSTRUCTOR')

const emit = defineEmits(['onCheck'])
const props = defineProps({
    userExpense: {
        type: Object
    }
})

const refReceipt = ref()

onMounted(async () => {
    console.log('Receipts onMounted')
})
onUnmounted(() => {
    console.log('Receipts onUnmounted')
})
const addComp = () => {
    refReceipt.value.show(props.userExpense)
}
const viewComp = (cp) => {
    refReceipt.value.show(props.userExpense, cp)
}
const toggleValidation = (cp) => {
    console.log('toggleValidation:', cp)
    emit('onCheck', cp)
}

watch(() => props.userExpense, (newExp, oldExp) => {
    console.log('watch userExpense:', newExp, oldExp)
}, { deep: true })
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

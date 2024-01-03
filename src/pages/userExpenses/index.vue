<template>
    <div class="" v-if="appStore.state.selUnit">
        <div class="userForm">
            <div class="label" @click="appStore.actions.moveData()">Propietario: </div>
            <div class="value">{{ appStore.state.selUnit.ownerNames }}</div>
            <div class="label">Unidad: </div>
            <div class="value">{{ appStore.state.selUnit.id }}</div>
            <div class="label">CUIT: </div>
            <div class="value">34901230901</div>
            <div class="label">Saldo: </div>
            <div class="value">$0</div>
        </div>
        <div class="matrix">
            <div class="fila expensa encabezado">
                <SortColumn class="texto" col="expName" label="Expensa" :sortMethod="appStore.actions.userExpenses.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="lastAmount" label="Ult.Importe" :sortMethod="appStore.actions.userExpenses.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="lastPaid" label="Ult.Pago" :sortMethod="appStore.actions.userExpenses.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="lastBalance" label="Ult.Saldo" :sortMethod="appStore.actions.userExpenses.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="amount" label="Importe" :sortMethod="appStore.actions.userExpenses.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="interest" label="Interes" :sortMethod="appStore.actions.userExpenses.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="credit" label="A cuenta" :sortMethod="appStore.actions.userExpenses.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="paid" label="Pagado" :sortMethod="appStore.actions.userExpenses.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="balance" label="Saldo" :sortMethod="appStore.actions.userExpenses.sort" :activeCol="appStore.state.activeCol" />
                <div class="celda central">Descargar</div>
                <div class="celda central">Comprobantes</div>
                <SortColumn class="celda central" col="status" label="Estado" :sortMethod="appStore.actions.userExpenses.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="celda central" col="isValid" label="Válido" :sortMethod="appStore.actions.userExpenses.sort" :activeCol="appStore.state.activeCol" />
            </div>
            <div v-for="(item) in appStore.state.expensesByUnit" :key="item">
                <div class="fila expensa">
                    <div class="celda texto">{{ item.expName }}</div>
                    <div class="celda precio">{{ item.lastAmount }}</div>
                    <div class="celda precio">{{ item.lastPaid }}</div>
                    <div class="celda precio">{{ item.lastBalance }}</div>
                    <div class="celda precio">{{ item.amount }}</div>
                    <div class="celda precio">{{ item.interest }}</div>
                    <div class="celda precio">{{ item.credit }}</div>
                    <div class="celda precio">{{ item.paid }}</div>
                    <div class="celda precio">{{ item.balance }}</div>
                    <BtnIcon icon="file_download" @click="download(item)" />
                    <BtnIcon icon="upload_file" @click="toggleReceipts(item)" />
                    <StatusLed class="celda central" :status="evalStatus(item)" />
                    <Validation class="celda central" :isValid="item.isValid" />
                </div>
                <Receipts v-if="showDetails[item.id]" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ui } from 'fwk-q-ui'
import appStore from 'src/pages/appStore'
import BtnIcon from 'src/components/BtnIcon.vue'
import Receipts from 'src/components/Receipts.vue'
import StatusLed from 'src/components/StatusLed.vue'
import Validation from 'src/components/Validation.vue'
import SortColumn from 'src/components/SortColumn.vue'

const showDetails = ref({})

onMounted(async () => {
    ui.actions.setTitle('Expensas')
    console.log('UserExpense onMounted')
    appStore.actions.userExpenses.monitorExpensesByUnit()
})
onUnmounted(() => {
    appStore.actions.unsubscribeListeners('us_expensesByUnit')
})
const evalStatus = (item) => {
    let st = 'pending'
    if (item.amount !== item.balance) {
        st = 'partial'
        if (item.balance === 0) {
            st = 'total'
        }
    }
    return st
}
const download = (uExp) => {
    appStore.set.selUserExpense(uExp)
    appStore.actions.admin.downloadExpense()
}
const toggleReceipts = async (uExp) => {
    appStore.set.selUserExpense(uExp)
    showDetails.value[uExp.id] = !showDetails.value[uExp.id]
}

watch(() => appStore.state.selUserExpense, (newVal) => {
    console.log('watch selUserExpense:', newVal)
})
</script>

<style scoped>
.userForm {
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
    padding: 50px;
    background-color: white;
    margin: auto;
    display: grid;
    grid-template-columns: 110px 350px 90px 70px;
    align-items: center;
    margin-top: 20px;
    max-width: 720px;
}

.matrix {
    position: relative;
    background-color: white;
    max-width: 1260px;
    margin: auto;
    margin-top: 50px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.expensa {
    grid-template-columns: 120px 100px 100px 100px 100px 100px 100px 100px 100px 100px 100px 60px 70px;
    width: 1260px;
}

.label {
    font-weight: bold;
    font-size: 20px;
}

.value {
    font-size: 18px;
    color: #555;
}

.interes {
    text-align: center;
}

.pagado {
    background-color: green;
}
</style>

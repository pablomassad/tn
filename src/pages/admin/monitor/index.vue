<template>
    <div>
        <div class="title">
            Expensa {{ appStore.actions.evalExpName(appStore.state.selExpense.id) }}
        </div>
        <div class="matrix" v-if="appStore.state.userExpenses">
            <div class="fila monitor encabezado">
                <SortColumn class="celda central" col="ownerNames" label="Propietarios" :sortMethod="appStore.actions.admin.sortUserExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="lastTotal" label="Ult.Total" :sortMethod="appStore.actions.admin.sortExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="lastPaid" label="Ult.Pagado" :sortMethod="appStore.actions.admin.sortExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="lastBalance" label="Ult.Saldo" :sortMethod="appStore.actions.admin.sortExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="celda precio" col="amout" label="Importe" :sortMethod="appStore.actions.admin.sortUserExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="celda precio" col="interest" label="Interes" :sortMethod="appStore.actions.admin.sortUserExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="celda precio" col="paid" label="Pagado" :sortMethod="appStore.actions.admin.sortUserExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="celda precio" col="balance" label="Saldo" :sortMethod="appStore.actions.admin.sortUserExpenses" :activeCol="appStore.state.activeCol" />
                <div class="celda central">Detalle</div>
                <SortColumn class="celda central" col="status" label="Estado" :sortMethod="appStore.actions.admin.sortUserExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="celda central" col="isValid" label="Válido" :sortMethod="appStore.actions.admin.sortUserExpenses" :activeCol="appStore.state.activeCol" />
            </div>
            <div class="expensesList">
                <div v-for="item in appStore.state.userExpenses" :key="item">
                    <div class="fila monitor">
                        <div class="celda texto">{{ item.ownerNames }}</div>
                        <div class="celda precio">{{ item.lastTotal?.toFixed(1) }}</div>
                        <div class="celda precio">{{ item.lastPaid?.toFixed(1) }}</div>
                        <div class="celda precio">{{ item.lastBalance?.toFixed(1) }}</div>
                        <div class="celda precio">{{ item.amount.toFixed(1) }}</div>
                        <div class="celda precio">{{ item.interest.toFixed(1) }}</div>
                        <div class="celda precio">{{ item.paid.toFixed(1) }}</div>
                        <div class="celda precio">{{ item.balance.toFixed(1) }}</div>
                        <BtnIcon icon="upload_file" @click="toggleReceipts(item)" />
                        <StatusLed class="celda central" :status="evalStatus(item)" />
                        <Validation :isValid="item.isValid" />
                    </div>
                    <Receipts v-if="showDetails[item.id]" :userExpense="appStore.state.selUserExpense" :userReceipts="appStore.state.selUserReceipts" @onCheck="toggleValidation" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import appStore from 'src/pages/appStore'
import Receipts from 'src/components/Receipts.vue'
import BtnIcon from 'src/components/BtnIcon.vue'
import StatusLed from 'src/components/StatusLed.vue'
import Validation from 'src/components/Validation.vue'
import { ui } from 'fwk-q-ui'
import SortColumn from 'src/components/SortColumn.vue'

const showDetails = ref({})

onMounted(async () => {
    console.log('Monitor Expenses onMounted')
    appStore.actions.admin.monitorUserExpenses()
})
onUnmounted(() => {
    appStore.actions.unsubscribeListeners('us_userExpenses')
})

const toggleReceipts = async (uExp) => {
    appStore.set.selUserExpense(uExp)
    setTimeout(async () => {
        await appStore.actions.userExpenses.getReceiptsByExp()
    }, 100)
    showDetails.value[uExp.id] = !showDetails.value[uExp.id]
}
const toggleValidation = async (cp) => {
    ui.actions.showLoading()
    await appStore.actions.userExpenses.toggleValidation(cp)
    ui.actions.hideLoading()
}
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
</script>

<style scoped>
.expensesList {
    height: calc(100vh - 200px);
    overflow: auto;
}

.typeIcon {
    font-size: 20px;
    color: green;
    justify-self: center;
}

.value {
    font-size: 18px;
    color: #555;
}

.title {
    font-size: 20px;
    text-shadow: 1px 1px 1px white;
    font-weight: bold;
    display: grid;
    justify-content: center;
    margin-top: 20px;
}

.detailsList {
    height: calc(100vh - 420px);
    overflow: auto;
}

.matrix {
    position: relative;
    background-color: white;
    max-width: 1200px;
    margin: auto;
    margin-top: 20px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.monitor {
    grid-template-columns: 270px 80px 90px 100px 100px 80px 100px 100px 80px 60px 60px;
    width: 1200px;
}

.total {
    position: relative;
    font-weight: bold;
    height: 40px;
}

.estado {
    justify-self: center;
    background-color: red;
    border-radius: 50%;
    box-shadow: 1px 1px 1px gray;
    width: 20px;
    height: 20px;
    border: 1px solid;

}

.btnIcon {
    padding: 5px;
    font-size: 20px;
    color: white;
    text-shadow: 1px 1px 1px black;
}

.btn {
    justify-self: center;
    border-radius: 5px;
    box-shadow: 1px 1px 3px gray;
    background-color: cornflowerblue;
    width: 30px;
    height: 30px;
    margin: 5px;
}

.btn:active {
    box-shadow: none;
}

.title {
    font-size: 20px;
    font-weight: bold;
    text-shadow: 1px 1px 1px white;
    text-align: center;
}

.addBtn {
    position: absolute;
    right: 4px;
    bottom: 4px;
}
</style>

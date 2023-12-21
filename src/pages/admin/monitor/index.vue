<template>
    <div>
        <div class="title">
            Expensa {{ appStore.actions.evalExpName(appStore.state.selExpense.id) }}
        </div>
        <div class="matrix" v-if="appStore.state.userExpenses">
            <div class="rowDetail encabezado">
                <div class="texto" @click="sortCol('ownerNames')">Propietarios</div>
                <div class="precio" @click="sortCol('amout')">Importe</div>
                <div class="precio" @click="sortCol('interest')">Interes</div>
                <div class="precio" @click="sortCol('paid')">Pagado</div>
                <div class="precio" @click="sortCol('balance')">Saldo</div>
                <div class="central">Detalle</div>
                <div class="centro">Estado</div>
                <div class="central" @click="sortCol('isValid')">Válido</div>
            </div>
            <div class="expensesList">
                <div v-for="item in appStore.state.userExpenses" :key="item">
                    <div class="rowDetail">
                        <div class="texto">{{ item.ownerNames }}</div>
                        <div class="precio">{{ item.amount.toFixed(1) }}</div>
                        <div class="precio">{{ item.interest.toFixed(1) }}</div>
                        <div class="precio">{{ item.paid.toFixed(1) }}</div>
                        <div class="precio">{{ item.balance.toFixed(1) }}</div>
                        <BtnIcon icon="upload_file" @click="toggleReceipts(item)" />
                        <StatusLed :status="evalStatus(item)" />
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

.matrix {
    position: relative;
    background-color: white;
    max-width: 940px;
    margin: auto;
    margin-top: 20px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.detailsList {
    height: calc(100vh - 420px);
    overflow: auto;
}

.rowDetail {
    display: grid;
    grid-template-columns: 260px 100px 70px 100px 100px 50px 40px 40px;
    align-items: center;
    width: 940px;
    height: 40px px;
    column-gap: 20px;
    padding: 0px 15px;
    border-bottom: 1px solid gray;
}

.total {
    position: relative;
    font-weight: bold;
    height: 40px;
}

.encabezado {
    background-color: lightblue;
    font-weight: bold;
    border-radius: 10px 10px 0 0;
    padding: 10px 15px;
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

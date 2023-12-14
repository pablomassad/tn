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
            <div class="rowExpensa encabezado">
                <div>Expensa</div>
                <div class="precio">Importe</div>
                <div class="precio">Interes</div>
                <div class="precio">Pagado</div>
                <div class="precio">Saldo</div>
                <div class="centro">Descargar</div>
                <div class="centro">Comprobantes</div>
                <div class="centro">Estado</div>
                <div class="centro">Vâlido</div>
            </div>
            <div v-for="(item) in appStore.state.expensesByUnit" :key="item">
                <div class="rowExpensa">
                    <div>{{ item.expName }}</div>
                    <div class="precio">{{ item.amount.toFixed(1) }}</div>
                    <div class="precio">{{ item.interest.toFixed(1) }}</div>
                    <div class="precio">{{ item.paid?.toFixed(1) }}</div>
                    <div class="precio">{{ item.balance.toFixed(1) }}</div>
                    <BtnIcon icon="file_download" @click="download(item)" />
                    <BtnIcon icon="upload_file" @click="toggleReceipts(item)" />
                    <StatusLed class="centro" :status="evalStatus(item)" />
                    <Validation :isValid="item.isValid" />
                </div>
                <Receipts v-if="showDetails[item.id]" :userExpense="appStore.state.selUserExpense" :userReceipts="appStore.state.selUserReceipts" @onCheck="toggleValidation" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import appStore from 'src/pages/appStore'
import { useRouter } from 'vue-router'
import BtnIcon from 'src/components/BtnIcon.vue'
import Receipts from 'src/components/Receipts.vue'
import StatusLed from 'src/components/StatusLed.vue'
import Validation from 'src/components/Validation.vue'
import { ui } from 'fwk-q-ui'

const router = useRouter()
const showDetails = ref({})

onMounted(async () => {
    ui.actions.setTitle('Expensas')
    console.log('UserExpense onMounted')
    if (!appStore.state.selUnit) {
        router.push('/login')
    } else {
        appStore.actions.userExpenses.monitorExpensesByUnit()
    }
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

.addBtn {
    position: absolute;
    right: 22px;
    bottom: 10px;

}

.matrix {
    background-color: white;
    max-width: 830px;
    margin: auto;
    margin-top: 50px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.rowExpensa {
    display: grid;
    grid-template-columns: 110px 80px 70px 70px 70px 70px 90px 40px 40px;
    align-items: center;
    width: 830px;
    column-gap: 20px;
    padding: 0 15px;
    border-bottom: 1px solid gray;
}

.label {
    font-weight: bold;
    font-size: 20px;
}

.chkStatus {
    color: red;
    font-size: 25px;
    text-shadow: 1px 1px 1px black;
    font-weight: bold;
    justify-self: center;
}

.chkValid {
    color: green;
}

.importe {
    text-align: right;
}

.centro {
    text-align: center;
}

.precio {
    text-align: right;
}

.interes {
    text-align: center;
}

.value {
    font-size: 18px;
    color: #555;
}

.encabezado {
    background-color: lightblue;
    font-weight: bold;
    border-radius: 10px 10px 0 0;
    height: 30px;
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
}

.pressed {
    box-shadow: inset 1px 1px 3px !important;
    text-shadow: none !important;
    padding-top: 1px;
    background-color: rgb(89, 112, 155) !important;
}

.btn {
    justify-self: center;
    border-radius: 5px;
    box-shadow: 1px 1px 3px gray;
    background-color: cornflowerblue;
    width: 30px;
    height: 30px;
    margin: 5px;
    text-shadow: 1px 1px 1px black;
}

.dialogTitle {
    font-size: 25px;
    text-align: center;
    font-weight: bold;
}

.btnContainer {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.btn:active {
    box-shadow: none;
}

.pagado {
    background-color: green;
}

.title {
    font-size: 20px;
    font-weight: bold;
    text-shadow: 1px 1px 1px white;
    text-align: center;
}

.cardList {
    border-right: none;
    max-width: 600px;
    max-height: calc(100vh - 227px);
    overflow: auto;
    margin: auto;
    border-radius: 20px;
    box-shadow: 2px 2px 10px #555;
    padding-top: 16px;
}

.carousel {
    height: calc(100vh - 50px);
    background: #cacaca;
}

.grdTitle {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    justify-items: center;
    padding-top: 4px;
    height: 64px;
}

.patViejaImg {
    width: 130px;
    border-radius: 5px;
}

.patVieja {
    position: relative;
    top: -56px;
    left: 0px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    font-size: 30px;
    text-align: center;
    font-weight: bold;
    text-shadow: 1px 1px 1px gray;
    color: #ffffff;
}

.patNuevaImg {
    width: 175px;
    border-radius: 5px;
}

.patNueva {
    position: relative;
    top: -53px;
    left: 0px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 10px;
    font-size: 31px;
    text-align: center;
    font-weight: bold;
    text-shadow: 1px 1px 1px gray;
    color: rgb(45, 45, 45);
}

.carIcon {
    font-size: 30px;
    text-shadow: 1px 1px 3px gray;
    color: rgb(106, 60, 191);
}

.notificaciones {
    position: absolute;
    bottom: 20px;
    right: 20px;
    margin: auto;
}

.btnMensajes {
    width: 100%;
}

.btnVehiculo {
    position: relative;
    width: 300px;
    margin: auto;
}

.contadorMensajes {
    background-color: red;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    box-shadow: 1px 1px 3px gray;
    color: white;
    font-size: 12px;
    position: absolute;
    padding-left: 6px;
    bottom: 27px;
    right: -7px;
}
</style>

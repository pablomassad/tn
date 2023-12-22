<template>
    <div>
        <div class="matrix">
            <div class="rowExpensa encabezado">
                <SortColumn class="texto" col="expName" label="Expensa" :sortMethod="appStore.actions.admin.sortExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="total" label="Total" :sortMethod="appStore.actions.admin.sortExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="paid" label="Pagado" :sortMethod="appStore.actions.admin.sortExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="balance" label="Saldo" :sortMethod="appStore.actions.admin.sortExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio lote" col="expamountOrdinaryName" label="Ordinarias" :sortMethod="appStore.actions.admin.sortExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio lote" col="amountExtraordinary" label="Extraordinarias" :sortMethod="appStore.actions.admin.sortExpenses" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio lote" col="amount" label="Total" :sortMethod="appStore.actions.admin.sortExpenses" :activeCol="appStore.state.activeCol" />
                <div class="celda central">Descargar</div>
                <div class="celda central">Editar</div>
                <div class="celda central">Detalle</div>
                <div class="celda central">Enviar</div>
                <SortColumn class="celda central" col="status" label="Estado" :sortMethod="appStore.actions.admin.sortExpenses" :activeCol="appStore.state.activeCol" />
            </div>
            <div v-for="(item) in appStore.state.expenses" :key="item">
                <div class="rowExpensa">
                    <div class="celda texto">{{ item.expName }}</div>
                    <div class="celda precio">{{ item.total.toFixed(1) }}</div>
                    <div class="celda precio">{{ item.paid.toFixed(1) }}</div>
                    <div class="celda precio">{{ item.balance.toFixed(1) }}</div>
                    <div class="celda precio loteInfo">{{ item.amountOrdinary.toFixed(1) }}</div>
                    <div class="celda precio loteInfo">{{ item.amountExtraordinary.toFixed(1) }}</div>
                    <div class="celda precio loteInfo">{{ item.amount.toFixed(1) }}</div>
                    <BtnIcon icon="file_download" @click="download(item)" />
                    <BtnIcon icon="edit" @click="gotoDetails(item)" />
                    <BtnIcon icon="groups" @click="gotoMonitor(item)" :disabled="!item.deployed" />
                    <BtnIcon icon="send" @click="distributeExpense(item)" :disabled="!!item.deployed" :pressed="!!item.deployed" />
                    <StatusLed class="celda centro" :status="item.status" />
                </div>
            </div>
            <q-btn glossy round color="primary" icon="add" @click="createExp" class="addBtn"></q-btn>
        </div>
        <ConfirmDialog :prompt="showConfirm" :message="confirmMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
        <ModalPanel :modalActive="showNewExp" @close="onCloseExp">
            <div class="modalFrame">
                <q-select :options="appStore.state.years" behavior="menu" label="Seleccione año" v-model="selYear" option-label="name" option-value="id" @update:model-value="onSelYear" class="combo" outlined></q-select>
                <q-select :options="appStore.state.months" behavior="menu" label="Seleccione mes" v-model="selMonth" option-label="name" option-value="id" @update:model-value="onSelMonth" class="combo" outlined></q-select>
            </div>
        </ModalPanel>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import appStore from 'src/pages/appStore'
import { ui } from 'fwk-q-ui'
import ModalPanel from 'src/components/ModalPanel.vue'
import { LocalStorage } from 'quasar'
import { useRouter } from 'vue-router'
import BtnIcon from 'src/components/BtnIcon.vue'
import StatusLed from 'src/components/StatusLed.vue'
import ConfirmDialog from 'fwk-q-confirmdialog'
import moment from 'moment'
import SortColumn from 'src/components/SortColumn.vue'

const router = useRouter()

console.log('Admin CONSTRUCTOR ################')

const selYear = ref(LocalStorage.getItem('TN_expYear'))
const selMonth = ref(LocalStorage.getItem('TN_expMonth'))
const showNewExp = ref(false)

const showConfirm = ref(false)
const confirmMessage = ref()
const onAcceptDialog = ref()
const onCancelDialog = ref()

onMounted(async () => {
    console.log('Administración OnMounted')
    ui.actions.setTitle('Administración')
    appStore.actions.admin.monitorExpenses()
})
onUnmounted(() => {
    appStore.actions.unsubscribeListeners('us_expenses')
})
const onSelYear = async (e) => {
    console.log(e.id)
    selYear.value = e
    LocalStorage.set('TN_expYear', e)
}
const onSelMonth = async (e) => {
    console.log(e.id)
    selMonth.value = e
    LocalStorage.set('TN_expMonth', e)
}
const onCloseExp = (e) => {
    showNewExp.value = false
    if (e) {
        appStore.actions.admin.createExpense(selYear.value.name, selMonth.value.id)
    }
}
const download = async (exp) => {
    appStore.set.selExpense(exp)
    appStore.actions.admin.downloadExpense()
}
const gotoDetails = (exp) => {
    appStore.set.selExpense(exp)
    router.push('/admin/details')
}
const gotoMonitor = (exp) => {
    appStore.set.selExpense(exp)
    router.push('/admin/monitor')
}
const createExp = () => {
    showNewExp.value = true
}
const distributeExpense = (exp) => {
    appStore.set.selExpense(exp)
    showConfirm.value = true
    confirmMessage.value = 'Esta seguro que quiere cerrar y distribuir esta expensa?'
    onAcceptDialog.value = async () => {
        const url = await appStore.actions.admin.generateExpense()
        await appStore.actions.admin.updateExpense({ pdfUrl: url, deployed: moment().format('DD/MM/YY') })
        showConfirm.value = false
    }
    onCancelDialog.value = () => {
        showConfirm.value = false
    }
}
</script>

<style scoped>
.combo {
    margin: 16px;
    z-index: 40000;
}

.matrix {
    position: relative;
    background-color: white;
    max-width: 1020px;
    margin: auto;
    margin-top: 50px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.encabezado {
    background-color: lightblue;
    font-weight: bold;
    border-radius: 10px 10px 0 0;
}

.celda {
    display: grid;
    align-items: center;
    padding: 0 10px;
    height: 40px;
}

.rowExpensa {
    display: grid;
    grid-template-columns: 130px 80px 90px 100px 90px 120px 90px 80px 60px 60px 60px 60px;
    align-items: center;
    width: 1020px;
    border-bottom: 1px solid gray;
}

.lote {
    background-color: aquamarine;
}

.loteInfo {
    background-color: rgb(223, 255, 244);
}

.status {
    justify-self: center;
}

.total {
    position: relative;
    background: lightyellow !important;
    font-weight: bold;
    height: 60px;
}

.addBtn {
    position: fixed;
    right: 10px;
    bottom: 10px;
}

.modalFrame {
    padding: 20px;
}
</style>

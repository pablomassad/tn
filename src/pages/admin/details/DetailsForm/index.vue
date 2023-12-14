<template>
    <div>
        <ConfirmDialog :prompt="showForm" noPersistant @onClose="onClose" class="formDialog" bg-color="white">
            <template #header>
                <div class="dialogTitle">
                    Detalle de expensa {{ appStore.actions.evalExpName(appStore.state.selExpense.id) }}
                </div>
            </template>
            <template #default>
                <div class="grdForm">
                    <div class="row3">
                        <q-input type="text" v-model="detail.concept" label="Concepto" />
                        <q-input type="number" v-model="detail.amount" label="Importe pagado" />
                        <q-input flat dense clearable v-model="detail.date" label="Fecha" @click="selectFecha()" />
                    </div>
                    <q-input type="text" v-model="detail.description" label="Descripción" />
                    <div class="row4">
                        <q-select :options="appStore.state.pendingTickets" behavior="menu" label="Ticket Asociado" v-model="detail.idTicket" option-label="concept" option-value="id" class="combo" outlined></q-select>
                        <q-select :options="appStore.state.payModes" behavior="menu" label="Forma de pago" v-model="detail.payMode" class="combo" outlined></q-select>
                        <q-toggle v-model="detail.isExtra" checked-icon="star" color="green" unchecked-icon="description" :label="detail.isExtra" false-value="Ordinaria" true-value="Extraordinaria" keep-color />
                        <q-toggle v-model="detail.isCont" checked-icon="account_balance" color="blue" unchecked-icon="attach_money" :label="detail.isCont" false-value="Terra" true-value="Contable" keep-color />
                    </div>
                    <!--<q-input v-model="detail.comment" filled type="textarea" label="Comentario" class="description" />-->
                </div>
            </template>
            <template #footer>
                <div class="btnContainer">
                    <q-btn glossy color="primary" icon="highlight_off" class="footerBtns" @click="onClose">Cancelar</q-btn>
                    <q-btn glossy color="red" icon="delete" class="footerBtns" @click="remove">Eliminar</q-btn>
                    <q-btn glossy color="primary" icon="check" class="footerBtns" @click="save">Aceptar</q-btn>
                </div>
            </template>
        </ConfirmDialog>
        <ModalPanel :modalActive="showFecha" @close="onFechaOKClick">
            <div>
                <q-date v-model="dtPicker.selectedDate" mask="DD-MM-YYYY" title="Fecha" text-color="white" :locale="appStore.state.myLocale" />
            </div>
        </ModalPanel>
        <ConfirmDialog :prompt="showConfirm" :message="confirmMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import appStore from 'src/pages/appStore'
import moment from 'moment'
import ConfirmDialog from 'fwk-q-confirmdialog'
import ModalPanel from 'src/components/ModalPanel.vue'

const showForm = ref(false)
const showConfirm = ref(false)
const confirmMessage = ref()
const onAcceptDialog = ref()
const onCancelDialog = ref()

const showFecha = ref(false)
const dtPicker = reactive({
    selectedDate: '',
    datePickerTitle: ''
})

const emptyDetail = {
    date: moment().format('DD-MM-YYYY'),
    idExp: appStore.state.selExpense.id,
    concept: '',
    description: '',
    amount: 0,
    payMode: 'Efectivo'
}
const detail = reactive(Object.assign({}, emptyDetail))

onMounted(async () => {
    console.log('DetailsForm onMounted')
    appStore.actions.admin.getPendingTickets()
})
const save = async () => {
    showConfirm.value = true
    confirmMessage.value = 'Esta seguro que quiere grabar este item?'
    onAcceptDialog.value = async () => {
        detail.amount = Number(detail.amount)
        await appStore.actions.admin.saveDetail(detail)
        showConfirm.value = false
        onClose()
    }
    onCancelDialog.value = () => {
        showConfirm.value = false
    }
}
const remove = () => {
    showConfirm.value = true
    confirmMessage.value = 'Esta seguro que quiere eliminar el item?'
    onAcceptDialog.value = async () => {
        await appStore.actions.admin.removeDetail(detail)
        showConfirm.value = false
        onClose()
    }
    onCancelDialog.value = () => {
        showConfirm.value = false
    }
}
const onClose = () => {
    showForm.value = false
}
const selectFecha = () => {
    dtPicker.selectedDate = detail.date
    showFecha.value = true
}
const onFechaOKClick = () => {
    showFecha.value = false
    detail.date = dtPicker.selectedDate
        ? dtPicker.selectedDate
        : detail.date
}
const show = async (det) => {
    showForm.value = true
    const o = det || emptyDetail
    Object.assign(detail, o)
}

defineExpose({ show })
</script>

<style scoped>
.row3 {
    display: grid;
    grid-template-columns: 1fr 1fr 200px;
    column-gap: 10px;
}

.row4 {
    display: grid;
    grid-template-columns: 1fr 1fr 150px 120px;
    column-gap: 10px;
}

.grdForm {
    display: grid;
    row-gap: 10px;
    margin: 20px;
    padding: 26px;
    border-radius: 10px;
    box-shadow: inset 1px 1px 3px gray;
    background: #eee;
}

.btnContainer {
    display: flex;
    width: 100%;
    justify-content: space-between;
}

.dialogTitle {
    font-size: 25px;
    text-align: center;
    font-weight: bold;
}
</style>

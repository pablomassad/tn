<template>
    <div>
        <ConfirmDialog :prompt="showForm" noPersistant @onClose="onClose" bg-color="white">
            <template #header>
                <div class="dialogTitle">
                    Expensa {{ exp.expName }}
                </div>
            </template>
            <template #default>
                <div class="grdForm">
                    <q-input flat dense clearable v-model="comp.date" label="Fecha de comprobante" @click="selectFecha()" />
                    <div class="rowAmAt">
                        <q-input type="number" v-model="comp.amount" label="Importe pagado" />
                        <q-input type="number" v-model="comp.payRef" label="Nro.comprobante de pago" />
                        <q-btn v-if="!attFile && !comp.attachmentUrl" glossy color="primary" icon="attachment" @click="attachComp">Adjuntar comprobante</q-btn>
                        <q-btn v-if="attFile || comp.attachmentUrl" glossy color="primary" icon="visibility" @click="viewComp">Ver comprobante</q-btn>
                    </div>
                    <q-input v-model="comp.description" filled type="textarea" label="Descripción" class="description" />
                    <q-checkbox v-if="appStore.state.master" v-model="comp.checked" keep-color :color="(comp.checked ? 'green' : 'red')" />
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
        <input type="file" ref="refAttachment" @change="onUploadAttachment" style="display:none" />
        <ConfirmDialog :prompt="showConfirm" :message="confirmMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import appStore from 'src/pages/appStore'
import ModalPanel from 'src/components/ModalPanel.vue'
import moment from 'moment'
import ConfirmDialog from 'fwk-q-confirmdialog'

const refAttachment = ref()
const showForm = ref(false)
const showConfirm = ref(false)
const confirmMessage = ref()
const onAcceptDialog = ref()
const onCancelDialog = ref()

const exp = ref({})
const attFile = ref()
const showFecha = ref(false)
const dtPicker = reactive({
    selectedDate: '',
    datePickerTitle: ''
})
const emptyComp = {
    date: moment().format('DD-MM-YYYY'),
    amount: 0,
    attachmentUrl: '',
    description: '',
    payRef: '',
    checked: false
}
const comp = reactive(Object.assign({}, emptyComp))

onMounted(async () => {
    console.log('ReceiptForm onMounted')
})
const save = async () => {
    showConfirm.value = true
    confirmMessage.value = 'Esta seguro que quiere grabar este comprobante?'
    onAcceptDialog.value = async () => {
        await appStore.actions.userExpenses.saveComp(exp.value.id, comp, attFile.value)
        showConfirm.value = false
        onClose()
    }
    onCancelDialog.value = () => {
        showConfirm.value = false
    }
}
const remove = () => {
    showConfirm.value = true
    confirmMessage.value = 'Esta seguro que quiere eliminar el comprobante?'
    onAcceptDialog.value = async () => {
        await appStore.actions.userExpenses.removeComp(exp.value.id, comp)
        showConfirm.value = false
        onClose()
    }
    onCancelDialog.value = () => {
        showConfirm.value = false
    }
}
const viewComp = async () => {
    console.log('view comprobante:', comp.attachmentUrl)
}
const selectFecha = () => {
    dtPicker.selectedDate = comp.date
    showFecha.value = true
}
const onFechaOKClick = () => {
    showFecha.value = false
    comp.date = dtPicker.selectedDate
        ? dtPicker.selectedDate
        : comp.date
}
const attachComp = () => {
    refAttachment.value.click()
}
const onUploadAttachment = async (e) => {
    attFile.value = e.target.files[0]
    refAttachment.value.value = ''
}
const onClose = () => {
    showForm.value = false
}
const show = async (expense, cp) => {
    exp.value = expense
    showForm.value = true
    const o = cp || emptyComp
    Object.assign(comp, o)
    attFile.value = undefined
}
defineExpose({ show })
</script>

<style scoped>
.grdForm {
    display: grid;
    row-gap: 10px;
}

.rowAmAt {
    display: flex;
    justify-content: space-between;
}

.footerBtns {
    margin: 20px;
}

.btnContainer {
    display: flex;
    width: 100%;
    justify-content: space-between;
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

.dialogTitle {
    font-size: 25px;
    text-align: center;
    font-weight: bold;
}
</style>

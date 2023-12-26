<template>
    <div>
        <ConfirmDialog :prompt="showForm" noPersistant @onClose="onClose" bg-color="white">
            <template #header>
                <div class="dialogTitle">
                    Expensa {{ expName }}
                </div>
            </template>
            <template #default>
                <div class="grdForm">
                    <div class="rowDtCom">
                        <q-input flat dense clearable :model-value="selDate" label="Fecha de comprobante" @click="selectFecha()" readonly />
                        <q-input type="text" v-model="comp.description" filled label="Descripción" class="description" />
                    </div>
                    <div class="rowAmAt">
                        <q-input type="number" v-model="comp.amount" label="Importe pagado" />
                        <q-input type="number" v-model="comp.payRef" label="Nro.comprobante de pago" />
                        <q-btn v-if="!attFile && !comp.attachmentUrl" glossy color="primary" icon="attachment" @click="attachComp">Adjuntar comprobante</q-btn>
                        <q-btn v-if="attFile || comp.attachmentUrl" glossy color="primary" icon="visibility" @click="viewComp">Ver comprobante</q-btn>
                    </div>
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
        <DatePicker ref="refDate" @close="onSelFecha" mask="DD/MM/YY" />
        <ViewAttachment ref="refViewAtt" @onAttach="onAttachment" />
        <input type="file" ref="refAttachment" @change="onUploadAttachment" style="display:none" />
        <ConfirmDialog :prompt="showConfirm" :message="confirmMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import appStore from 'src/pages/appStore'
import ConfirmDialog from 'fwk-q-confirmdialog'
import { ui } from 'fwk-q-ui'
import DatePicker from 'src/components/DatePicker.vue'
import ViewAttachment from 'src/components/ViewAttachment.vue'
import moment from 'moment'

const refViewAtt = ref()
const refAttachment = ref()

const refDate = ref()
const showForm = ref(false)
const showConfirm = ref(false)
const confirmMessage = ref()
const onAcceptDialog = ref()
const onCancelDialog = ref()

const expName = ref()
const attFile = ref()
const selDate = ref()

const emptyComp = {
    date: moment().format('DD-MM-YY'),
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
onUnmounted(() => {
    console.log('ReceiptForm onUnmounted')
})
const save = async () => {
    if (comp.attachmentUrl || attFile.value) {
        showConfirm.value = true
        confirmMessage.value = 'Esta seguro que quiere grabar este comprobante?'
        onAcceptDialog.value = async () => {
            await appStore.actions.userExpenses.saveComp(comp, attFile.value)
            showConfirm.value = false
            onClose()
        }
        onCancelDialog.value = () => {
            showConfirm.value = false
        }
    } else {
        ui.actions.notify('Debe adjuntar un comprobante!', 'info')
    }
}
const remove = () => {
    showConfirm.value = true
    confirmMessage.value = 'Esta seguro que quiere eliminar el comprobante?'
    onAcceptDialog.value = async () => {
        await appStore.actions.userExpenses.removeComp(comp)
        showConfirm.value = false
        onClose()
    }
    onCancelDialog.value = () => {
        showConfirm.value = false
    }
}
const selectFecha = () => {
    refDate.value.show(comp.date)
}
const onSelFecha = (dt) => {
    comp.date = dt || comp.date
    selDate.value = moment(dt).format(appStore.state.dateMask)
}
const onAttachment = (o) => {
    console.log('attach from viewAttachment:', o)
    attFile.value = o
}
const viewComp = async () => {
    const att = (attFile.value) ? attFile.value : comp.attachmentUrl
    refViewAtt.value.show(att)
    // window.open(comp.attachmentUrl, 'blank')
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
const show = async (cp) => {
    expName.value = appStore.state.selUserExpense.expName
    showForm.value = true
    const o = cp || emptyComp
    Object.assign(comp, o)
    attFile.value = undefined
    selDate.value = moment(cp.date).format(appStore.state.dateMask)
}
defineExpose({ show })
</script>

<style scoped>
.grdForm {
    display: grid;
    row-gap: 10px;
    margin: 20px;
    padding: 26px;
    border-radius: 10px;
    box-shadow: inset 1px 1px 3px gray;
    background: #eee;
}

.rowDtCom {
    display: grid;
    align-items: baseline;
    column-gap: 20px;
    grid-template-columns: 150px 1fr;
}

.rowAmAt {
    display: flex;
    justify-content: space-between;
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

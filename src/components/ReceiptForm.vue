<template>
    <div>
        <ConfirmDialog :prompt="showForm" noPersistant @onClose="onClose" bg-color="white">
            <template #header>
                <div class="grdHeader">
                    <div class="dialogTitle">
                        {{ comp.id ? 'Edición de ' : 'Nuevo ' }}Comprobante
                    </div>
                    <div></div>
                    <q-icon name="close" @click="onClose" size="md" style="justify-self: right;"></q-icon>
                </div>
            </template>
            <template #default>
                <div class="grdFrame">
                    <div class="grdForm">
                        <q-input flat dense clearable :model-value="selDate" label="Fecha de comprobante" @click="selectFecha()" readonly />
                        <q-input type="text" v-model="comp.description" label="Descripción" class="description" />
                        <q-input type="number" v-model="comp.amount" label="Importe pagado" />
                        <q-input type="number" v-model="comp.payRef" label="Nro.comprobante de pago" />
                    </div>
                    <Attachment :src="comp.attachmentUrl" emptyLabel="Adjunte el comprobante" @onAttach="onAttach" @onDelete="onDelete" h="200px" w="200px" />
                </div>
            </template>
            <template #footer>
                <q-btn glossy color="primary" class="footerBtns" @click="save">Guardar</q-btn>
            </template>
        </ConfirmDialog>
        <DatePicker ref="refDate" @close="onSelFecha" :mask="appStore.state.dateMask" />
        <ConfirmDialog :prompt="showConfirm" :message="confirmMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { ui } from 'fwk-q-ui'
import appStore from 'src/pages/appStore'
import DatePicker from 'fwk-q-datepicker'
import ConfirmDialog from 'fwk-q-confirmdialog'
import Attachment from 'src/components/Attachment.vue'
import moment from 'moment'

let deleteFlag = false

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
    date: new Date().getTime(),
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
            await appStore.actions.userExpenses.saveComp(comp, attFile.value, deleteFlag)
            deleteFlag = false
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
const onAttach = (o) => {
    console.log('attach from Attachment:', o)
    attFile.value = o
}
const onDelete = (url) => {
    console.log('delete from Attachment:', url)
    attFile.value = undefined
    deleteFlag = true
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
    selDate.value = moment(o.date).format(appStore.state.dateMask)
}
defineExpose({ show })
</script>

<style scoped>
.grdFrame {
    display: grid;
    grid-template-columns: 2fr 1fr;
    row-gap: 10px;
    column-gap: 20px;
    margin: 0 20px;
    padding: 20px;
    border-radius: 10px;
    box-shadow: inset 1px 1px 3px gray;
    background: #eee;
}

.grdForm {
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    row-gap: 10px;
    column-gap: 20px;
}

.grdHeader {
    display: grid;
    grid-template-columns: 240px 1fr 200px;
    align-items: center;
    margin: 0 20px;
}

.footerBtns {
    right: 25px;
    margin-bottom: 10px;
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
    text-align: left;
    font-weight: bold;
}
</style>

<template>
    <div>
        <ConfirmDialog :prompt="showForm" noPersistant @onClose="onClose" class="formDialog" bg-color="white">
            <template #header>
                <div class="dialogTitle">
                    Detalle de expensa {{ appStore.actions.expenses.evalExpName(appStore.state.selExpense.id) }}
                </div>
            </template>
            <template #default>
                <div class="grdForm">
                    <q-input type="text" v-model="detail.concept" label="Concepto" />
                    <q-input type="text" v-model="detail.description" label="Descripción" />
                    <q-input type="number" v-model="detail.amount" label="Importe pagado" />
                    <q-select :options="appStore.state.payModes" behavior="menu" label="Forma de pago" v-model="detail.payMode" class="combo" outlined></q-select>
                    <!--<q-input v-model="detail.comment" filled type="textarea" label="Comentario" class="description" />-->
                </div>
            </template>
            <template #footer>
                <div class="btnContainer">
                    <q-btn glossy color="primary" icon="highlight_off" class="footerBtns" @click="onClose">Cancelar</q-btn>
                    <q-btn glossy color="primary" icon="delete" class="footerBtns" @click="remove">Eliminar</q-btn>
                    <q-btn glossy color="primary" icon="check" class="footerBtns" @click="save">Aceptar</q-btn>
                </div>
            </template>
        </ConfirmDialog>
        <ConfirmDialog :prompt="showConfirm" :message="confirmMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import appStore from 'src/pages/appStore'
import moment from 'moment'
import ConfirmDialog from 'fwk-q-confirmdialog'

const showForm = ref(false)
const showConfirm = ref(false)
const confirmMessage = ref()
const onAcceptDialog = ref()
const onCancelDialog = ref()

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
    console.log('ExpForm onMounted')
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
const show = async (det) => {
    showForm.value = true
    const o = det || emptyDetail
    Object.assign(detail, o)
}
defineExpose({ show })
</script>

<style scoped>
.grdForm {
    display: grid;
    row-gap: 10px;
}

.footerBtns {
    margin: 20px;
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

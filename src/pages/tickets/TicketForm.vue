<template>
    <div>
        <ConfirmDialog :prompt="showForm" @onClose="onClose" class="≈" bg-color="white">
            <template #header>
                <div class="grdHeader">
                    <div class="dialogTitle">
                        {{ tk.id ? 'Edición de ' : 'Nuevo ' }}Ticket
                    </div>
                    <q-btn-toggle v-model="tk.refType" push rounded text-color="grey" toggle-color="blue-5" :options="[
                        {value: 'TERRANOSTRA', slot: 'one'},
                        {value: 'PROPIETARIO', slot: 'two'}
                    ]" size="md" class="switch">
                        <template v-slot:one>
                            <div class="row items-center no-wrap">
                                <div class="switchText">
                                    TERRANOSTRA
                                </div>
                                <!--<q-icon right name="home" />-->
                            </div>
                        </template>
                        <template v-slot:two>
                            <div class="row items-center no-wrap">
                                <div class="switchText">
                                    PROPIETARIO
                                </div>
                                <!--<q-icon right name="person" />-->
                            </div>
                        </template>
                    </q-btn-toggle>
                    <q-icon name="close" @click="onClose" size="md" style="justify-self: right;"></q-icon>
                </div>
            </template>
            <template #default>
                <div class="grdFrame">
                    <div class="grdForm">
                        <q-input type="text" v-model="tk.concept" label="Ingrese concepto" />
                        <q-select v-if="tk.refType === 'PROPIETARIO' && appStore.state.units" filled bg-color="white" :options="owners" behavior="menu" label="Seleccione referente propietario" autocomplete use-input input-debounce="0" @filter="filterFn" v-model="localUnit" option-label="ownerNames" option-value="id" class="tnOwners"></q-select>
                        <div v-if="tk.refType === 'TERRANOSTRA'" class="subject">TerraNostra S.A.</div>
                        <div v-if="!appStore.state.selUnit.role" class="subject">{{ tk.referrer }}</div>
                        <q-input type="number" v-model="tk.amount" label="Importe a pagar" />
                        <q-select :options="appStore.state.payModes" behavior="menu" label="Forma de pago" v-model="tk.payMode" class="combo" outlined></q-select>
                        <q-checkbox v-model="tk.swOrdExtra" label="Extraordinaria" color="blue-5"></q-checkbox>
                        <!--<q-toggle v-model="tk.swOrdExtra" checked-icon="star" color="green" unchecked-icon="description" :label="tk.swOrdExtra" false-value="Ordinaria" true-value="Extraordinaria" size="lg" />-->
                        <q-checkbox v-model="tk.swContTerra" label="Contable" color="blue-5"></q-checkbox>
                        <!--<q-toggle v-model="tk.swContTerra" checked-icon="account_balance" color="blue" unchecked-icon="attach_money" :label="tk.swContTerra" false-value="Terra" true-value="Contable" size="lg" />-->
                    </div>
                    <Attachment :src="tk.attachmentUrl" emptyLabel="Adjunte el comprobante" @onAttach="onAttach" @onDelete="onDelete" />
                </div>
                <!--<TicketReceipts v-if="appStore.state.selTicket" />-->
                <DatePicker ref="refDate" @close="onSelFecha" :mask="appStore.state.dateMask" />
            </template>
            <template #footer>
                <q-btn glossy color="primary" class="footerBtns" @click="save">Guardar</q-btn>
            </template>
        </ConfirmDialog>
        <ConfirmDialog :prompt="showConfirm" :message="confirmMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import appStore from 'src/pages/appStore'
import DatePicker from 'fwk-q-datepicker'
import moment from 'moment'
import ConfirmDialog from 'fwk-q-confirmdialog'
import TicketReceipts from './TicketReceipts.vue'
import Attachment from 'src/components/Attachment.vue'
import { ui } from 'fwk-q-ui'

const showForm = ref(false)
const showConfirm = ref(false)
const confirmMessage = ref()
const onAcceptDialog = ref()
const onCancelDialog = ref()

const localUnit = ref()
const owners = ref()
const exp = ref({})
const attFile = ref()
const tk = reactive({
    date: new Date().getTime(),
    amount: 0,
    attachmentUrl: '',
    paid: 0,
    balance: 0,
    payMode: 'Pendiente',
    swContTerra: 'Contable',
    swOrdExtra: 'Ordinaria'
})
const refDate = ref()
const selDate = ref()
let deleteFlag = false

const emptyTicket = {
    date: new Date().getTime(),
    amount: 0,
    concept: '',
    paid: 0,
    balance: 0,
    attachmentUrl: '',
    refType: 'TERRANOSTRA',
    payType: 'CREDIT',
    payMode: 'Pendiente',
    referrer: appStore.state.selUnit.ownerNames,
    swContTerra: 'Contable',
    swOrdExtra: 'Ordinaria'
}

onMounted(async () => {
    console.log('TICKET selected onMounted')
    if (!appStore.state.units) { await appStore.actions.getUnits() }
})
onUnmounted(() => {
    console.log('TICKET selected onUnmounted')
})
const filterFn = (val, update) => {
    if (val === '') {
        update(() => {
            owners.value = appStore.state.units
        })
        return
    }
    update(() => {
        const needle = val.toLowerCase()
        owners.value = appStore.state.units.filter(item => item.ownerNames.toLowerCase().indexOf(needle) > -1)
    })
}
const save = async () => {
    console.log('save ticket')
    showConfirm.value = true
    confirmMessage.value = 'Esta seguro que quiere grabar este ticket?'
    onAcceptDialog.value = async () => {
        if (!tk.amount) ui.actions.notify('El importe es obligatorio', 'error')
        if (!tk.concept) ui.actions.notify('El concepto es obligatorio', 'error')
        if (!tk.date) ui.actions.notify('La fecha es obligatoria', 'error')
        if (tk.refType === 'PROPIETARIO') {
            if (!localUnit.value) {
                ui.actions.notify('Debe seleccionar un propietario o cambiar de tipo', 'error')
            } else {
                tk.referrer = localUnit.value.ownerNames
            }
        } else {
            tk.referrer = 'TerraNostra'
        }
        await appStore.actions.tickets.save(tk, attFile.value, deleteFlag)
        deleteFlag = false
        showConfirm.value = false
        onClose()
    }
    onCancelDialog.value = () => {
        showConfirm.value = false
    }
}
const remove = () => {
    showConfirm.value = true
    confirmMessage.value = 'Esta seguro que quiere eliminar el ticket?'
    onAcceptDialog.value = async () => {
        await appStore.actions.tickets.remove(tk)
        exp.value.comps = await appStore.actions.getCompsByExp(exp.value.id)
        showConfirm.value = false
        onClose()
    }
    onCancelDialog.value = () => {
        showConfirm.value = false
    }
}
const selectFecha = () => {
    refDate.value.show(tk.date)
}
const onSelFecha = (dt) => {
    tk.date = dt || tk.date
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
    attFile.value = undefined
}
const show = async (t) => {
    tk.id = undefined
    const o = t || emptyTicket // { ...t, ...emptyTicket }
    Object.assign(tk, o)
    if (o.refType === 'PROPIETARIO') {
        localUnit.value = appStore.state.units.find(x => x.ownerNames === o.referrer)
    }
    selDate.value = moment(o.date).format(appStore.state.dateMask)
    showForm.value = true
    console.log('ticket param:', tk)
}
defineExpose({ show })
</script>

<style scoped>
.grdHeader {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    align-items: center;
    margin: 0 20px;
}

.dialogTitle {
    font-size: 20px;
    text-align: left;
    font-weight: bold;
}

.switch {
    justify-self: center;
    align-self: center;
}

.switchText {
    text-align: center;
    font-weight: bold;
}

.footerBtns {
    right: 25px;
    margin-bottom: 10px;
}

.subject {
    padding-left: 10px;
    font-size: 20px;
}

.grdPayOps {
    display: grid;
    margin-top: 20px;
}

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

.grdFrame {
    display: grid;
    grid-template-columns: 3fr 1fr;
    row-gap: 10px;
    column-gap: 20px;
    margin: 0 20px;
    padding: 26px;
    border-radius: 10px;
    box-shadow: inset 1px 1px 3px gray;
    background: #eee;
}

.grdForm {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    row-gap: 10px;
    column-gap: 20px;
}

.rowConDtPay {
    display: grid;
    margin: 5px 0;
    grid-template-columns: 290px 1fr 100px;
    align-items: end;
    column-gap: 30px;
}

.row3 {
    display: grid;
    margin: 5px 0;
    align-items: end;
    justify-items: center;
    grid-template-columns: 1fr 1fr;
    column-gap: 20px;
}

.row4 {
    display: grid;
    margin: 5px 0;
    align-items: end;
    grid-template-columns: 300px 90px 1fr 150px;
    column-gap: 20px;
}

.tnOwnersx {
    width: 400px;
}

.matrix {
    background-color: white;
    max-width: 720px;
    margin: auto;
    margin-top: 50px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.label {
    font-weight: bold;
    font-size: 20px;
}

.value {
    font-size: 18px;
    color: #555;
}

.btnContainer {
    display: flex;
    width: 100%;
    justify-content: space-between;
}

.rowExpensa {
    display: grid;
    grid-template-columns: 100px 80px 70px 70px 90px 90px 100px;
    align-items: center;
    width: 720px;
    column-gap: 20px;
    padding: 5px 15px;
    border-bottom: 1px solid gray;
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

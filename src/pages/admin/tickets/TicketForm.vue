<template>
    <div>
        <ConfirmDialog :prompt="showForm" @onClose="onClose" bg-color="white">
            <template #header>
                <div class="grdHeader">
                    <div class="dialogTitle">
                        {{ tk.id ? 'Edición de ' : 'Nuevo ' }}Ticket
                    </div>
                    <div class="switch">
                        <q-btn-toggle v-if="isAdmin" v-model="tk.refType" push rounded text-color="grey" toggle-color="blue-5" :options="[
                            {value: 'TERRANOSTRA', slot: 'one'},
                            {value: 'PROPIETARIO', slot: 'two'}
                        ]" size="md">
                            <template v-slot:one>
                                <div class="row items-center no-wrap">
                                    <div class="switchText">
                                        TERRANOSTRA
                                    </div>
                                </div>
                            </template>
                            <template v-slot:two>
                                <div class="row items-center no-wrap">
                                    <div class="switchText">
                                        PROPIETARIO
                                    </div>
                                </div>
                            </template>
                        </q-btn-toggle>
                        <div v-else></div>
                    </div>
                    <q-icon name="close" @click="onClose" size="md" style="justify-self: right;"></q-icon>
                </div>
            </template>
            <template #default>
                <div class="grdFrame">
                    <div class="grdForm">
                        <q-input type="text" v-model="tk.concept" label="Ingrese concepto" />
                        <div v-if="isAdmin">
                            <q-select v-if="tk.refType === 'PROPIETARIO' && appStore.state.units" filled bg-color="white" :options="owners" behavior="menu" label="Seleccione referente propietario" autocomplete use-input input-debounce="0" @filter="filterFn" v-model="localUnit" option-label="ownerNames" option-value="id" class="tnOwners"></q-select>
                            <q-input v-if="tk.refType === 'TERRANOSTRA'" type="text" v-model="tk.referrer" label="Referente" />
                        </div>
                        <q-input v-else type="text" v-model="tk.referrer" label="Referente" :disable="!isAdmin" />
                        <q-input type="number" v-model="tk.amount" label="Importe a pagar" />
                        <div>
                            <q-select v-if="isAdmin" :options="appStore.state.payModes" behavior="menu" label="Forma de pago" v-model="tk.payMode" class="combo" outlined></q-select>
                            <q-input v-else type="text" v-model="tk.payMode" label="Forma de pago" disable />
                        </div>
                        <div class="flexChecks">
                            <q-checkbox v-model="tk.isExtra" label="Extraordinaria" color="blue-5" :disable="!isAdmin"></q-checkbox>
                            <q-checkbox v-model="tk.isCont" label="Contable" color="blue-5" :disable="!isAdmin"></q-checkbox>
                        </div>
                    </div>
                    <div class="grdAtt">
                        <Attachment :src="tk.attachmentUrl" emptyLabel="Adjunte el factura" @onAttach="onAttach" @onDelete="onDelete" h="200px" w="200px" />
                        <Attachment :src="tk.attachmentUrl" emptyLabel="Adjunte el comprobante" @onAttach="onAttach" @onDelete="onDelete" h="200px" w="200px" />
                    </div>
                </div>
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
import ConfirmDialog from 'fwk-q-confirmdialog'
import Attachment from 'src/components/Attachment.vue'
import { ui } from 'fwk-q-ui'

const isAdmin = ref(!!appStore.state.selUnit.role)
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
    isCont: true,
    isExtra: false
})
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
    isCont: true,
    isExtra: false
}

onMounted(async () => {
    console.log('TICKET selected onMounted isAdmin:', isAdmin.value)
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
        if (tk.payMode !== 'Pendiente') {
            tk.paid = tk.amount
        } else {
            tk.paid = 0
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

.flexChecks {
    display: flex;
    justify-content: space-between;
}

.grdAtt {
    display: grid;
    grid-template-rows: 1fr 1fr;
    column-gap: 20px;
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
    font-size: 18px;
}

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
    row-gap: 50px;
    column-gap: 20px;
}

.label {
    font-weight: bold;
    font-size: 20px;
}

.value {
    font-size: 18px;
    color: #555;
}
</style>

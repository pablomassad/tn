<template>
    <div>
        <ConfirmDialog :prompt="showForm" noPersistant @onClose="onClose" class="formDialog" bg-color="white">
            <template #header>
                <div class="dialogTitle">
                    {{ tk.id ? 'Edición de ' : 'Nuevo ' }}Ticket
                </div>
            </template>
            <template #default>
                <div class="grdForm">
                    <q-input type="text" v-model="tk.concept" label="Ingrese concepto" />
                    <div class="rowDtAmAt">
                        <q-input flat dense clearable v-model="tk.date" label="Fecha del Ticket" @click="selectFecha()" />
                        <q-input type="number" v-model="tk.amount" label="Importe pagado" />
                        <q-btn v-if="!attFile && !tk.attachmentUrl" glossy color="primary" icon="attachment" @click="attachTicket">Adjuntar ticket</q-btn>
                        <q-btn v-if="attFile || tk.attachmentUrl" glossy color="primary" icon="visibility" @click="viewTicket">Ver ticket</q-btn>
                    </div>
                    <!--<q-input v-model="tk.comment" filled type="textarea" label="Comentario" class="comment" />-->
                    <q-checkbox v-if="appStore.state.master" v-model="tk.checked" keep-color :color="(tk.checked ? 'green' : 'red')" />
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
        <ModalPanel :modalActive="showFecha" @close="onFechaOKClick">
            <div>
                <q-date v-model="dtPicker.selectedDate" mask="DD-MM-YYYY" title="Fecha" text-color="white" :locale="appStore.state.myLocale" />
            </div>
        </ModalPanel>
        <input type="file" ref="refAttachment" @change="onUploadAttachment" style="display:none" />
        <ConfirmDialog :prompt="showConfirm" :message="confirmMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
        <div class="viewFrame" v-if="showTicket">
            <q-icon name="close" class="btnClose" @click="onCloseTicket" />
            <img :src="evalImage()" class="ticketImage" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import appStore from 'src/pages/appStore'
import ModalPanel from 'src/components/ModalPanel.vue'
import moment from 'moment'
import ConfirmDialog from 'fwk-q-confirmdialog'
import { ui } from 'fwk-q-ui'

const refAttachment = ref()
const showForm = ref(false)
const showConfirm = ref(false)
const confirmMessage = ref()
const onAcceptDialog = ref()
const onCancelDialog = ref()

const exp = ref({})
const attFile = ref()
const showTicket = ref(false)
const tk = reactive({
    date: moment().format('DD-MM-YYYY'),
    amount: 0,
    attachmentUrl: '',
    comment: '',
    checked: false
})
const showFecha = ref(false)
const dtPicker = reactive({
    selectedDate: '',
    datePickerTitle: ''
})

onMounted(async () => {
    console.log('TICKET onMounted')
})
const save = async () => {
    showConfirm.value = true
    confirmMessage.value = 'Esta seguro que quiere grabar este ticket?'
    onAcceptDialog.value = async () => {
        if (!tk.comment) tk.comment = ''
        if (!tk.amount) ui.actions.notify('El importe es obligatorio', 'error')
        if (!tk.concept) ui.actions.notify('El concepto es obligatorio', 'error')
        if (!tk.date) ui.actions.notify('La fecha es obligatoria', 'error')
        await appStore.actions.tickets.save(tk, attFile.value)
        // exp.value.comps = await appStore.actions.getCompsByExp(exp.value.id)
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
    dtPicker.selectedDate = tk.date
    showFecha.value = true
}
const onFechaOKClick = () => {
    showFecha.value = false
    tk.date = dtPicker.selectedDate
        ? dtPicker.selectedDate
        : tk.date
}
const evalImage = () => {
    let imgSrc
    if (attFile.value) { imgSrc = URL.createObjectURL(attFile.value) }
    if (tk.attachmentUrl) { imgSrc = tk.attachmentUrl }
    return imgSrc
}
const viewTicket = async () => {
    console.log('attFile.value:', attFile.value)
    console.log('attachmentUrl:', tk.attachmentUrl)
    showTicket.value = true
}
const onCloseTicket = () => {
    showTicket.value = false
}
const attachTicket = () => {
    refAttachment.value.click()
}
const onUploadAttachment = async (e) => {
    attFile.value = e.target.files[0]
    refAttachment.value.value = ''
}
const onClose = () => {
    showForm.value = false
}
const show = async (t) => {
    showForm.value = true
    if (t) {
        tk.id = t.id
        tk.date = t.date
        tk.concept = t.concept
        tk.amount = t.amount
        tk.attachmentUrl = t.attachmentUrl
        tk.checked = t.checked
    }
}
defineExpose({ show })
</script>

<style scoped>
.viewFrame {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 11000;
    background-color: lightcyan;
}

.btnClose {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 40px;
}

.ticketImage {
    height: 100%;
    object-fit: cover;
    display: grid;
    margin: auto;
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

.grdForm {
    display: grid;
    row-gap: 10px;
}

.rowDtAmAt {
    display: flex;
    justify-content: space-between;
    align-items: center;
    ;
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

.footerBtns {
    margin: 20px;
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

.encabezado {
    background-color: lightblue;
    font-weight: bold;
    border-radius: 10px 10px 0 0;
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

.dialogTitle {
    font-size: 25px;
    text-align: center;
    font-weight: bold;
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

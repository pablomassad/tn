<template>
    <div>
        <ConfirmDialog :prompt="showForm" noPersistant @onClose="onClose" class="formDialog" bg-color="white">
            <template #header>
                <div class="dialogTitle">
                    Expensa Octubre 2023
                </div>
            </template>
            <template #default>
                <q-input flat dense clearable v-model="fechaComprobante" label="Fecha de comprobante" @click="selectFecha()" />
                <q-input type="number" v-model="importe" label="Importe pagado" />
            </template>
            <template #footer>
                <div class="btnContainer">
                    <q-btn glossy color="primary" icon="attachment" class="footerBtns" @click="attachDoc">Adjuntar comprobante</q-btn>
                    <q-btn glossy color="primary" icon="check" class="footerBtns" @click="accept">Aceptar</q-btn>
                </div>
            </template>
        </ConfirmDialog>
        <ModalPanel :modalActive="showFecha" @close="onFechaOKClick">
            <div>
                <q-date v-model="data.selectedDate" mask="DD-MM-YYYY" title="Fecha" text-color="white" :locale="data.myLocale" />
            </div>
        </ModalPanel>
        <input type="file" ref="refAttachment" @change="onUploadAttachment" style="display:none" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, defineComponent, reactive, withModifiers } from 'vue'
import appStore from 'src/pages/appStore'
import ModalPanel from './ModalPanel.vue'
import moment from 'moment'
import ConfirmDialog from 'fwk-q-confirmdialog'

const refAttachment = ref()
const showForm = ref(false)
const fechaComprobante = ref(moment().format('DD-MM-YYYY'))
const showFecha = ref(false)
const data = reactive({
    selectedDate: '',
    datePickerTitle: '',
    myLocale: {
        days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split(
            '_'
        ),
        daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split(
            '_'
        ),
        monthsShort:
            'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split(
                '_'
            ),
        firstDayOfWeek: 1
    }
})

onMounted(async () => {

})
const accept = () => {
    showForm.value = false
}
const selectFecha = () => {
    data.selectedDate = fechaComprobante.value
    showFecha.value = true
}
const onFechaOKClick = () => {
    showFecha.value = false
    fechaComprobante.value = data.selectedDate
        ? data.selectedDate
        : fechaComprobante.value
}
const attachDoc = () => {
    refAttachment.value.click()
}
const onUploadAttachment = async (e) => {
    const file = e.target.files[0]
    refAttachment.value.value = ''
    await appStore.actions.uploadFile(file, file.name)
}
const onClose = () => {
    showForm.value = false
}
const show = () => {
    showForm.value = true
}
defineExpose({ show })
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

.footerBtns {
    margin: 20px;
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

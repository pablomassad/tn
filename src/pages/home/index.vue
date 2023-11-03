<template>
    <div class="">
        <div class="userForm">
            <div class="label">Propietario: </div>
            <div class="value">Pablo Massad, Patricia Gonzalez Villar</div>
            <div class="label">Unidad: </div>
            <div class="value">23</div>
            <div class="label">CUIT: </div>
            <div class="value">3420340901230901</div>
            <div class="label">Deuda: </div>
            <div class="value">$0</div>
        </div>
        <div class="matrix">
            <div class="rowExpensa encabezado">
                <div>Expensa</div>
                <div class="precio">Importe</div>
                <div class="interes">Interes</div>
                <div class="interes">Saldo</div>
                <div style="text-align: center;">Bajar expensa</div>
                <div style="text-align: center;">Comprobante de pago</div>
                <div style="text-align: center;">Estado</div>
            </div>
            <div v-for="(item, index) in appStore.state.expensas" :key="index" class="rowExpensa">
                <div>{{ item.expensa }}</div>
                <div class="precio">{{ item.importe.toFixed(2) }}</div>
                <div class="interes">{{ item.interes.toFixed(2) }}</div>
                <div class="interes">{{ item.saldo.toFixed(2) }}</div>
                <div class="btn">
                    <q-icon name="file_download" class="btnIcon" @click="download"></q-icon>
                </div>
                <div class="btn" @click="showInfo">
                    <q-icon name="upload_file" class="btnIcon"></q-icon>
                </div>
                <div class="estado" :class="{pagado: item.estado}"></div>
            </div>
        </div>
        <ConfirmDialog :prompt="showForm" class="formDialog" bg-color="white">
            <template #header>
                <div class="dialogTitle">
                    Expensa Octubre 2023
                </div>
            </template>
            <template #default>
                <q-input outlined dense v-model="fechaComprobante" label="Fecha de comprobante" readonly bg-color="white" class="datehour">
                    <template v-slot:prepend>
                        <q-icon name="event" class="cursor-pointer">
                        </q-icon>
                    </template>
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="fechaComprobante" mask="appStore.state.formatDay" :locale="myLocale" :options="minDayTo">
                            <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                        </q-date>
                    </q-popup-proxy>
                </q-input>
                <q-input type="number" v-model="comprobante" label="Nro. de comprobante" />
                <q-input type="number" v-model="importe" label="Importe pagado" />
            </template>
            <template #footer>
                <div class="btnContainer">
                    <q-btn glossy color="primary" icon="attachment" class="footerBtns">Adjuntar archivos</q-btn>
                    <q-btn glossy color="primary" icon="check" class="footerBtns" @click="accept">Aceptar</q-btn>
                </div>
            </template>
        </ConfirmDialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, defineComponent, reactive } from 'vue'
import appStore from '../appStore'
import { useRouter } from 'vue-router'
import ConfirmDialog from 'fwk-q-confirmdialog'
import { InputTextPro } from 'fwk-q-inputs'

const router = useRouter()
const showForm = ref(false)
const fechaComprobante = ref()

onMounted(async () => {
    // ui.actions.setTitle('Informacion')
    await appStore.actions.initApp()
    if (!appStore.state.loginOK) {
        router.push('/login')
    } else {
        // await appStore.actions.subscribeToFCM()
        // await appStore.actions.getDataByUser()
        // await appStore.actions.getNotificacionesByUser()
        // activeIndex.value = appStore.state.userData[0].Patente
        // appStore.actions.updateNotifications('fhRecepcion')
    }
})
const download = () => {
    console.log('bajar arhivo expensas')
}
const showInfo = () => {
    showForm.value = true
}
const accept = () => {
    showForm.value = false
}

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

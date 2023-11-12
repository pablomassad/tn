<template>
    <div class="" v-if="appStore.state.selUnit">
        <div class="userForm">
            <div class="label">Propietario: </div>
            <div class="value">{{ appStore.state.selUnit.ownerNames }}</div>
            <div class="label">Unidad: </div>
            <div class="value">{{ appStore.state.id }}</div>
            <div class="label">CUIT: </div>
            <div class="value">34901230901</div>
            <div class="label">Deuda: </div>
            <div class="value">$0</div>
        </div>
        <div class="matrix">
            <div class="rowExpensa encabezado">
                <div>Expensa</div>
                <div class="precio">Importe</div>
                <div class="interes">Interes</div>
                <div class="interes">Monto Pagado</div>
                <div class="interes">Deuda</div>
                <div style="text-align: center;">Descargar</div>
                <div style="text-align: center;">Detalle</div>
                <div style="text-align: center;">Estado</div>
            </div>
            <div v-for="(item) in localExpenses" :key="item">
                <div class="rowExpensa">
                    <div>{{ item.expName }}</div>
                    <div class="precio">{{ item.amount.toFixed(2) }}</div>
                    <div class="interes">{{ item.interest.toFixed(2) }}</div>
                    <div class="interes">{{ item.totComps?.toFixed(2) }}</div>
                    <div class="interes">{{ item.balance.toFixed(2) }}</div>
                    <div class="btn">
                        <q-icon name="file_download" class="btnIcon" @click="download"></q-icon>
                    </div>
                    <div class="btn" @click="toggleDetail(item)" :class="{pressed: item.showDetail}">
                        <q-icon name="upload_file" class="btnIcon"></q-icon>
                    </div>
                    <div class="estado" :class="{pagado: item.status}"></div>
                </div>
                <div class="grdComps" v-if="item.showDetail && item.comps">
                    <div class="rowComp encabezado">
                        <div class="centro">Fecha</div>
                        <div class="importe">Importe</div>
                        <div class="centro">Ver</div>
                        <div class="centro">Confirmado</div>
                    </div>
                    <div v-for="(cp) in item.comps" :key="cp" class="rowComp">
                        <div class="centro">{{ moment(cp.datetime).format('DD/MM/YY') }}</div>
                        <div class="importe">{{ cp.amount.toFixed(2) }}</div>
                        <div class="btn" @click="viewComp(item)">
                            <q-icon name="visibility" class="btnIcon"></q-icon>
                        </div>
                        <q-icon :name="cp.checked ? 'task_alt' : 'radio_button_unchecked'" class="chkStatus" :class="{chkValid: cp.checked}"></q-icon>
                    </div>
                    <div class="rowComp total">
                        <div class="centro">TOTAL</div>
                        <div class="importe">{{ sumComps(item).toFixed(2) }}</div>
                    </div>
                    <q-btn glossy round color="primary" icon="add" @click="addComp" class="addBtn"></q-btn>
                </div>
            </div>
        </div>
        <Comprobantes ref="refComp" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import { useRouter } from 'vue-router'
import Comprobantes from './Comprobantes/index.vue'
import moment from 'moment'
import { ui } from 'fwk-q-ui'

const router = useRouter()
const refComp = ref()
const localExpenses = ref()
const selExpense = ref()

onMounted(async () => {
    ui.actions.setTitle('Expensas')
    if (!appStore.state.selUnit) {
        router.push('/login')
    } else {
        const expenses = await appStore.actions.getExpenses()
        localExpenses.value = JSON.parse(JSON.stringify(expenses))
        // await appStore.actions.subscribeToFCM()
        // await appStore.actions.getDataByUser()
        // await appStore.actions.getNotificacionesByUser()
        // activeIndex.value = appStore.state.userData[0].Patente
    }
})
const download = () => {
    console.log('bajar arhivo expensas')
}
const toggleDetail = async (exp) => {
    exp.showDetail = !exp.showDetail
    exp.comps = await appStore.actions.getCompsByExp(exp.id)
    if (exp.showDetail) {
        selExpense.value = exp
    }
}
const addComp = () => {
    refComp.value.show(selExpense.value)
}
const viewComp = (cp) => {
    refComp.value.show(selExpense.value, cp)
}
const sumComps = (exp) => {
    const total = exp.comps.reduce((sum, o) => sum + o.amount, 0)
    return total
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

.total {
    background: lightyellow !important;
    font-weight: bold;
}

.addBtn {
    position: absolute;
    right: 10px;
    bottom: 10px;
}

.matrix {
    background-color: white;
    max-width: 800px;
    margin: auto;
    margin-top: 50px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.rowExpensa {
    display: grid;
    grid-template-columns: 110px 80px 70px 70px 70px 90px 90px 40px;
    align-items: center;
    width: 800px;
    column-gap: 20px;
    padding: 5px 15px;
    border-bottom: 1px solid gray;
}

.label {
    font-weight: bold;
    font-size: 20px;
}

.chkStatus {
    color: red;
    font-size: 25px;
    text-shadow: 1px 1px 1px black;
    font-weight: bold;
    justify-self: center;
}

.chkValid {
    color: green;
}

.importe {
    text-align: right;
}

.centro {
    text-align: center;
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

.grdComps {
    padding: 20px;
    width: 100%;
    position: relative;
    background: lightgray;
}

.rowComp {
    display: grid;
    grid-template-columns: 70px 80px 60px 70px;
    align-items: center;
    width: 364px;
    background: white;
    column-gap: 20px;
    padding: 5px 15px;
    border-bottom: 1px solid gray;
    margin: auto;
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
}

.pressed {
    box-shadow: inset 1px 1px 3px !important;
    text-shadow: none !important;
    padding-top: 1px;
    background-color: rgb(89, 112, 155) !important;
}

.btn {
    justify-self: center;
    border-radius: 5px;
    box-shadow: 1px 1px 3px gray;
    background-color: cornflowerblue;
    width: 30px;
    height: 30px;
    margin: 5px;
    text-shadow: 1px 1px 1px black;
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

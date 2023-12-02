<template>
    <div>
        <div class="matrix">
            <div class="rowExpensa encabezado">
                <div class="texto">Expensa</div>
                <div class="precio">Total</div>
                <div class="precio">Pagado</div>
                <div class="precio">Saldo</div>
                <div class="precio">Imp.x lote</div>
                <div class="central">Descargar</div>
                <div class="central">Detalle</div>
                <div class="central">Estado</div>
            </div>
            <div v-for="(item) in appStore.state.expenses" :key="item">
                <div class="rowExpensa">
                    <div>{{ item.expName }}</div>
                    <div class="precio">{{ item.total.toFixed(2) }}</div>
                    <div class="precio">{{ item.paid.toFixed(2) }}</div>
                    <div class="precio">{{ item.balance.toFixed(2) }}</div>
                    <div class="precio">{{ item.amount.toFixed(2) }}</div>
                    <div class="btn">
                        <q-icon name="file_download" class="btnIcon" @click="download"></q-icon>
                    </div>
                    <div class="btn" @click="gotoDetails(item)">
                        <q-icon name="visibility" class="btnIcon"></q-icon>
                    </div>
                    <div class="estado" :class="{pagado: item.status}"></div>
                </div>
            </div>
            <q-btn glossy round color="primary" icon="add" @click="createExp" class="addBtn"></q-btn>
        </div>
        <ModalPanel :modalActive="showNewExp" @close="onCloseExp">
            <div class="modalFrame">
                <q-select :options="appStore.state.years" behavior="menu" label="Seleccione año" v-model="selYear" option-label="name" option-value="id" @update:model-value="onSelYear" class="combo" outlined></q-select>
                <q-select :options="appStore.state.months" behavior="menu" label="Seleccione mes" v-model="selMonth" option-label="name" option-value="id" @update:model-value="onSelMonth" class="combo" outlined></q-select>
            </div>
        </ModalPanel>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import { ui } from 'fwk-q-ui'
import ModalPanel from 'src/components/ModalPanel.vue'
import { LocalStorage } from 'quasar'
import { useRouter } from 'vue-router'

const router = useRouter()

console.log('Admin CONSTRUCTOR ################')

const selYear = ref(LocalStorage.getItem('TN_expYear'))
const selMonth = ref(LocalStorage.getItem('TN_expMonth'))
const showNewExp = ref(false)

onMounted(async () => {
    console.log('Administración OnMounted')
    ui.actions.setTitle('Administración')
    appStore.actions.admin.monitorExpenses()
})

const onSelYear = async (e) => {
    console.log(e.id)
    selYear.value = e
    LocalStorage.set('TN_expYear', e)
}
const onSelMonth = async (e) => {
    console.log(e.id)
    selMonth.value = e
    LocalStorage.set('TN_expMonth', e)
}
const onCloseExp = (e) => {
    showNewExp.value = false
    if (e) {
        appStore.actions.admin.createExpense(selYear.value.name, selMonth.value.id)
    }
}
const download = (exp) => {

}
const gotoDetails = (exp) => {
    appStore.set.selExpense(exp)
    router.push('/admin/details')
}
const createExp = () => {
    showNewExp.value = true
}
</script>

<style scoped>
.combo {
    margin: 16px;
    z-index: 40000;
}

.matrix {
    position: relative;
    background-color: white;
    max-width: 750px;
    margin: auto;
    margin-top: 50px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.encabezado {
    background-color: lightblue;
    font-weight: bold;
    border-radius: 10px 10px 0 0;
}

.rowExpensa {
    display: grid;
    grid-template-columns: 100px 80px 80px 80px 80px 60px 60px 40px;
    align-items: center;
    width: 750px;
    column-gap: 20px;
    padding: 5px 15px;
    border-bottom: 1px solid gray;
}

.status {
    justify-self: center;
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

.btnStatus {
    font-size: 30px;
    justify-self: center;
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

.centro {
    text-align: center;
}

.precio {
    text-align: right;
}

.texto {
    text-align: left;
}

.central {
    text-align: center;
}

.total {
    position: relative;
    background: lightyellow !important;
    font-weight: bold;
    height: 60px;
}

.addBtn {
    position: absolute;
    right: -15px;
    bottom: -15px;
}

.modalFrame {
    padding: 20px;
}
</style>

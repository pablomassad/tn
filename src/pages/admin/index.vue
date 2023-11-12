<template>
    <div>
        <div class="matrix">
            <div class="rowExpensa encabezado">
                <div>Expensa</div>
                <div class="precio">Importe</div>
                <div class="interes">Monto Pagado</div>
                <div class="interes">Deuda</div>
                <div style="text-align: center">Descargar</div>
                <div style="text-align: center">Detalle</div>
                <div style="text-align: center">Estado</div>
            </div>
            <div v-for="(item) in localExpenses" :key="item">
                <div class="rowExpensa">
                    <div>{{ item.expName }}</div>
                    <div class="precio">{{ item.amount.toFixed(2) }}</div>
                    <div class="interes">{{ item.interest.toFixed(2) }}</div>
                    <div class="interes">{{ item.balance.toFixed(2) }}</div>
                    <div class="btn">
                        <q-icon name="file_download" class="btnIcon" @click="download"></q-icon>
                    </div>
                    <div class="btn" @click="toggleDetail(item)" :class="{pressed: item.showDetail}">
                        <q-icon name="upload_file" class="btnIcon"></q-icon>
                    </div>
                    <div class="estado" :class="{pagado: item.status}"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import moment from 'moment'
import { ui } from 'fwk-q-ui'

const localExpenses = ref([])

console.log('Admin CONSTRUCTOR ################')

onMounted(async () => {
    console.log('Administración OnMounted')
    ui.actions.setTitle('Administración')
    localExpenses.value = JSON.parse(JSON.stringify(await appStore.actions.admin.getExpenses()))
})

const download = (exp) => {

}
const sum = (arr) => {
    if (!arr) return 0
    const total = arr.reduce((sum, o) => sum + o.amount, 0)
    return total
}

</script>

<style scoped>
.matrix {
    position: relative;
    background-color: white;
    max-width: 540px;
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

.rowTicket {
    display: grid;
    grid-template-columns: 110px 80px 70px 70px 20px 80px;
    align-items: center;
    width: 540px;
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

.total {
    position: relative;
    background: lightyellow !important;
    font-weight: bold;
    height: 60px;
}

.addBtn {
    position: absolute;
    right: 13px;
    bottom: 10px;
}
</style>

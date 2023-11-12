<template>
    <div>
        <div class="matrix" v-if="localTickets.length">
            <div class="rowTicket encabezado">
                <div class="centro">Fecha</div>
                <div class="texto">Tema</div>
                <div class="precio">Importe</div>
                <div style="text-align: center;">Descargar</div>
                <div style="text-align: center;">Ver</div>
                <div style="text-align: center;">Estado</div>
            </div>
            <div v-for="(item) in localTickets" :key="item">
                <div class="rowTicket">
                    <div class="centro">{{ moment(item.datetime).format('DD/MM/YY HH:mm') }}</div>
                    <div class="texto">{{ item.category }}</div>
                    <div class="precio">{{ item.amount.toFixed(2) }}</div>
                    <div class="btn">
                        <q-icon name="file_download" class="btnIcon" @click="download(item)"></q-icon>
                    </div>
                    <div class="btn" @click="viewTicket(item)">
                        <q-icon name="visibility" class="btnIcon"></q-icon>
                    </div>
                    <div class="estado" :class="{pagado: item.checked}"></div>
                </div>
            </div>
            <div class="rowTicket total">
                <div class="centro">TOTAL</div>
                <div></div>
                <div class="precio">{{ sumTickets(localTickets).toFixed(2) }}</div>
            </div>
        </div>
        <q-btn glossy round color="primary" icon="add" @click="addTicket" class="addBtn"></q-btn>
        <Ticket ref="refTicket" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import moment from 'moment'
import { ui } from 'fwk-q-ui'
import Ticket from './Ticket/index.vue'

const localTickets = ref([])
const refTicket = ref()

console.log('Tickets CONSTRUCTOR ################')

onMounted(async () => {
    console.log('Tickets onMounted')
    ui.actions.setTitle('Gastos')
    localTickets.value = JSON.parse(JSON.stringify(await appStore.actions.getTicketsByUnit()))
})

const download = (tk) => {

}
const sumTickets = (tks) => {
    if (!tks) return 0
    const total = tks.reduce((sum, o) => sum + o.amount, 0)
    return total
}
const viewTicket = async (tk) => {
    refTicket.value.show(tk)
}
const addTicket = () => {
    refTicket.value.show()
}

</script>

<style scoped>
.matrix {
    background-color: white;
    max-width: 600px;
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
    grid-template-columns: 110px 80px 70px 70px 70px 90px;
    align-items: center;
    width: 600px;
    column-gap: 20px;
    padding: 5px 15px;
    border-bottom: 1px solid gray;
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
    background: lightyellow !important;
    font-weight: bold;
}

.addBtn {
    position: relative;
    right: 0px;
}
</style>

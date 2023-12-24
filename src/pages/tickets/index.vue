<template>
    <div>
        <div class="matrix" v-if="appStore.state.tickets">
            <div class="fila ticket encabezado">
                <SortColumn class="central" col="datetime" label="Fecha" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="texto" col="concept" label="Concepto" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="amount" label="Importe" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="paid" label="Pagado" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="balance" label="Saldo" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <div class="celda central">Ver</div>
                <SortColumn class="celda texto" col="status" label="Estado" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="texto" col="referrer" label="Referente" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
            </div>
            <div v-for="(tk) in appStore.state.tickets" :key="tk">
                <div class="fila ticket">
                    <div class="celda central">{{ moment(tk.date).format('DD/MM/YY HH:mm') }}</div>
                    <div class="celda texto">{{ tk.concept }}</div>
                    <div class="celda precio">{{ tk.amount.toFixed(1) }}</div>
                    <div class="celda precio">{{ tk.paid.toFixed(1) }}</div>
                    <div class="celda precio">{{ tk.balance.toFixed(1) }}</div>
                    <BtnIcon icon="visibility" @click="viewTicket(tk)" />
                    <StatusLed class="celda central" :status="evalStatus(tk)" />
                    <div class="celda texto">{{ tk.referrer }}</div>
                </div>
            </div>
            <!--<div class="rowTicket total">
                <div class="central">TOTAL</div>
                <div></div>
                <div class="precio">{{ sumTickets(appStore.state.tickets).toFixed(1) }}</div>
            </div>-->
            <q-btn glossy round color="primary" icon="add" @click="addTicket" class="addBtn"></q-btn>
        </div>
        <Ticket ref="refTicket" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import moment from 'moment'
import BtnIcon from 'src/components/BtnIcon.vue'
import StatusLed from 'src/components/StatusLed.vue'
import { ui } from 'fwk-q-ui'
import Ticket from './Ticket/index.vue'
import SortColumn from 'src/components/SortColumn.vue'

const refTicket = ref()

console.log('Tickets CONSTRUCTOR ################')

onMounted(async () => {
    console.log('Tickets onMounted')
    ui.actions.setTitle('Gastos')
    appStore.actions.tickets.monitorTickets()
})
const addTicket = () => {
    refTicket.value.show()
}
const viewTicket = async (tk) => {
    refTicket.value.show(tk)
}
const evalStatus = (item) => {
    let st = 'pending'
    if (item.amount !== item.balance) {
        st = 'partial'
        if (item.balance === 0) {
            st = 'total'
        }
    }
    return st
}

</script>

<style scoped>
.matrix {
    position: relative;
    background-color: white;
    max-width: 1090px;
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

.ticket {
    grid-template-columns: 130px 270px 80px 80px 80px 70px 70px 320px;
    width: 1090px;
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

.total {
    position: relative;
    background: lightyellow !important;
    font-weight: bold;
    height: 60px;
}

.addBtn {
    position: absolute;
    right: 5px;
    bottom: 5px;
}
</style>

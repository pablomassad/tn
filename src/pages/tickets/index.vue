<template>
    <div>
        <div class="matrix" v-if="appStore.state.tickets">
            <div class="fila ticket encabezado">
                <!--<q-checkbox size="sm" v-model="allSelected" @update:model-value="onSelectAll" />-->
                <!--<SortColumn class="central" col="idExp" label="Imputación" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />-->
                <SortColumn class="celda central" col="status" label="Estado" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="texto" col="concept" label="Concepto" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="amount" label="Importe" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="paid" label="Pagado" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="balance" label="Saldo" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="texto" col="payMode" label="Forma de pago" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="texto" col="referrer" label="Referente" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="central" col="swOrdExtra" label="Extra" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="central" col="swContTerra" label="Cont" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="central" col="datetime" label="Fecha" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <div class="celda central">Ver</div>
                <div class="celda central">Borrar</div>
            </div>
            <div v-for="(tk) in appStore.state.tickets" :key="tk">
                <div class="fila ticket">
                    <!--<q-checkbox size="sm" v-model="tk.selected" />-->
                    <!--<div class="celda central">{{ appStore.actions.evalExpName(tk.idExp) }}</div>-->
                    <StatusLed class="celda central" :status="evalStatus(tk)" />
                    <div class="celda texto">{{ tk.concept }}</div>
                    <div class="celda precio">{{ tk.amount }}</div>
                    <div class="celda precio">{{ tk.paid }}</div>
                    <div class="celda precio">{{ tk.balance }}</div>
                    <div class="celda texto">{{ tk.payMode }}</div>
                    <div class="celda texto">{{ tk.referrer }}</div>
                    <q-icon class="celda typeIcon" :name="(tk.swOrdExtra === 'Extraordinaria') ? 'task_alt' : ''"></q-icon>
                    <q-icon class="celda typeIcon" :name="(tk.swContTerra === 'Contable') ? 'task_alt' : ''"></q-icon>
                    <div class="celda central">{{ moment(tk.date).format(appStore.state.dateMask) }}</div>
                    <BtnIcon icon="visibility" @click="viewTicket(tk)" />
                    <q-icon class="celda typeIcon" name="delete" color="grey"></q-icon>
                </div>
            </div>
            <!--<div class="rowTicket total">
                <div class="central">TOTAL</div>
                <div></div>
                <div class="precio">{{ sumTickets(appStore.state.tickets) }}</div>
            </div>-->
            <q-btn glossy round color="primary" icon="add" @click="addTicket" class="addBtn"></q-btn>
        </div>
        <TicketForm ref="refTicket" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import appStore from 'src/pages/appStore'
import moment from 'moment'
import BtnIcon from 'src/components/BtnIcon.vue'
import StatusLed from 'src/components/StatusLed.vue'
import { ui } from 'fwk-q-ui'
import TicketForm from './TicketForm.vue'
import SortColumn from 'src/components/SortColumn.vue'

const refTicket = ref()
const allSelected = ref(false)
// const localTickets = ref()

console.log('Tickets CONSTRUCTOR ################')

onMounted(async () => {
    console.log('Tickets onMounted')
    ui.actions.setTitle('Gastos')
    appStore.actions.admin.getExpenses()
    appStore.actions.tickets.monitorTickets()
})
const addTicket = () => {
    appStore.set.selTicket(undefined)
    refTicket.value.show()
}
const viewTicket = async (tk) => {
    appStore.set.selTicket(tk)
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

// const onSelectAll = () => {
//    localTickets.value = localTickets.value.map(x => {
//        x.selected = allSelected.value
//        return x
//    })
//    console.log('tickets:', localTickets.value)
// }
// watch(() => appStore.state.tickets, (newTickets) => {
//    console.log('watch tickets:', newTickets)
//    localTickets.value = JSON.parse(JSON.stringify(newTickets))
//    localTickets.value = localTickets.value.map(x => {
//        x.selected = x.selected || false
//        return x
//    })
// })

</script>

<style scoped>
.typeIcon {
    font-size: 20px;
    color: green;
    justify-self: center;
    align-self: center;
}

.matrix {
    position: relative;
    background-color: white;
    max-width: 1390px;
    margin: auto;
    margin-top: 50px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.ticket {
    grid-template-columns: 80px 270px 80px 80px 80px 110px 320px 70px 80px 110px 50px 50px;
    width: 1390px;
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

.assignBtn {
    position: fixed;
    left: 10px;
    bottom: 10px;
    font-weight: bold;
}

.unassignBtn {
    position: fixed;
    left: 200px;
    bottom: 10px;
    font-weight: bold;
}

.addBtn {
    position: fixed;
    right: 25px;
    bottom: 25px;
}
</style>

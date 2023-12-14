<template>
    <div>
        <div class="matrix" v-if="appStore.state.tickets">
            <div class="rowTicket encabezado">
                <div class="centro">Fecha</div>
                <div class="texto">Concepto</div>
                <div class="precio">Importe</div>
                <div class="precio">Pagado</div>
                <div class="precio">Saldo</div>
                <div class="centro">Ver</div>
                <div class="centro">Estado</div>
                <div class="centro">Referente</div>
            </div>
            <div v-for="(tk) in appStore.state.tickets" :key="tk">
                <div class="rowTicket">
                    <div class="centro">{{ moment(tk.datetime).format('DD/MM/YY HH:mm') }}</div>
                    <div class="texto">{{ tk.concept }}</div>
                    <div class="precio">{{ tk.amount.toFixed(1) }}</div>
                    <div class="precio">{{ tk.paid.toFixed(1) }}</div>
                    <div class="precio">{{ tk.balance.toFixed(1) }}</div>
                    <BtnIcon icon="visibility" @click="viewTicket(tk)" />
                    <StatusLed class="centro" :status="evalStatus(tk)" />
                    <div class="texto">{{ tk.referrer }}</div>
                    <!--<div class="status" :class="{pagado: tk.checked}">
                        <q-icon v-if="tk.checked" name="assignment_turned_in" class="btnStatus" color="green"></q-icon>
                        <q-icon v-if="!tk.checked" name="error_outline" class="btnStatus" color="red"></q-icon>
                    </div>-->
                </div>
            </div>
            <!--<div class="rowTicket total">
                <div class="centro">TOTAL</div>
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
import Validation from 'src/components/Validation.vue'
import { ui } from 'fwk-q-ui'
import Ticket from './Ticket/index.vue'

const refTicket = ref()

console.log('Tickets CONSTRUCTOR ################')

onMounted(async () => {
    console.log('Tickets onMounted')
    ui.actions.setTitle('Gastos')
    appStore.actions.tickets.getTickets()
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
    max-width: 1100px;
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
    grid-template-columns: 100px 250px 70px 70px 70px 40px 50px 50px 200px;
    align-items: center;
    width: 1100px;
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
    right: 5px;
    bottom: 5px;
}
</style>

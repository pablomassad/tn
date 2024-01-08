<template>
    <div>
        <div class="mainTitle">
            Expensa {{ appStore.actions.evalExpName(appStore.state.selExpense.id) }}
        </div>
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
                <SortColumn class="central" col="isExtra" label="Extra" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="central" col="isCont" label="Cont" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <SortColumn class="central" col="datetime" label="Fecha" :sortMethod="appStore.actions.tickets.sort" :activeCol="appStore.state.activeCol" />
                <div class="celda central">Ver</div>
                <div class="celda central">Borrar</div>
            </div>
            <div class="detailsList">
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
                        <q-icon class="celda typeIcon" :name="(tk.isExtra) ? 'task_alt' : ''"></q-icon>
                        <q-icon class="celda typeIcon" :name="(tk.isCont) ? 'task_alt' : ''"></q-icon>
                        <div class="celda central">{{ moment(tk.date).format(appStore.state.dateMask) }}</div>
                        <BtnIcon icon="visibility" @click="viewTicket(tk)" />
                        <q-icon class="celda typeIcon" name="delete" color="grey" @click="deleteTicket(tk)"></q-icon>
                    </div>
                </div>
            </div>
            <div class="fila ticket total" style="background-color: rgb(182, 255, 250) !important">
                <div></div>
                <div class="celda texto">TOTAL Ordinarias</div>
                <div></div>
                <div class="celda precio">{{ appStore.state.selExpense.totalOrdinary }}</div>
                <div class="celda precio">{{ appStore.state.selExpense.amountOrdinary }}</div>
            </div>
            <div class="fila ticket total" style="background-color: rgb(251, 255, 196) !important">
                <div></div>
                <div class="celda texto">TOTAL Extraordinarias</div>
                <div></div>
                <div class="celda precio">{{ appStore.state.selExpense.totalExtraordinary }}</div>
                <div class="celda precio">
                    {{ appStore.state.selExpense.amountExtraordinary }}
                    <q-popup-edit v-model="expExtraLote" class="bg-green text-black" v-slot="scope" v-if="!appStore.state.selExpense.deployed">
                        <q-input type="number" dark color="white" v-model="scope.value" dense autofocus counter @keyup.enter="scope.set">
                            <template v-slot:append>
                                <q-icon name="edit" />
                            </template>
                        </q-input>
                    </q-popup-edit>
                </div>
            </div>
            <div class="fila ticket total" style="background-color: rgb(202, 202, 202) !important">
                <div></div>
                <div class="celda texto">TOTAL Expensas</div>
                <div></div>
                <div class="celda precio">{{ appStore.state.selExpense.total }}</div>
                <div class="celda precio">{{ appStore.state.selExpense.amount }}</div>
                <q-btn v-if="!appStore.state.selExpense.deployed" glossy round color="primary" icon="add" @click="addTicket" class="addBtn" size="lg"></q-btn>
            </div>
        </div>
        <TicketForm ref="refTicket" />
        <ConfirmDialog :prompt="showConfirm" :message="confirmMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import appStore from 'src/pages/appStore'
import ConfirmDialog from 'fwk-q-confirmdialog'
import moment from 'moment'
import BtnIcon from 'src/components/BtnIcon.vue'
import StatusLed from 'src/components/StatusLed.vue'
import { ui } from 'fwk-q-ui'
import TicketForm from './TicketForm.vue'
import { log } from 'pdfmake/build/pdfmake'
import SortColumn from 'src/components/SortColumn.vue'

const showConfirm = ref(false)
const confirmMessage = ref()
const onAcceptDialog = ref()
const onCancelDialog = ref()

const refTicket = ref()
const expExtraLote = ref(0)
// const allSelected = ref(false)

console.log('Tickets CONSTRUCTOR ################')

onMounted(async () => {
    console.log('Tickets onMounted')
    ui.actions.setTitle('Gastos')
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
const deleteTicket = async (tk) => {
    await appStore.actions.tickets.remove(tk)
}
const sumTickets = (arr) => {
    if (!arr) return
    let totalOrdinary = 0
    let totalExtra = 0
    const total = arr.reduce((sum, o) => {
        sum = sum + o.paid
        if (o.isExtra) {
            totalExtra = totalExtra + o.paid
        } else {
            totalOrdinary = totalOrdinary + o.paid
        }
        return sum
    }, 0)
    console.log('TOTAL paid tickets:', total)
    console.log('TOTAL ordinary:', totalOrdinary)
    console.log('TOTAL lote ordinary:', totalOrdinary / 48)
    console.log('TOTAL Extra:', totalExtra)
    console.log('TOTAL lote Extra:', totalExtra / 48)
    return total
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

watch(() => expExtraLote.value, (newVal) => {
    if (!appStore.state.selExpense?.deployed) {
        const num = Number(newVal)
        console.log('watch expExtraLote:', num)
        appStore.actions.admin.updateExpense({ amountExtraordinary: num, totalExtraordinary: num * 48 })
    }
})
</script>

<style scoped>
.titlex {
    font-size: 20px;
    text-shadow: 1px 1px 1px white;
    font-weight: bold;
    display: grid;
    justify-content: center;
    margin-top: 20px;
}

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
    margin-top: 20px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.ticket {
    grid-template-columns: 80px 270px 80px 80px 80px 110px 320px 70px 80px 110px 50px 50px;
    width: 1390px;
    border-bottom: 1px solid gray;
}

.detail {
    grid-template-columns: 280px 300px 70px 100px 120px 60px 50px;
    width: 1390px;
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

.detailsList {
    height: calc(100vh - 370px);
    overflow: auto;
}

.addBtn {
    position: fixed;
    right: 20px;
    bottom: 20px;
}
</style>

<template>
    <div>
        <div class="mainTitle">
            Expensa {{ appStore.actions.evalExpName(appStore.state.selExpense.id) }}
        </div>
        <div class="matrix">
            <div class="fila detail encabezado">
                <SortColumn class="texto" col="concept" label="Concepto" :sortMethod="appStore.actions.admin.sortDetails" :activeCol="appStore.state.activeCol" />
                <SortColumn class="texto" col="description" label="Descripcion" :sortMethod="appStore.actions.admin.sortDetails" :activeCol="appStore.state.activeCol" />
                <SortColumn class="precio" col="amount" label="Importe" :sortMethod="appStore.actions.admin.sortDetails" :activeCol="appStore.state.activeCol" />
                <SortColumn class="central" col="date" label="Fecha" :sortMethod="appStore.actions.admin.sortDetails" :activeCol="appStore.state.activeCol" />
                <SortColumn class="texto" col="payMode" label="Forma de pago" :sortMethod="appStore.actions.admin.sortDetails" :activeCol="appStore.state.activeCol" />
                <SortColumn class="central" col="isCont" label="Cont" :sortMethod="appStore.actions.admin.sortDetails" :activeCol="appStore.state.activeCol" />
                <div class="texto"></div>
            </div>
            <div class="detailsList">
                <div v-for="item in appStore.state.detailsByExp" :key="item">
                    <div class="fila detail">
                        <div class="celda texto">{{ item.concept }}</div>
                        <div class="celda texto">{{ item.description }}</div>
                        <div class="celda precio">{{ item.amount }}</div>
                        <div class="celda central">{{ moment(item.date).format(appStore.state.dateMask) }}</div>
                        <div class="celda texto" :style="{color: (item.payMode === 'Pendiente') ? 'red' : 'black'}">{{ item.payMode }}</div>
                        <q-icon class="celda typeIcon" :name="(item.isCont === 'Contable') ? 'task_alt' : ''"></q-icon>
                        <BtnIcon icon="edit" @click="editItem(item)" :disabled="!!appStore.state.selExpense.deployed" />
                    </div>
                </div>
            </div>
            <div class="fila detail total" style="background-color: rgb(182, 255, 250) !important">
                <div class="celda texto">TOTAL Ordinarias</div>
                <div></div>
                <!--<div class="precio">{{ sumOrdinarias()? }}</div>-->
                <div class="celda precio">{{ appStore.state.selExpense.totalOrdinary }}</div>
                <div></div>
                <!--<div class="precio">{{ expOrdinariaLote? }}</div>-->
                <div class="celda precio">{{ appStore.state.selExpense.amountOrdinary }}</div>
            </div>
            <div class="fila detail total" style="background-color: rgb(251, 255, 196) !important">
                <div class="celda texto">TOTAL Extraordinarias</div>
                <div></div>
                <!--<div class="precio">{{ expExtraordinarias }}</div>-->
                <div class="celda precio">{{ appStore.state.selExpense.totalExtraordinary }}</div>
                <div></div>
                <div class="celda precio">
                    <!--{{ Number(expExtraLote)? }}-->
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
            <div class="fila detail total" style="background-color: rgb(202, 202, 202) !important">
                <div class="celda texto">TOTAL Expensas</div>
                <div></div>
                <!--<div class="precio">{{ (sumOrdinarias() + expExtraordinarias)? }}</div>-->
                <div class="celda precio">{{ appStore.state.selExpense.total }}</div>
                <div></div>
                <!--<div class="precio">{{ (Number(expOrdinariaLote) + Number(expExtraLote))? }}</div>-->
                <div class="celda precio">{{ appStore.state.selExpense.total }}</div>
                <q-btn v-if="!appStore.state.selExpense.deployed" glossy round color="primary" icon="add" @click="createItem" class="addBtn"></q-btn>
            </div>
        </div>
        <DetailsForm ref="refDetailsForm"></DetailsForm>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import appStore from 'src/pages/appStore'
import DetailsForm from './DetailsForm/index.vue'
import BtnIcon from 'src/components/BtnIcon.vue'
import SortColumn from 'src/components/SortColumn.vue'
import moment from 'moment'

const refDetailsForm = ref()
const expExtraLote = ref(0)

onMounted(async () => {
    console.log('Details onMounted', appStore.state.selExpense)
    // appStore.actions.admin.getDetailsByExp()
    appStore.actions.admin.monitorDetailsByExp()
})
onUnmounted(() => {
    appStore.actions.unsubscribeListeners('us_detailsByExp')
})
const createItem = () => {
    refDetailsForm.value.show()
}
const editItem = (item) => {
    refDetailsForm.value.show(item)
}
watch(() => expExtraLote.value, (newVal) => {
    if (!appStore.state.selExpense?.deployed) {
        const num = Number(newVal)
        console.log('watch expExtraLote:', num)
        appStore.actions.admin.updateExpense({ amountExtraordinary: num, totalExtraordinary: num * 48 })
    }
})

// const sumOrdinarias = () => {
//    const arr = appStore.state.detailsByExp
//    if (!arr) return
//    const total = arr.reduce((sum, o) => {
//        sum = sum + ((o.isExtra === 'Ordinaria') ? o.amount : 0)
//        return sum
//    }, 0)
//    expOrdinariaLote.value = total / 48
//    return total
// }

</script>

<style scoped>
.typeIcon {
    font-size: 20px;
    color: green;
    justify-self: center;
    align-self: center;
}

.value {
    font-size: 18px;
    color: #555;
}

.matrix {
    position: relative;
    background-color: white;
    max-width: 1000px;
    margin: auto;
    margin-top: 20px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.detailsList {
    height: calc(100vh - 320px);
    overflow: auto;
}

.detail {
    grid-template-columns: 280px 300px 70px 100px 120px 60px 50px;
    width: 1000px;
}

.addBtn {
    position: absolute;
    right: 4px;
    bottom: 4px;
}
</style>

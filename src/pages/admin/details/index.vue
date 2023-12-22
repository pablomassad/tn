<template>
    <div>
        <div class="title">
            Expensa {{ appStore.actions.evalExpName(appStore.state.selExpense.id) }}
        </div>
        <div class="matrix">
            <div class="rowDetail encabezado">
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
                    <div class="rowDetail">
                        <div class="texto">{{ item.concept }}</div>
                        <div class="texto">{{ item.description }}</div>
                        <div class="precio">{{ item.amount.toFixed(1) }}</div>
                        <div class="central">{{ item.date }}</div>
                        <div class="texto" :style="{color: (item.payMode === 'Pendiente') ? 'red' : 'black'}">{{ item.payMode }}</div>
                        <q-icon class="typeIcon" :name="(item.isCont === 'Contable') ? 'task_alt' : ''"></q-icon>
                        <BtnIcon icon="edit" @click="editItem(item)" :disabled="!!appStore.state.selExpense.deployed" />
                    </div>
                </div>
            </div>
            <div class="rowDetail total" style="background-color: rgb(182, 255, 250) !important">
                <div class="texto">TOTAL exp.ordinarias</div>
                <div></div>
                <!--<div class="precio">{{ sumOrdinarias()?.toFixed(1) }}</div>-->
                <div class="precio">{{ appStore.state.selExpense.totalOrdinary.toFixed(1) }}</div>
                <div></div>
                <!--<div class="precio">{{ expOrdinariaLote?.toFixed(1) }}</div>-->
                <div class="precio">{{ appStore.state.selExpense.amountOrdinary.toFixed(1) }}</div>
            </div>
            <div class="rowDetail total" style="background-color: rgb(251, 255, 196) !important">
                <div class="texto">TOTAL exp.extraordinarias</div>
                <div></div>
                <!--<div class="precio">{{ expExtraordinarias.toFixed(1) }}</div>-->
                <div class="precio">{{ appStore.state.selExpense.totalExtraordinary.toFixed(1) }}</div>
                <div></div>
                <div class="precio">
                    <!--{{ Number(expExtraLote)?.toFixed(1) }}-->
                    {{ appStore.state.selExpense.amountExtraordinary.toFixed(1) }}
                    <q-popup-edit v-model="expExtraLote" class="bg-green text-black" v-slot="scope" v-if="!appStore.state.selExpense.deployed">
                        <q-input type="number" dark color="white" v-model="scope.value" dense autofocus counter @keyup.enter="scope.set">
                            <template v-slot:append>
                                <q-icon name="edit" />
                            </template>
                        </q-input>
                    </q-popup-edit>
                </div>
            </div>
            <div class="rowDetail total" style="background-color: rgb(202, 202, 202) !important">
                <div class="texto">TOTAL Expensas</div>
                <div></div>
                <!--<div class="precio">{{ (sumOrdinarias() + expExtraordinarias)?.toFixed(1) }}</div>-->
                <div class="precio">{{ appStore.state.selExpense.total.toFixed(1) }}</div>
                <div></div>
                <!--<div class="precio">{{ (Number(expOrdinariaLote) + Number(expExtraLote))?.toFixed(1) }}</div>-->
                <div class="precio">{{ appStore.state.selExpense.total.toFixed(1) }}</div>
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
}

.value {
    font-size: 18px;
    color: #555;
}

.title {
    font-size: 20px;
    text-shadow: 1px 1px 1px white;
    font-weight: bold;
    display: grid;
    justify-content: center;
    margin-top: 20px;
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

.rowDetail {
    display: grid;
    grid-template-columns: 180px 300px 70px 104px 100px 50px 40px;
    align-items: center;
    width: 1000px;
    column-gap: 20px;
    padding: 0 15px;
    border-bottom: 1px solid gray;
}

.total {
    position: relative;
    font-weight: bold;
    height: 40px;
}

.encabezado {
    background-color: lightblue;
    font-weight: bold;
    border-radius: 10px 10px 0 0;
    padding: 10px 15px;
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

.title {
    font-size: 20px;
    font-weight: bold;
    text-shadow: 1px 1px 1px white;
    text-align: center;
}

.addBtn {
    position: absolute;
    right: 4px;
    bottom: 4px;
}
</style>

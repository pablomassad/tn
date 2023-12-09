<template>
    <div>
        <div class="title">
            Expensa {{ appStore.actions.evalExpName(appStore.state.selExpense.id) }}
        </div>
        <div class="matrix">
            <div class="rowDetail encabezado">
                <div class="texto">Propietarios</div>
                <div class="precio">Importe</div>
                <div class="precio">Interes</div>
                <div class="precio">Pagado</div>
                <div class="precio">Saldo</div>
                <div class="central">Detalle</div>
                <div class="central">Estado</div>
            </div>
            <div class="expensesList">
                <div v-for="item in appStore.state.userExpenses" :key="item">
                    <div class="rowDetail">
                        <div class="texto">{{ item.ownerNames }}</div>
                        <div class="precio">{{ item.amount.toFixed(1) }}</div>
                        <div class="precio">{{ item.interest.toFixed(1) }}</div>
                        <div class="precio">{{ item.paid.toFixed(1) }}</div>
                        <div class="precio">{{ item.balance.toFixed(1) }}</div>
                        <BtnIcon icon="upload_file" @click="toggleDetail(item)" />
                        <StatusLed :status="item.status" />
                    </div>
                    <div class="grdComps" v-if="showDetails[item.id] && appStore.state.compsByExp[item.id]">
                        <div class="rowComp encabezado">
                            <div class="centro">Fecha</div>
                            <div class="importe">Importe</div>
                            <div class="centro">Ver</div>
                            <div class="centro">Confirmado</div>
                        </div>
                        <div v-for="(cp) in appStore.state.compsByExp[item.id]" :key="cp" class="rowComp">
                            <div class="centro">{{ moment(cp.datetime).format('DD/MM/YY') }}</div>
                            <div class="importe">{{ cp.amount.toFixed(1) }}</div>
                            <div class="btn" @click="viewComp(cp)">
                                <q-icon name="visibility" class="btnIcon"></q-icon>
                            </div>
                            <q-icon :name="cp.checked ? 'task_alt' : 'radio_button_unchecked'" class="chkStatus" :class="{chkValid: cp.checked}"></q-icon>
                        </div>
                        <div class="rowComp total">
                            <div class="centro">TOTAL</div>
                            <div class="importe">{{ sumComps(item).toFixed(1) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Receipts ref="refReceipt" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import appStore from 'src/pages/appStore'
import Receipts from 'src/components/Receipts.vue'
import BtnIcon from 'src/components/BtnIcon.vue'
import StatusLed from 'src/components/StatusLed.vue'
import moment from 'moment'

const refReceipt = ref()
const showDetails = ref({})

let selExp

onMounted(async () => {
    console.log('Monitor Expenses onMounted')
    appStore.actions.admin.monitorUserExpenses()
})
onUnmounted(() => {
    appStore.actions.unsubscribeListeners('userExpenses')
})
const toggleDetail = async (exp) => {
    showDetails.value[exp.id] = !showDetails.value[exp.id]
    if (showDetails.value[exp.id]) {
        selExp = exp
    }
}
const viewComp = (cp) => {
    refReceipt.value.show(selExp, cp)
}
</script>

<style scoped>
.expensesList {
    height: calc(100vh - 200px);
    overflow: auto;
}

.footerBtn {
    display: grid;
    margin: 20px auto;
}

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
    max-width: 810px;
    margin: auto;
    margin-top: 20px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.detailsList {
    height: calc(100vh - 420px);
    overflow: auto;
}

.rowDetail {
    display: grid;
    grid-template-columns: 260px 100px 70px 100px 100px 60px;
    align-items: center;
    width: 810px;
    height: 36px;
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

.btnIcon {
    padding: 5px;
    font-size: 20px;
    color: white;
    text-shadow: 1px 1px 1px black;
}

.btn {
    justify-self: center;
    border-radius: 5px;
    box-shadow: 1px 1px 3px gray;
    background-color: cornflowerblue;
    width: 30px;
    height: 30px;
    margin: 5px;
}

.btn:active {
    box-shadow: none;
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

.precio {
    text-align: right;
}

.texto {
    text-align: left;
}

.central {
    text-align: center;
}
</style>

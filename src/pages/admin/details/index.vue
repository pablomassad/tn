<template>
    <div>
        <div class="title">
            Expensa {{ appStore.actions.expenses.evalExpName(appStore.state.selExpense.id) }}
        </div>
        <div class="matrix">
            <div class="rowDetail encabezado">
                <div class="texto">Concepto</div>
                <div class="texto">Descripcion</div>
                <div class="precio">Importe</div>
                <div class="central">Fecha</div>
                <div class="texto">Forma de pago</div>
                <div class="central">Cont</div>
                <div class="texto"></div>
            </div>
            <div v-for="item in appStore.state.detailsByExp" :key="item">
                <div class="rowDetail">
                    <div class="texto">{{ item.concept }}</div>
                    <div class="texto">{{ item.description }}</div>
                    <div class="precio">{{ item.amount.toFixed(2) }}</div>
                    <div class="central">{{ item.date }}</div>
                    <div class="texto" :style="{color: (item.payMode === 'Pendiente') ? 'red' : 'black'}">{{ item.payMode }}</div>
                    <q-icon class="typeIcon" :name="(item.isCont === 'Contable') ? 'task_alt' : ''"></q-icon>
                    <div class="btn" @click="editItem(item)">
                        <q-icon name="edit" class="btnIcon"></q-icon>
                    </div>
                    <div class="btn" @click="viewTicket(item)" v-show="item.idTicket">
                        <q-icon name="request_quote" class="btnIcon"></q-icon>
                    </div>
                </div>
            </div>

            <div class="rowDetail total" style="background-color: rgb(182, 255, 250) !important">
                <div class="texto">TOTAL exp.ordinarias</div>
                <div></div>
                <div class="precio">{{ sumOrdinarias()?.toFixed(2) }}</div>
                <div></div>
                <div class="precio">{{ expOrdinariaLote?.toFixed(2) }}</div>
            </div>
            <div class="rowDetail total" style="background-color: rgb(251, 255, 196) !important">
                <div class="texto">TOTAL exp.extraordinarias</div>
                <div></div>
                <div class="precio">{{ expExtraordinarias.toFixed(2) }}</div>
                <div></div>
                <div class="precio">
                    {{ Number(expExtraLote)?.toFixed(2) }}
                    <q-popup-edit v-model="expExtraLote" class="bg-green text-black" v-slot="scope">
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
                <div class="precio">{{ (sumOrdinarias() + expExtraordinarias)?.toFixed(2) }}</div>
                <div></div>
                <div class="precio">{{ (Number(expOrdinariaLote) + Number(expExtraLote))?.toFixed(2) }}</div>
                <q-btn glossy round color="primary" icon="add" @click="createItem" class="addBtn"></q-btn>
            </div>
        </div>
        <q-btn glossy color="primary" icon="local_post_office" class="footerBtns" @click="distributeExpense">Cerrar y distribuir expensa</q-btn>
        <ConfirmDialog :prompt="showConfirm" :message="confirmMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
        <ExpForm ref="refExpForm"></ExpForm>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import appStore from 'src/pages/appStore'
import ExpForm from './ExpForm/index.vue'
import ConfirmDialog from 'fwk-q-confirmdialog'

const refExpForm = ref()

const showConfirm = ref(false)
const confirmMessage = ref()
const onAcceptDialog = ref()
const onCancelDialog = ref()

const expOrdinariaLote = ref(0)
const expExtraLote = ref(0)
const expExtraordinarias = computed(x => Number(expExtraLote.value) * 48)

onMounted(async () => {
    console.log('Details onMounted')
    appStore.actions.admin.getDetailsByExp()
    // appStore.actions.admin.monitorDetails()
})
const createItem = () => {
    refExpForm.value.show()
}
const editItem = (item) => {
    refExpForm.value.show(item)
}
const viewTicket = (item) => {

}
const distributeExpense = () => {
    showConfirm.value = true
    confirmMessage.value = 'Esta seguro que quiere cerrar y distribuir esta expensa?'
    onAcceptDialog.value = async () => {
        await appStore.actions.admin.distributeExpense()
        showConfirm.value = false
    }
    onCancelDialog.value = () => {
        showConfirm.value = false
    }
}

const sumOrdinarias = () => {
    const arr = appStore.state.detailsByExp
    if (!arr) return
    const total = arr.reduce((sum, o) => {
        sum = sum + ((o.isExtra === 'Ordinaria') ? o.amount : 0)
        return sum
    }, 0)
    expOrdinariaLote.value = total / 48
    return total
}

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
    margin-top: 50px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
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

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
                <div class="texto">Forma de pago</div>
                <div class="texto"></div>
            </div>
            <div v-for="item in appStore.state.detailsByExp" :key="item">
                <div class="rowDetail">
                    <div class="texto">{{ item.concept }}</div>
                    <div class="texto">{{ item.description }}</div>
                    <div class="precio">{{ item.amount.toFixed(2) }}</div>
                    <div class="texto" :style="{color: (item.payMode === 'Pendiente') ? 'red' : 'black'}">{{ item.payMode }}</div>
                    <div class="btn" @click="editItem(item)">
                        <q-icon name="edit" class="btnIcon"></q-icon>
                    </div>
                    <div class="btn" @click="viewTicket(item)" v-show="item.idTicket">
                        <q-icon name="request_quote" class="btnIcon"></q-icon>
                    </div>
                </div>
            </div>
            <div class="rowDetail total" style="background-color: lightpink !important">
                <div class="texto">TOTAL pendiente</div>
                <div></div>
                <div class="precio">{{ sumPendings()?.toFixed(2) }}</div>
            </div>
            <div class="rowDetail total">
                <div class="texto">TOTAL pagado</div>
                <div></div>
                <div class="precio">{{ sumPaid()?.toFixed(2) }}</div>
            </div>
            <div class="rowDetail total" style="background-color: lightgreen !important">
                <div class="texto">TOTAL</div>
                <div></div>
                <div class="precio">{{ sum()?.toFixed(2) }}</div>
                <q-btn glossy round color="primary" icon="add" @click="createItem" class="addBtn"></q-btn>
            </div>
        </div>
        <q-btn glossy color="primary" icon="local_post_office" class="footerBtns" @click="distributeExpense">Cerrar y distribuir expensa</q-btn>
        <ConfirmDialog :prompt="showConfirm" :message="confirmMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
        <ExpForm ref="refExpForm"></ExpForm>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import ExpForm from './ExpForm/index.vue'

const refExpForm = ref()

const showForm = ref(false)
const showConfirm = ref(false)
const confirmMessage = ref()
const onAcceptDialog = ref()
const onCancelDialog = ref()

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
const sumPendings = () => {
    const arr = appStore.state.detailsByExp
    if (!arr) return
    const total = arr.reduce((sum, o) => {
        sum = sum + ((o.payMode === 'Pendiente') ? o.amount : 0)
        console.log('sum:', sum)
        return sum
    }, 0)
    return total
}
const sumPaid = () => {
    const arr = appStore.state.detailsByExp
    if (!arr) return
    const total = arr.reduce((sum, o) => {
        const paidFlag = (o.payMode !== 'Pendiente')
        const res = sum + (paidFlag ? o.amount : 0)
        console.log('sum:', res)
        return res
    }, 0)
    return total
}
const sum = () => {
    const arr = appStore.state.detailsByExp
    if (!arr) return
    const total = arr.reduce((sum, o) => {
        const res = sum + o.amount
        return res
    }, 0)
    return total
}
</script>

<style scoped>
.matrix {
    position: relative;
    background-color: white;
    max-width: 800px;
    margin: auto;
    margin-top: 50px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
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

.rowDetail {
    display: grid;
    grid-template-columns: 180px 300px 70px 100px 50px;
    align-items: center;
    width: 800px;
    column-gap: 20px;
    padding: 5px 15px;
    border-bottom: 1px solid gray;
}

.total {
    position: relative;
    background: lightyellow !important;
    font-weight: bold;
    height: 40px;
}

.encabezado {
    background-color: lightblue;
    font-weight: bold;
    border-radius: 10px 10px 0 0;
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
    right: 8px;
    bottom: 8px;
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

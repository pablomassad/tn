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
            <div v-for="item in appStore.state.details" :key="item">
                <div class="rowDetail">
                    <div class="texto">{{ item.concept }}</div>
                    <div class="texto">{{ item.description }}</div>
                    <div class="precio">{{ item.amount.toFixed(2) }}</div>
                    <div class="texto">{{ item.payMode }}</div>
                    <div class="btn" @click="editItem(item)">
                        <q-icon name="edit" class="btnIcon"></q-icon>
                    </div>
                </div>
            </div>
            <div class="rowDetail total">
                <div class="central">TOTAL</div>
                <div></div>
                <div class="precio">{{ sumItems()?.toFixed(2) }}</div>
                <q-btn glossy round color="primary" icon="add" @click="createItem" class="addBtn"></q-btn>
            </div>
        </div>
        <ExpForm ref="refExpForm"></ExpForm>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import ExpForm from './ExpForm/index.vue'

const refExpForm = ref()

onMounted(async () => {
    console.log('Details onMounted')
    appStore.actions.admin.monitorDetails()
})
const createItem = () => {
    refExpForm.value.show()
}
const editItem = (item) => {
    refExpForm.value.show(item)
}
const sumItems = () => {
    const arr = appStore.state.details
    if (!arr) return
    const total = arr.reduce((sum, o) => sum + o.amount, 0)
    return total
}
</script>

<style scoped>
.matrix {
    position: relative;
    background-color: white;
    max-width: 720px;
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
    grid-template-columns: 100px 300px 70px 100px 50px;
    align-items: center;
    width: 720px;
    column-gap: 20px;
    padding: 5px 15px;
    border-bottom: 1px solid gray;
}

.total {
    position: relative;
    background: lightyellow !important;
    font-weight: bold;
    height: 60px;
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

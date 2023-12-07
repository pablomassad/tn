<template>
    <div>
        <div class="title">
            Expensa {{ appStore.actions.expenses.evalExpName(appStore.state.selExpense.id) }}
        </div>
        <div class="matrix">
            <div class="rowDetail encabezado">
                <div class="texto">Propietarios</div>
                <div class="precio">Importe</div>
                <div class="interes">Interes</div>
                <div class="precio">Pagado</div>
                <div class="precio">Deuda</div>
                <div class="central">Estado</div>
            </div>
            <div class="expensesList">
                <div v-for="item in appStore.state.userExpenses" :key="item">
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
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import appStore from 'src/pages/appStore'
import BtnIcon from 'src/components/BtnIcon.vue'

onMounted(async () => {
    console.log('Monitor Expenses onMounted')
    appStore.actions.admin.monitorUserExpenses()
})

</script>

<style scoped>
.expensesList {
    height: calc(100vh - 320px);
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
    max-width: 1000px;
    margin: auto;
    margin-top: 50px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.detailsList {
    height: calc(100vh - 420px);
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

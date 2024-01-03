<template>
    <div>
        RECURRENTES
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ui } from 'fwk-q-ui'
import appStore from 'src/pages/appStore'
import BtnIcon from 'src/components/BtnIcon.vue'
import Receipts from 'src/components/Receipts.vue'
import StatusLed from 'src/components/StatusLed.vue'
import Validation from 'src/components/Validation.vue'
import SortColumn from 'src/components/SortColumn.vue'

const showDetails = ref({})

onMounted(async () => {
    ui.actions.setTitle('Gestión de recurrentes')
    console.log('Recurrents onMounted')
    appStore.actions.getRecurrents()
})
onUnmounted(() => {
})

const toggleReceipts = async (uExp) => {
    appStore.set.selUserExpense(uExp)
    showDetails.value[uExp.id] = !showDetails.value[uExp.id]
}
</script>

<style scoped>
.userForm {
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
    padding: 50px;
    background-color: white;
    margin: auto;
    display: grid;
    grid-template-columns: 110px 350px 90px 70px;
    align-items: center;
    margin-top: 20px;
    max-width: 720px;
}

.matrix {
    position: relative;
    background-color: white;
    max-width: 1260px;
    margin: auto;
    margin-top: 50px;
    border-radius: 10px;
    box-shadow: 1px 1px 5px gray;
}

.expensa {
    grid-template-columns: 120px 100px 100px 100px 100px 100px 100px 100px 100px 100px 100px 60px 70px;
    width: 1260px;
}

.label {
    font-weight: bold;
    font-size: 20px;
}

.value {
    font-size: 18px;
    color: #555;
}

.interes {
    text-align: center;
}

.pagado {
    background-color: green;
}
</style>

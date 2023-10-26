<template>
    <div class="backLogin">
        <div class="logoFrame">
            <img src="images/tn.png" class="logo">
        </div>
        <div class="matrix" v-if="lotes">
            <div v-for="(unit, i) in lotes" :key="unit" class="lote" @click="selectLote(unit, i)" :class="{'selLote': (appStore.state.selLote?.id == (i + 1))}">
                <div class="numLote">{{ i + 1 }}</div>
            </div>
        </div>
        <div class="grdLogin">
            <q-input color="black" bg-color="white" type="password" filled v-model="pwd" label="Ingrese contraseña" @keyup.enter="validateLote" class="doc" />
            <q-btn color="blue-8" icon="login" @click="validateLote" class="login" :disable="!appStore.state.selLote" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import { useRouter } from 'vue-router'
import { ui } from 'fwk-q-ui'

const router = useRouter()
const lotes = ref()
const pwd = ref()

onMounted(async () => {
    lotes.value = await appStore.actions.getLotes()
    if (appStore.state.selLote) validateLote()
})
const selectLote = (lote, i) => {
    console.log('i: ', i)
    appStore.set.selLote(lote)
}
const validateLote = async () => {
    const data = await appStore.actions.validateLote()
    if (data.length) {
        router.go(-1)
    } else {
        ui.actions.notify('No se ha podido validar el lote. Por favor comunicarse con TN.', 'error')
    }
}
</script>

<style scoped lang="scss">
.matrix {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    align-items: center;
    justify-items: center;
    max-width: 400px;
    margin: auto;
    row-gap: 10px;
}

.lote {
    border-radius: 10px;
    box-shadow: 2px 2px 5px black;
    color: white;
    text-shadow: 1px 1px 1px black;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin: 5px;
    padding: 2px;
    background-color: #168b2b;
    width: 36px;
    height: 36px;
}

.lote:active {
    box-shadow: inset 3px 3px 3px black;
    margin-top: 3px;
    background-color: #fdbd27;
}

.selLote {
    box-shadow: inset 3px 3px 3px #550606;
    margin-top: 3px;
    background-color: #dd1c1c;
}

.logoFrame {
    position: relative;
    width: 100%;
    padding-top: 15%;
    height: 45vw;
}

.logo {
    position: absolute;
    top: 10%;
    right: 0;
    left: 0;
    margin: auto;
    width: 70vw;
    max-width: 500px;
    box-shadow: 10px 10px 20px #004180;
    border-radius: 20px;
}

.backLogin {
    background: linear-gradient(#1c87dd, #023055);
    margin: 0;
    padding: 0;
    position: relative;
    height: 100vh;
    width: 100vw;
}

.grdLogin {
    display: grid;
    grid-template-columns: 1fr 50px;
    align-items: center;
    width: 300px;
    margin: auto;
    column-gap: 10px;
    margin-top: 60px;
}

.doc {
    margin: auto;
    width: 100%;
}

.login {
    height: 50px;
}

@media screen and(min-width: 800px) {
    .logoFrame {
        height: 360px;
    }
}
</style>

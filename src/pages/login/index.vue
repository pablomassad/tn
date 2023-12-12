<template>
    <div class="backLogin">
        <div class="logoFrame">
            <img src="images/tn.png" class="logo">
        </div>
        <div class="grdLogin">
            <q-select filled bg-color="white" :options="owners" behavior="menu" label="Seleccione propietario" autocomplete use-input input-debounce="0" @filter="filterFn" v-model="localUnit" option-label="ownerNames" option-value="id" @update:model-value="onSelUnit"></q-select>
            <div v-if="localUnit">
                <q-input color="black" bg-color="white" type="password" filled v-model="pwd" label="Ingrese contraseña" class="doc" @keyup.enter="login" />
                <q-input v-if="!localUnit.pwd" color="black" bg-color="white" type="password" filled v-model="pwdCopy" label="Ingrese nuevamente" @keyup.enter="login" class="doc" />
            </div>
            <q-btn color="blue-8" icon="login" @click="login" class="login" :disable="!localUnit" :label="lblLogin" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from 'src/pages/appStore'
import { useRouter } from 'vue-router'
import { ui } from 'fwk-q-ui'

const router = useRouter()
const pwd = ref()
const pwdCopy = ref()
const localUnit = ref()
const owners = ref()
const lblLogin = ref('Login')

onMounted(async () => {
    await appStore.actions.getUnits()
    if (appStore.state.selUnit) router.go(-1)
})
const filterFn = (val, update) => {
    if (val === '') {
        update(() => {
            owners.value = appStore.state.units
        })
        return
    }
    update(() => {
        const needle = val.toLowerCase()
        owners.value = appStore.state.units.filter(item => item.ownerNames.toLowerCase().indexOf(needle) > -1)
    })
}
const onSelUnit = (e) => {
    console.log(e.id)
    localUnit.value = e
    if (!localUnit.value.pwd) {
        ui.actions.notify('Bienvenido!. Ingrese una contraseña.', 'info')
        lblLogin.value = 'Registrarse'
    }
}
const login = async () => {
    appStore.set.selUnit(localUnit.value)
    if (!localUnit.value.pwd) {
        if (pwd.value !== pwdCopy.value) {
            ui.actions.notify('Las contraseñas no coinciden!, vuelva a intentarlo.', 'warning')
        } else {
            await appStore.actions.updateLoginInfoUnit(pwd.value)
            ui.actions.notify('Se ha registrado el usuario y su contraseña!', 'success')
        }
    }
    const data = await appStore.actions.login(localUnit.value, pwd.value)
    if (data) {
        router.go(-1)
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
    padding-top: 72%;

    @media screen and(min-width: 720px) {
        padding-top: 550px;
    }
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
    align-items: center;
    max-width: 340px;
    width: 100%;
    margin: auto;
    row-gap: 10px;
    margin-top: 30px;
}

.doc {
    margin: auto;
    width: 100%;
}

.login {
    height: 50px;
}
</style>

<!--<div class="matrix" v-if="lotes && false">
            <div v-for="(unit, i) in lotes" :key="unit" class="lote" @click="selectLote(unit)" :class="{'selLote': (appStore.state.selLote?.id == (i + 1))}">
                <div class="numLote">{{ i + 1 }}</div>
            </div>
        </div>-->

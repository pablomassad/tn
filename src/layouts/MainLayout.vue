<template>
    <Layout isRoot>
        <template #drawer>
            <q-separator />
            <div class="menuRow" @click="gotoExpenses()">
                <q-icon name="update" class="iconMenu" />
                <div class="rowText">Expensas</div>
            </div>
            <q-separator />
            <div class="menuRow" @click="gotoTickets()">
                <q-icon name="request_quote" class="iconMenu" />
                <div class="rowText">Gastos</div>
            </div>
            <q-separator />
            <div class="menuRow" @click="gotoReports()">
                <q-icon name="checklist" class="iconMenu" />
                <div class="rowText">Resumenes Liquidación</div>
            </div>
            <q-separator />
            <div v-if="appStore.state.selUnit.role === 'admin'">
                <div class="menuRow" @click="gotoAdmin()">
                    <q-icon name="admin_panel_settings" class="iconMenu" />
                    <div class="rowText">Administración</div>
                </div>
                <q-separator />
            </div>
            <div v-if="main.state.isMobile">
                <div class="menuRow" @click="searchUpdates()">
                    <q-icon name="update" class="iconMenu" />
                    <div class="rowText">Buscar actualización</div>
                </div>
                <q-separator />
            </div>
            <div class="menuRow" @click="logout()">
                <q-icon name="logout" class="iconMenu" />
                <div class="rowText">Salir</div>
            </div>
            <q-separator />
        </template>
    </Layout>
    <div class="logoFrame">
        <img src="images/tn.png" class="logo" />
    </div>
    <ConfirmDialog :prompt="prompt" :message="dialogMessage" :onCancel="onCancelDialog" :onAccept="onAcceptDialog" />
</template>

<script setup>
import { ref } from 'vue'
import Layout from './fwk-q-layout/index.vue'
import appStore from 'src/pages/appStore'
import ConfirmDialog from 'fwk-q-confirmdialog'
import { ENVIRONMENTS } from 'src/environments'
import { LocalStorage } from 'quasar'
import { ui } from 'fwk-q-ui'
import { main } from 'fwk-q-main'
import { useRouter } from 'vue-router'

const router = useRouter()
const prompt = ref(false)
const dialogMessage = ref('')
const onAcceptDialog = ref()
const onCancelDialog = ref()

const gotoExpenses = () => {
    router.push('/userExpenses')
}
const gotoTickets = () => {
    router.push('/tickets')
}
const gotoAdmin = () => {
    router.push('/admin')
}
const gotoReports = () => {
    router.push('/reports')
}
const searchUpdates = () => {
    if (ENVIRONMENTS.versionName < appStore.state.settings.version || !main.state.isMobile) {
        prompt.value = true
        dialogMessage.value = 'Hay una nueva version de la aplicación, desea instalarla?'
        onAcceptDialog.value = async () => {
            window.open(appStore.state.settings.url, '_system')
        }
        onCancelDialog.value = () => {
            prompt.value = false
        }
    } else { ui.actions.notify('No hay nuevas actualizaciones!', 'info', { position: 'center' }) }
}
const logout = () => {
    LocalStorage.set('TN_selUnit', '')
    window.location.reload()
}
</script>

<style lang="scss" scoped>
.logoFrame {
    position: fixed;
    top: -12px;
    right: 62px;
    width: 100px;
    height: 76px;
    overflow: hidden;
    z-index: 6000;
}

.logo {
    width: 100px;
}

.menuRow {
    display: flex;
    align-items: center;
    margin: 10px;
    width: 200px;
}

.rowText {
    font-size: 15px;
    color: gray;
}

.iconMenu {
    font-size: 26px;
    text-shadow: 1px 1px 1px gray;
    margin-right: 10px;
    color: rgb(38, 81, 181);
}

.body--dark {

    .iconMenu {
        color: #97b6ff;
    }

    .rowText {
        color: white;
    }

    .env {
        color: white;
    }

}
</style>

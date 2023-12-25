<template>
    <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { main } from 'fwk-q-main'
import { useRouter } from 'vue-router'
import appStore from 'src/pages/appStore'
import { ENVIRONMENTS } from './environments'

const router = useRouter()

onMounted(() => {
    const pl = {
        info: {
            legajo: 'U506713',
            legajoCSG: '21SAD026',
            mockmode: false,
            isMobile: false,
            appname: 'tn',
            origApp: 'tn',
            tool: '/userExpenses'
        }
    }
    main.actions.init(ENVIRONMENTS, pl, true)
})

watch(() => main.state.info, async (newVal, oldVal) => {
    console.log('watch main.state.info...', newVal)
    await appStore.actions.getSettings()
    if (!appStore.state.selUnit) {
        router.push('/login')
    } else {
        router.push(newVal.tool)
    }
})
</script>

<style scoped ></style >

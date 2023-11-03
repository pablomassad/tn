import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { LocalStorage } from 'quasar'
import { ENVIRONMENTS } from 'src/environments'

fb.initFirebase(ENVIRONMENTS.firebase)

const state = reactive({
    path: undefined,
    config: undefined,
    selLote: undefined,
    document: LocalStorage.getItem('TN_lote'),
    loginOK: false,
    expensas: [
        { expensa: 'Octubre 2023', importe: 54750.0, interes: 0, saldo: 0, estado: false },
        { expensa: 'Setiembre 2023', importe: 53550.0, interes: 0, saldo: 0, estado: true },
        { expensa: 'Agosto 2023', importe: 49100.0, interes: 0, saldo: 0, estado: true },
        { expensa: 'Julio 2023', importe: 25680.0, interes: 0, saldo: 0, estado: true },
        { expensa: 'junio 2023', importe: 24876.0, interes: 0, saldo: 0, estado: true }
    ]
})
const set = {
    settings (o) {
        console.log('store set.settings:', o)
        state.settings = o
    },
    loginOK (o) {
        console.log('store set.loginOK:', o)
        state.loginOK = o
    },
    selLote (l) {
        console.log('store set.selLote:', l)
        state.selLote = l
    },
    path (p) {
        console.log('store set path:', p)
        state.path = p
    },
    config (cfg) {
        console.log('store config:', cfg)
        state.config = cfg
    }
}
const actions = {
    async initApp () {
        const setting = await fb.getDocument('settings', ENVIRONMENTS.lugar)
        set.config(setting)
        set.path(`settings/${ENVIRONMENTS.lugar}`)
    },
    async findOwner (lote) {
        set.selLote(lote)
        const units = await fb.getCollectionFlex(`${state.path}/units`, { field: 'id', val: lote.unitId })
        return units[0].ownerNames
    },
    async subscribeToFCM () {
        const vapidKey = 'BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP-CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4'
        await fb.saveMessagingDeviceToken(state.document, vapidKey, state.document)
    },
    async getLotes () {
        const path = `${state.path}/lotes`
        console.log('path:', path)
        const result = await fb.getCollection(path)
        const sorted = result.sort((a, b) => Number(a.id) - Number(b.id))
        return sorted
    },
    async validateLote (lote) {
        console.log('store validateLote:', lote)
    }
}

export default {
    set,
    state: readonly(state),
    actions
}

//    async createLotesCol() {
//    for (let index = 1; index <= 48; index++) {
//        const lote = {
//            id: index.toString(),
//            unitId: index.toString()
//        }
//        const path = `${state.path}/lotes`
//        await fb.setDocument(path, lote, lote.id)
//        console.log('lote creado:', lote)
//    }
// },

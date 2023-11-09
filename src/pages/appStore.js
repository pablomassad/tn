import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { LocalStorage } from 'quasar'
import { ENVIRONMENTS } from 'src/environments'

fb.initFirebase(ENVIRONMENTS.firebase)

const state = reactive({
    settings: undefined,
    path: undefined,
    units: undefined,
    selUnit: LocalStorage.getItem('TN_selUnit'),
    expensas: [
        { expensa: 'Octubre 2023', importe: 54750.0, interes: 0, saldo: 0, estado: false },
        { expensa: 'Setiembre 2023', importe: 53550.0, interes: 0, saldo: 0, estado: true },
        { expensa: 'Agosto 2023', importe: 49100.0, interes: 0, saldo: 0, estado: true },
        { expensa: 'Julio 2023', importe: 25680.0, interes: 0, saldo: 0, estado: true },
        { expensa: 'junio 2023', importe: 24876.0, interes: 0, saldo: 0, estado: true }
    ]
})
const set = {
    selUnit (o) {
        console.log('store set.selUnit:', o)
        state.selUnit = o
        LocalStorage.set('TN_selUnit', o)
    },
    units (u) {
        console.log('store units:', u)
        state.units = u
    },
    path (p) {
        console.log('store set path:', p)
        state.path = p
    },
    settings (cfg) {
        console.log('store settings:', cfg)
        state.settings = cfg
    }
}
const actions = {
    async getSettings () {
        const cfg = await fb.getDocument('settings', ENVIRONMENTS.lugar)
        set.settings(cfg)
        set.path(`settings/${ENVIRONMENTS.lugar}`)
    },
    async getUnits () {
        const units = await fb.getCollection(`${state.path}/units`)
        set.units(units)
        return units
    },
    async updateUnit (unit, pwd) {
        set.selUnit(unit)
        state.selUnit = { ...state.selUnit, pwd }
        ui.actions.showLoading()
        await fb.setDocument(`${state.path}/units`, state.selUnit, state.selUnit.id)
        ui.actions.hideLoading()
    },
    async login (unit, pwd) {
        if (state.selUnit.pwd === pwd) {
            ui.actions.showLoading()
            set.selUnit(unit)
            await fb.setDocument(`${state.path}/units`, unit, unit.id)
            ui.actions.hideLoading()
            ui.actions.notify('Bienvenido ' + unit.ownerNames, 'success')
            return true
        } else { ui.actions.notify('Contraseña incorrecta!. Intente nuevamente o comunicarse con el administrador', 'error') }
    },
    async subscribeToFCM () {
        const vapidKey = 'BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP-CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4'
        await fb.saveMessagingDeviceToken(state.document, vapidKey, state.document)
    },
    async uploadFile (file, fn) {
        await fb.uploadFile(file, fn)
        console.log('store uploadFile finished:', fn)
    },
    async validateOwner (lote) {
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
//    async getLotes() {
//    const path = `${state.path}/lotes`
//    console.log('path:', path)
//    const result = await fb.getCollection(path)
//    const sorted = result.sort((a, b) => Number(a.id) - Number(b.id))
//    return sorted
// },

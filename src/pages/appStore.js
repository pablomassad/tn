import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { LocalStorage } from 'quasar'
import { ENVIRONMENTS } from 'src/environments'
import moment from 'moment'

fb.initFirebase(ENVIRONMENTS.firebase)

const state = reactive({
    settings: undefined,
    path: undefined,
    units: undefined,
    selUnit: LocalStorage.getItem('TN_selUnit'),
    expenses: undefined,
    comps: undefined,
    myLocale: {
        days: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split(
            '_'
        ),
        daysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
        months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split(
            '_'
        ),
        monthsShort:
            'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split(
                '_'
            ),
        firstDayOfWeek: 1
    }
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
    expenses (exps) {
        console.log('store expenses:', exps)
        const arr = exps.map(e => {
            e.expName = evalExpName(e.id)
            return e
        })
        state.expenses = exps
    },
    comps (c) {
        console.log('store cmps:', c)
        state.comps = c
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
    async saveComp (expId, comp, file) {
        console.log('store saveComp:', file.name, comp)
        ui.actions.showLoading()
        const folder = `expenses/attachments/${state.selUnit.id}/${expId}/${file.name}`
        console.log('sto folder:', folder)
        const url = await fb.uploadFile(file, folder)
        comp.attachmentUrl = url
        comp.amount = Number(comp.amount)
        comp.datetime = new Date().getTime() // moment(comp.date, 'DD-MM-YYYY').unix() * 1000
        await fb.setDocument(`${state.path}/units/${state.selUnit.id}/expenses/${expId}/comps`, comp, comp.datetime.toString())
        ui.actions.hideLoading()
    },
    async removeComp (expId, comp) {
        console.log('store removeComp:', comp.id)
        await fb.deleteDocument(`${state.path}/units/${state.selUnit.id}/expenses/${expId}/comps`, comp.id)
    },
    async validateOwner (lote) {
        console.log('store validateLote:', lote)
    },
    async getExpenses () {
        const result = await fb.getCollection(`${state.path}/units/${state.selUnit.id}/expenses`)
        set.expenses(result)
        return result
    },
    async getCompsByExp (expId) {
        const path = `${state.path}/units/${state.selUnit.id}/expenses/${expId}/comps`
        console.log('comps path:', path)
        const comps = await fb.getCollection(path)
        set.comps(comps)
        return comps
    }
}

export default {
    set,
    state: readonly(state),
    actions
}

const evalExpName = (expId) => {
    const year = expId.substr(0, 2)
    const monthNum = expId.substr(2, 2)
    const month = state.myLocale.months[monthNum - 1]
    const expName = `${month} 20${year}`
    console.log('expName:', expName)
    return expName
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

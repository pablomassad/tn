import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { LocalStorage } from 'quasar'
import { ENVIRONMENTS } from 'src/environments'
import moment from 'moment'

fb.initFirebase(ENVIRONMENTS.firebase)

const unsubListeners = []

const state = reactive({
    master: true,
    settings: undefined,
    path: undefined,
    units: undefined,
    selUnit: LocalStorage.getItem('TN_selUnit'),
    selExpense: undefined,
    expenses: undefined,
    compsByExp: {},
    unsubListeners: [],
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
    selExpense (o) {
        console.log('store set.selExpense:', o)
        state.selExpense = o
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
    path (p) {
        console.log('store set path:', p)
        state.place = p
    },
    settings (cfg) {
        console.log('store settings:', cfg)
        state.settings = cfg
    }
}
const actions = {
    async getSettings () {
        console.log('store getSettings')
        const cfg = await fb.getDocument('settings', ENVIRONMENTS.lugar)
        set.settings(cfg)
        set.path(`settings/${ENVIRONMENTS.lugar}`)
    },
    async getUnits () {
        const units = await fb.getCollection(`${state.place}/units`)
        set.units(units)
        return units
    },
    async updateUnit (pwd) {
        state.selUnit = { ...state.selUnit, pwd }
        ui.actions.showLoading()
        await fb.setDocument(`${state.place}/units`, state.selUnit, state.selUnit.id)
        ui.actions.hideLoading()
    },
    async login (unit, pwd) {
        if (state.selUnit.pwd === pwd) {
            ui.actions.showLoading()
            set.selUnit(unit)
            await fb.setDocument(`${state.place}/units`, unit, unit.id)
            ui.actions.hideLoading()
            ui.actions.notify('Bienvenido ' + unit.ownerNames, 'success')
            return true
        } else { ui.actions.notify('Contraseña incorrecta!. Intente nuevamente o comunicarse con el administrador', 'error') }
    },
    async subscribeToFCM () {
        const vapidKey = 'BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP-CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4'
        await fb.saveMessagingDeviceToken(state.document, vapidKey, state.document)
    },
    expenses: {
        async monitorExpensesByUnit () {
            const path = `${state.place}/units/${state.selUnit.id}/expenses`
            const colRef = fb.getCollectionRef(path)
            const us = fb.onSnapshot(colRef, (querySnapshot) => {
                const docs = querySnapshot.docs
                console.log('onSnapshot RT expensesByUnit', docs)
                const exps = docs.map(doc => ({ id: doc.id, ...doc.data() }))
                set.expenses(exps)
            })
            state.unsubListeners.push(us)
        },
        async monitorCompsByExp (expId) {
            if (!state.compsByExp[expId]) {
                const path = `${state.place}/units/${state.selUnit.id}/expenses/${expId}/comps`
                const colRef = fb.getCollectionRef(path)
                const us = fb.onSnapshot(colRef, (querySnapshot) => {
                    console.log('onSnapshot RT comps', querySnapshot.length)
                    state.compsByExp[expId] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                })
                state.unsubListeners.push(us)
            } else { console.log('monitorCompsByExp already EXIST!!!') }
        },
        unsubscribeListeners () {
            console.log('store usubscribeListeners')
            state.unsubListeners.forEach(us => us())
            state.unsubListeners = []
        },
        async saveComp (expId, comp, file) {
            console.log('store saveComp:', comp)
            ui.actions.showLoading()
            if (file) {
                const folder = `expenses/attachments/${state.selUnit.id}/${expId}/${file.name}`
                console.log('sto folder:', folder)
                const url = await fb.uploadFile(file, folder)
                comp.attachmentUrl = url
            }
            comp.amount = Number(comp.amount)
            comp.datetime = new Date().getTime() // moment(comp.date, 'DD-MM-YYYY').unix() * 1000

            await fb.transaction(async (transaction) => {
                console.log('comp.amount:', comp.amount)

                // LECTURAS PRIMERO
                let origAmount = 0
                const compRef = fb.getDocumentRef(`${state.place}/units/${state.selUnit.id}/expenses/${expId}/comps`, comp.id)
                if (comp.id) { // Modificacion de comp
                    const compSnapshot = await transaction.get(compRef)
                    origAmount = compSnapshot.data().amount
                    console.log('origAmout:', origAmount)
                } else {
                    comp.id = new Date().getTime()
                }
                const expensaRef = fb.getDocumentRef(`${state.place}/units/${state.selUnit.id}/expenses`, expId)
                const expensaSnapshot = await transaction.get(expensaRef)
                const newTotal = expensaSnapshot.data().paid + comp.amount - origAmount
                console.log('newTotal:', newTotal)

                const expGlobablRef = fb.getDocumentRef(`${state.place}/expenses`, expId)
                const expGlobalSnapshot = await transaction.get(expGlobablRef)
                const newExpTotal = expGlobalSnapshot.data().paid + comp.amount - origAmount
                console.log('newExpTotal:', newTotal)

                // ESCRITURAS DESPUES
                transaction.set(compRef, comp, { merge: true }) // { amount: origAmount })
                transaction.update(expensaRef, { paid: newTotal })
                transaction.update(expGlobablRef, { paid: newExpTotal })
            })
            ui.actions.hideLoading()
        },
        async removeComp (expId, comp) {
            console.log('store removeComp:', comp.id)
            ui.actions.showLoading()
            await fb.deleteDocument(`${state.place}/units/${state.selUnit.id}/expenses/${expId}/comps`, comp.id)
            ui.actions.hideLoading()
        }
    },
    tickets: {
        async getTicketsByUnit () {
            const path = `${state.place}/tickets`
            const tks = await fb.getCollection(path)
            console.log('store getTicketByUnit:', tks)
            return tks
        },
        async save (tk, file) {
            console.log('store saveTicket:', tk)
            ui.actions.showLoading()
            if (file) {
                const folder = `tickets/attachments/${file.name}`
                console.log('sto folder:', folder)
                const url = await fb.uploadFile(file, folder)
                tk.attachmentUrl = url
            }
            tk.amount = Number(tk.amount)
            tk.datetime = new Date().getTime() // moment(comp.date, 'DD-MM-YYYY').unix() * 1000
            const id = tk.id || tk.datetime.toString()
            console.log('save ticket:', id)
            await fb.setDocument(`${state.place}/tickets`, tk, id)
            ui.actions.hideLoading()
        },
        async remove (tk) {
            console.log('store removeTicket:', tk.id)
            ui.actions.showLoading()
            await fb.deleteDocument(`${state.place}/tickets`, tk.id)
            ui.actions.hideLoading()
        }
    },
    admin: {
        async getExpenses () {
            const result = await fb.getCollection(`${state.place}/expenses`)
            set.expenses(result)
            return result
        }
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
//        const path = `${state.place}/lotes`
//        await fb.setDocument(path, lote, lote.id)
//        console.log('lote creado:', lote)
//    }
// },
//    async getLotes() {
//    const path = `${state.place}/lotes`
//    console.log('path:', path)
//    const result = await fb.getCollection(path)
//    const sorted = result.sort((a, b) => Number(a.id) - Number(b.id))
//    return sorted
// },

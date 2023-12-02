import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { LocalStorage } from 'quasar'
import { ENVIRONMENTS } from 'src/environments'
import moment from 'moment'

fb.initFirebase(ENVIRONMENTS.firebase)

const unsubListeners = []

let usExpenses
let usDetails

const state = reactive({
    master: true,
    settings: undefined,
    units: undefined,
    selUnit: LocalStorage.getItem('TN_selUnit'),
    selExpense: undefined,
    details: undefined,
    detailsByExp: undefined,
    pendingTickets: undefined,
    expenses: undefined,
    tickets: undefined,
    compsByExp: {},
    unsubListeners: [],
    payModes: ['Pendiente', 'Efectivo', 'Transferencia', 'Debito Auto', 'Cheque'],
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
    },
    years: [
        { id: 2023, name: '2023' },
        { id: 2024, name: '2024' },
        { id: 2025, name: '2025' },
        { id: 2026, name: '2026' },
        { id: 2027, name: '2027' },
        { id: 2028, name: '2028' }
    ],
    months: [
        { id: 1, name: 'enero' },
        { id: 2, name: 'febrero' },
        { id: 3, name: 'marzo' },
        { id: 4, name: 'abril' },
        { id: 5, name: 'mayo' },
        { id: 6, name: 'junio' },
        { id: 7, name: 'julio' },
        { id: 8, name: 'agosto' },
        { id: 9, name: 'setiembre' },
        { id: 10, name: 'octubre' },
        { id: 11, name: 'noviembre' },
        { id: 12, name: 'diciembre' }
    ]
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
    details (o) {
        console.log('store set.details:', o)
        state.details = o
    },
    detailsByExp (o) {
        console.log('store set.detailsByExp:', o)
        state.detailsByExp = o
    },
    units (u) {
        console.log('store units:', u)
        state.units = u
    },
    expenses (exps) {
        console.log('store expenses:', exps)
        const arr = exps.map(e => {
            e.expName = actions.expenses.evalExpName(e.id)
            return e
        })
        state.expenses = exps
    },
    tickets (tks) {
        console.log('store expenses:', tks)
        state.tickets = tks
    },
    settings (cfg) {
        console.log('store settings:', cfg)
        state.settings = cfg
    },
    pendingTickets (tks) {
        console.log('store pendingTickets:', tks)
        state.pendingTickets = tks
    }
}
const actions = {
    expenses: {
        evalExpName (expId) {
            const year = expId.substr(0, 2)
            const monthNum = expId.substr(2, 2)
            const month = state.myLocale.months[monthNum - 1]
            const expName = `${month} 20${year}`
            console.log('expName:', expName)
            return expName
        },
        async monitorExpensesByUnit () {
            console.log('store monitorExpensesByUnit')
            const path = `units/${state.selUnit.id}/expenses`
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
                const path = `units/${state.selUnit.id}/expenses/${expId}/comps`
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
            await fb.transaction(async (transaction) => {
                console.log('comp.amount:', comp.amount)
                let origAmount = 0
                let id
                if (!comp.id) id = new Date().getTime().toString()

                // LECTURAS PRIMERO
                const compRef = fb.getDocumentRef(`units/${state.selUnit.id}/expenses/${expId}/comps`, id)
                if (comp.id) { // Modificacion de comp
                    const compSnapshot = await transaction.get(compRef)
                    origAmount = compSnapshot.data().amount
                    console.log('origAmout:', origAmount)
                }

                const expensaRef = fb.getDocumentRef(`units/${state.selUnit.id}/expenses`, expId)
                const expensaSnapshot = await transaction.get(expensaRef)
                const newTotal = expensaSnapshot.data().paid + comp.amount - origAmount
                console.log('newTotal:', newTotal)

                const expGlobablRef = fb.getDocumentRef('expenses', expId)
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
            await fb.deleteDocument(`units/${state.selUnit.id}/expenses/${expId}/comps`, comp.id)
            ui.actions.hideLoading()
        }
    },
    tickets: {
        async getTickets () {
            const path = 'tickets'
            const tks = await fb.getCollection(path)
            console.log('store getTickets:', tks)
            set.tickets(tks)
        },
        async getTicketsByUnit () {
            const path = 'tickets'
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
            await fb.setDocument('tickets', tk, id)
            ui.actions.hideLoading()
        },
        async remove (tk) {
            console.log('store removeTicket:', tk.id)
            ui.actions.showLoading()
            await fb.deleteDocument('tickets', tk.id)
            ui.actions.hideLoading()
        }
    },
    admin: {
        async monitorExpenses () {
            if (!usExpenses) {
                const colRef = fb.getCollectionRef('expenses')
                usExpenses = fb.onSnapshot(colRef, (querySnapshot) => {
                    const docs = querySnapshot.docs
                    console.log('onSnapshot RT Expenses', docs)
                    const res = docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    set.expenses(res)
                })
            }
        },
        async monitorDetails () {
            if (!usDetails) {
                console.log('store monitorDeatils: selExpense:', state.selExpense)
                const colRef = fb.getCollectionRef('details')
                usDetails = fb.onSnapshot(colRef, (querySnapshot) => {
                    const docs = querySnapshot.docs
                    console.log('onSnapshot RT Details', docs)
                    const res = docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    set.details(res)
                })
            }
        },
        async getDetailsByExp () {
            const details = await fb.getCollectionFlex('details', { field: 'idExp', val: state.selExpense.id })
            set.detailsByExp(details)
        },
        async getPendingTickets () {
            const path = 'tickets'
            const tks = await fb.getCollectionFlex(path, { field: 'checked', val: false })
            console.log('store getPendingTickets:', tks)
            set.pendingTickets(tks)
        },
        async distributeExpense () {
            // actualiza campos de la expensa y los guarda
            // crea userExpenses correspondientes a cada propietario
        },
        async removeDetail (detail) {
            ui.actions.showLoading()
            await fb.deleteDocument('details', detail.id)
            ui.actions.hideLoading()
        },
        async createExpense (y, m) {
            const id = y.substr(2, 2) + String(m).padStart(2, '0')
            console.log('id:', id)
            const data = await fb.getDocument('expenses', id)
            if (data) {
                ui.actions.notify('La expensa ya existe!', 'info')
            } else {
                const o = {
                    total: 0,
                    paid: 0,
                    balance: 0,
                    amount: 0
                }
                await fb.setDocument('expenses', o, id)
            }
        },
        async saveDetail (item) {
            await fb.setDocument('details', item, item.id)
            actions.admin.getDetailsByExp()
        }
    },
    async moveData () {
        // const cfg = await fb.getDocument('settings', 'terranostra')
        // await fb.setDocument('tn', cfg, 'settings')

        // const col = 'timeLogs'
        // const dbPath = `settings/terranostra/${col}`
        // console.log('dbPath:', dbPath)
        // const res = await fb.getCollection(dbPath)
        // console.log('res:', res.length)
        // for (const o of res) {
        //    const moved = await fb.setDocument(col, o, o.id)
        //    console.log('id:', o.id)
        // }
    },
    async getSettings () {
        console.log('store getSettings')
        const cfg = await fb.getDocument('settings', ENVIRONMENTS.lugar)
        set.settings(cfg)
    },
    async getUnits () {
        const units = await fb.getCollection('units')
        set.units(units)
        return units
    },
    async updateUnit (pwd) {
        state.selUnit = { ...state.selUnit, pwd }
        ui.actions.showLoading()
        await fb.setDocument('units', state.selUnit, state.selUnit.id)
        ui.actions.hideLoading()
    },
    async login (unit, pwd) {
        if (state.selUnit.pwd === pwd) {
            ui.actions.showLoading()
            set.selUnit(unit)
            await fb.setDocument('units', unit, unit.id)
            ui.actions.hideLoading()
            ui.actions.notify('Bienvenido ' + unit.ownerNames, 'success')
            return true
        } else { ui.actions.notify('Contraseña incorrecta!. Intente nuevamente o comunicarse con el administrador', 'error') }
    },
    async subscribeToFCM () {
        const vapidKey = 'BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP-CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4'
        await fb.saveMessagingDeviceToken(state.document, vapidKey, state.document)
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
//        const path = `lotes`
//        await fb.setDocument(path, lote, lote.id)
//        console.log('lote creado:', lote)
//    }
// },
//    async getLotes() {
//    const path = `lotes`
//    console.log('path:', path)
//    const result = await fb.getCollection(path)
//    const sorted = result.sort((a, b) => Number(a.id) - Number(b.id))
//    return sorted
// },

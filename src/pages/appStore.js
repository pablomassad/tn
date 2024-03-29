import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { LocalStorage } from 'quasar'
import { ENVIRONMENTS } from 'src/environments'
import moment from 'moment'
import pdfSrv from 'fwk-pdf'
import { pdfGenerator } from 'src/pages/generator.js'

fb.initFirebase(ENVIRONMENTS.firebase)
pdfSrv.init()

const state = reactive({
    dateMask: 'DD/MM/YY',
    activeCol: undefined,
    master: true,
    settings: undefined,
    units: undefined,
    selUnit: LocalStorage.getItem('TN_selUnit'),
    selExpense: undefined,
    expenses: undefined,
    selUserExpense: undefined,
    userExpenses: undefined,
    detailsByExp: undefined,
    expensesByUnit: undefined,
    pendingTickets: undefined,
    selTicket: undefined,
    tickets: undefined,
    unsubListeners: {},
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
    activeCol (c) {
        console.log('store set.activeCol:', c)
        state.activeCol = c
    },
    unsubListeners (o) {
        state.unsubListeners = { ...state.unsubListeners, ...o }
        console.log('store set.unsubListeners:', state.unsubListeners)
    },
    selUnit (o) {
        console.log('store set.selUnit:', o)
        state.selUnit = o
        LocalStorage.set('TN_selUnit', o)
    },
    selExpense (o) {
        console.log('store set.selExpense:', o)
        state.selExpense = o
    },
    selUserExpense (o) {
        console.log('store set.selUserExpense:', o)
        state.selUserExpense = o
    },
    units (u) {
        console.log('store units:', u)
        state.units = u
    },
    expenses (exps) {
        console.log('store set.expenses:', exps)
        const arr = exps.map(e => {
            e.expName = actions.evalExpName(e.id)
            return e
        })
        state.expenses = exps
        if (state.selExpense) {
            const fndExp = exps.find(x => x.id === state.selExpense.id)
            set.selExpense(fndExp)
        }
    },
    detailsByExp (o) {
        console.log('store set.detailsByExp:', o)
        state.detailsByExp = o
    },
    userExpenses (o) {
        console.log('store set.userExpenses:', o)
        const arr = o.map(ue => {
            ue.expName = actions.evalExpName(ue.idExp)
            return ue
        })
        state.userExpenses = o
    },
    expensesByUnit (exps) {
        console.log('store set.expensesByUnit:', exps)
        const arr = exps.map(e => {
            e.expName = actions.evalExpName(e.idExp)
            return e
        })
        state.expensesByUnit = exps
        if (state.selUserExpense) {
            const fndExp = exps.find(x => x.id === state.selUserExpense.id)
            set.selUserExpense(fndExp)
        }
    },
    selTicket (tk) {
        console.log('store selTicket:', tk)
        state.selTicket = tk
    },
    tickets (tks) {
        console.log('store tickets:', tks)
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
    userExpenses: {
        async monitorExpensesByUnit () {
            console.log('store monitorExpensesByUnit')
            if (!state.unsubListeners.us_expensesByUnit) {
                const colRef = fb.getCollectionRefQuery('userExpenses', [{ field: 'idUnit', op: '==', val: state.selUnit.id }])
                const us = fb.onSnapshot(colRef, (querySnapshot) => {
                    const docs = querySnapshot.docs
                    const exps = docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    set.expensesByUnit(exps)
                })
                set.unsubListeners({ us_expensesByUnit: us })
            }
        },
        async getReceiptsByUserExp () {
            console.log('store getReceiptsByUserExp: ', state.selUserExpense.id)
            const res = await fb.getCollectionFlex('userExpenseReceipts', { field: 'idUsrExp', op: '==', val: state.selUserExpense.id })
            return res
        },
        async saveComp (comp, file, deleteFlag) {
            console.log('store saveComp:', comp)
            try {
                ui.actions.showLoading()
                if (file) {
                    const folder = `expenses/attachments/${state.selUnit.id}/${state.selUserExpense.id}/${file.name}`
                    console.log('sto folder:', folder)
                    const url = await fb.uploadFile(file, folder)
                    comp.attachmentUrl = url
                }
                if (deleteFlag) {
                    console.log('sto delete attachment:', comp.attachmentUrl)
                    await fb.deleteFile(comp.attachmentUrl)
                    comp.attachmentUrl = ''
                }
                comp.idUsrExp = state.selUserExpense.id
                comp.amount = Number(comp.amount)

                let id = comp.id
                if (!comp.id) id = new Date().getTime().toString()
                await fb.setDocument('userExpenseReceipts', comp, id)

                // await fb.transaction(async (transaction) => {
                //    let id = comp.id
                //    if (!comp.id) id = new Date().getTime().toString()

                //    // LECTURAS PRIMERO
                //    let origAmount = 0
                //    const compRef = fb.getDocumentRef('userExpenseReceipts', id)
                //    if (comp.id) { // Modificacion de comp
                //        const compSnapshot = await transaction.get(compRef)
                //        origAmount = compSnapshot.data().amount
                //        console.log('origAmout:', origAmount)
                //    }

                //    // const expensaRef = fb.getDocumentRef(`units/${state.selUnit.id}/expenses`, expId)
                //    // const expensaSnapshot = await transaction.get(expensaRef)
                //    // const newTotal = expensaSnapshot.data().paid + comp.amount - origAmount
                //    // console.log('newTotal:', newTotal)

                //    // const expGlobablRef = fb.getDocumentRef('expenses', expId)
                //    // const expGlobalSnapshot = await transaction.get(expGlobablRef)
                //    // const newExpTotal = expGlobalSnapshot.data().paid + comp.amount - origAmount
                //    // console.log('newExpTotal:', newTotal)

                //    // ESCRITURAS DESPUES
                //    transaction.set(compRef, comp, { merge: true }) // { amount: origAmount })
                //    // transaction.update(expensaRef, { paid: newTotal })
                //    // transaction.update(expGlobablRef, { paid: newExpTotal })
                // })
                ui.actions.hideLoading()
            } catch (e) {
                ui.actions.notify('Ha ocurrido un error al guardar el comprobante')
                console.log('Error transaction:', e)
            }
        },
        async removeComp (comp) {
            console.log('store removeComp:', comp.id)
            ui.actions.showLoading()
            await fb.deleteDocument('userExpenseReceipts', comp.id)
            ui.actions.hideLoading()
        },
        async toggleValidation (comp) {
            const cp = { ...comp }
            cp.isValid = !cp.isValid
            await fb.setDocument('userExpenseReceipts', cp, cp.id)
            await actions.userExpenses.getReceiptsByUserExp()
            console.log('toggle validation receipt:', cp)
        },
        sort (field, dir) {
            const arr = sortArray(state.expensesByUnit, field, dir)
            set.userExpenses(arr)
            set.activeCol(field)
        }
    },
    tickets: {
        async monitorTickets () {
            console.log('store monitorTickets')
            if (!state.unsubListeners.us_tickets) {
                const colRef = fb.getCollectionRefQuery('tickets', [{ field: 'idExp', op: '==', val: state.selExpense.id }])
                const us = fb.onSnapshot(colRef, (querySnapshot) => {
                    const docs = querySnapshot.docs
                    const tks = docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    set.tickets(tks)
                })
                set.unsubListeners({ us_tickets: us })
            }
        },
        async getReceiptsByTicket () {
            const path = 'ticketReceipts'
            let tks = []
            if (state.selTicket) {
                tks = await fb.getCollectionFlex(path, { field: 'idTicket', val: state.selTicket.id })
            }
            console.log('store ticket.getReceiptsByTicket', tks)
            return tks
        },
        async save (tk, file, deleteFlag) {
            console.log('store tickets.save:', tk)
            ui.actions.showLoading()
            if (file) {
                const folder = `tickets/attachments/${file.name}`
                console.log('sto folder:', folder)
                const url = await fb.uploadFile(file, folder)
                tk.attachmentUrl = url
            }
            if (deleteFlag) {
                console.log('sto delete attachment:', tk.attachmentUrl)
                await fb.deleteFile(tk.attachmentUrl)
                tk.attachmentUrl = ''
            }
            tk.amount = Number(tk.amount)
            tk.datetime = new Date().getTime() // moment(comp.date, 'DD-MM-YY').unix() * 1000
            tk.idExp = state.selExpense.id
            const id = tk.id || tk.datetime.toString()
            await fb.setDocument('tickets', tk, id)
            ui.actions.hideLoading()
        },
        async saveReceipt (comp, file) {
            console.log('store ticket.saveReceipt', comp)
            try {
                ui.actions.showLoading()
                if (file) {
                    const folder = `expenses/attachments/${state.selUnit.id}/${state.selTicket.id}/${file.name}`
                    console.log('sto folder:', folder)
                    const url = await fb.uploadFile(file, folder)
                    comp.attachmentUrl = url
                }
                comp.idTicket = state.selTicket.id
                comp.amount = Number(comp.amount)

                let id = comp.id
                if (!comp.id) id = new Date().getTime().toString()
                await fb.setDocument('ticketReceipts', comp, id)
                ui.actions.hideLoading()
            } catch (e) {
                ui.actions.notify('Ha ocurrido un error al guardar el comprobante')
                console.log('Error transaction:', e)
            }
        },
        async remove (tk) {
            console.log('store removeTicket:', tk.id)
            ui.actions.showLoading()
            await fb.deleteDocument('tickets', tk.id)
            ui.actions.hideLoading()
        },
        sort (field, dir) {
            const arr = sortArray(state.tickets, field, dir)
            set.tickets(arr)
            set.activeCol(field)
        }
    },
    admin: {
        async monitorExpenses () {
            console.log('store monitorExpenses')
            if (!state.unsubListeners.us_expenses) {
                const colRef = fb.getCollectionRef('expenses')
                const us = fb.onSnapshot(colRef, (querySnapshot) => {
                    const docs = querySnapshot.docs
                    const res = docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    set.expenses(res)
                })
                set.unsubListeners({ us_expenses: us })
            }
        },
        async monitorDetailsByExp () {
            console.log('store monitorDetailsByExp')
            if (!state.unsubListeners.us_detailsByExp) {
                const colRef = fb.getCollectionRefQuery('details', [{ field: 'idExp', op: '==', val: state.selExpense.id }])
                const us = fb.onSnapshot(colRef, (querySnapshot) => {
                    const docs = querySnapshot.docs
                    const res = docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    set.detailsByExp(res)
                })
                set.unsubListeners({ us_detailsByExp: us })
            }
        },
        async monitorUserExpenses () {
            console.log('store monitorUserExpenses')
            if (!state.unsubListeners.us_userExpenses) {
                const colRef = fb.getCollectionRefQuery('userExpenses', [{ field: 'idExp', op: '==', val: state.selExpense.id }])
                const us = fb.onSnapshot(colRef, (querySnapshot) => {
                    const docs = querySnapshot.docs
                    const res = docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    set.userExpenses(res)
                })
                set.unsubListeners({ us_userExpenses: us })
            }
        },
        async getExpenses () {
            const exps = await fb.getCollection('expenses')
            console.log('store getExpenses:', exps)
            set.expenses(exps)
            set.selExpense(exps[exps.length - 1])
        },
        async getPendingTickets () {
            const path = 'tickets'
            const tks = await fb.getCollectionFlex(path, { field: 'checked', val: false })
            console.log('store getPendingTickets:', tks)
            set.pendingTickets(tks)
        },
        async generateExpense () {
            // const pdfDefinition = await definePDF(state.detailsByExp)
            const pdfDefinition = {
                content: [
                    { text: 'Hola Mundo' }
                ]
            }
            const pdf = pdfSrv.generatePdf(pdfDefinition)
            pdf.open()
            // const base64 = await pdfSrv.generate(pdfDefinition)
            // console.log('base64 pdf:', base64)
            // const file = base64ToFile(base64, `ExpensaTN_${state.selExpense.id}.pdf`)
            // const folder = `expenses/${file.name}`
            // console.log('sto folder:', folder)
            // const url = await fb.uploadFile(file, folder)
            // return url
        },
        async updateExpense (o) {
            console.log('store updateExpense:', o)
            ui.actions.showLoading()
            await fb.setDocument('expenses', o, state.selExpense.id)
            ui.actions.hideLoading()
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
                    paid: 0,
                    balance: 0,
                    total: 0,
                    amount: 0,
                    totalOrdinary: 0,
                    amountOrdinary: 0,
                    totalExtraordinary: 0,
                    amountExtraordinary: 0,
                    created: new Date().getTime()
                }
                await fb.setDocument('expenses', o, id)
            }
        },
        async downloadExpense () {
            if (!state.selExpense) {
                const exp = await fb.getDocument('expenses', state.selUserExpense.idExp)
                set.selExpense(exp)
            }
            if (state.selExpense.pdfUrl) {
                window.open(state.selExpense.pdfUrl, 'blank')
            } else {
                ui.actions.notify('No existe el archivo de expensa!', 'error')
            }
        },
        async saveDetail (item) {
            await fb.setDocument('details', item, item.id)
        },
        sortExpenses (field, dir) {
            const arr = sortArray(state.expenses, field, dir)
            set.expenses(arr)
            set.activeCol(field)
        },
        sortDetails (field, dir) {
            const arr = sortArray(state.detailsByExp, field, dir)
            set.detailsByExp(arr)
            set.activeCol(field)
        },
        sortUserExpenses (field, dir) {
            const arr = sortArray(state.userExpenses, field, dir)
            set.userExpenses(arr)
            set.activeCol(field)
        }
    },
    unsubscribeListeners (key) {
        console.log('store unsubscribeListeners:', key)
        const unsub = state.unsubListeners[key]
        if (unsub) {
            unsub()
            delete state.unsubListeners[key]
            console.log('store set.unsubListeners:', state.unsubListeners)
        }
    },
    evalExpName (expId) {
        if (!expId) return
        const year = expId.substr(0, 2)
        const monthNum = expId.substr(2, 2)
        const month = state.myLocale.months[monthNum - 1]
        const expName = `${month} 20${year}`
        console.log('expId:', expId, 'expName:', expName)
        return expName
    },
    async getSettings () {
        console.log('store getSettings')
        const cfg = await fb.getDocument('settings', ENVIRONMENTS.lugar)
        set.settings(cfg)
    },
    async getUnits () {
        const units = await fb.getCollection('units')
        set.units(units)
    },
    async updateLoginInfoUnit (pwd) {
        console.log('store updateLoginInfoUnit')
        state.selUnit = { ...state.selUnit, pwd }
        ui.actions.showLoading()
        await fb.setDocument('units', state.selUnit, state.selUnit.id)
        ui.actions.hideLoading()
    },
    async login (unit, pwd) {
        if (state.selUnit.pwd === pwd) {
            console.log('login OK')
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
    },
    async moveData () {
        // const cfg = await fb.getDocument('tickets', 'terranostra')
        // await fb.setDocument('tn', cfg, 'settings')

        const res = await fb.getCollection('tickets')
        console.log('res:', res.length)
        for (const o of res) {
            o.isCont = (o.swContTerra === 'Contable')
            o.isExtra = (o.swOrdExtra === 'Extraordinaria')
            delete o.swContTerra
            delete o.swOrdExtra
            const moved = await fb.setDocument('tickets', o, o.id, { merge: false })
            console.log('id:', o.id)
        }
    }
}

export default {
    set,
    state: readonly(state),
    actions
}

function sortArray (arr, key, dir) {
    const res = arr.sort((a, b) => {
        if (a[key] > b[key]) return 1 * dir
        if (a[key] < b[key]) return -1 * dir
        return 0
    })
    return res
}
async function definePDF (definition) {
    return { content: [{ text: 'Hola Mundo' }] } // pdfGenerator
}
function base64ToFile (base64, filename) {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'application/pdf' })
    return new File([blob], filename, { type: 'application/pdf' })
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

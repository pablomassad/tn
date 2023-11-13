import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { LocalStorage } from 'quasar'
import { ENVIRONMENTS } from 'src/environments'
import moment from 'moment'

fb.initFirebase(ENVIRONMENTS.firebase)

const state = reactive({
    master: true,
    settings: undefined,
    path: undefined,
    units: undefined,
    selUnit: LocalStorage.getItem('TN_selUnit'),
    selExpense: undefined,
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
        console.log('store getSettings')
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
    expenses: {
        async getExpensesByUnit () {
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

            // Se modifica o crea el comprobante del propietario
            // Se actualiza o inserta el comprobante en la coleccion de comps
            // Si hubo modificacion del valor del amount, recalcula monto total de comps del propietario
            // Actualiza la coleccion Expensa del propietario con el total pagado de comps
            // Recalcula el monto total de pagos de todas las expensas de los propietarios para la Expensa en curso
            // Actualiza la coleccion Expensa global con el nuevo monto total de pagos de todos los propietarios
            fb.transaction(async (transaction) => {
                // Discrimino si inserto o modifico el comp
                const id = comp.id || new Date().getTime()
                const compRef = fb.getDocumentRef(`${state.path}/units/${state.selUnit.id}/expenses/${expId}/comps`, id)
                console.log('comp.amount:', comp.amount)

                let origAmount = 0
                if (comp.id) { // Modificacion de comp
                    const compSnapshot = await transaction.get(compRef)
                    origAmount = compSnapshot.data().amount
                    console.log('origAmout:', origAmount)
                }
                transaction.set(compRef, comp, { merge: true }) // { amount: origAmount })

                const expensaRef = fb.getDocumentRef(`${state.path}/units/${state.selUnit.id}/expenses`, expId)
                const expensaSnapshot = await transaction.get(expensaRef)
                const newTotal = expensaSnapshot.data().paid + comp.amount - origAmount
                console.log('newTotal:', newTotal)
                transaction.update(expensaRef, { paid: newTotal })

                const expGlobablRef = fb.getDocumentRef(`${state.path}/expenses`, expId)
                const expGlobalSnapshot = await transaction.get(expGlobablRef)
                const newExpTotal = expGlobalSnapshot.data().paid + comp.amount - origAmount
                console.log('newExpTotal:', newTotal)
                transaction.update(expensaRef, { paid: newExpTotal })
            }).then(() => {
                console.log('Transacción completada!')
                ui.actions.notify('Transacción completada!', 'success')
            }).catch((error) => {
                console.log('Transacción fallida: ', error)
                ui.actions.notify('Transacción fallida!', 'error')
            })
            ui.actions.hideLoading()
        },
        async removeComp (expId, comp) {
            console.log('store removeComp:', comp.id)
            ui.actions.showLoading()
            await fb.deleteDocument(`${state.path}/units/${state.selUnit.id}/expenses/${expId}/comps`, comp.id)
            ui.actions.hideLoading()
        }
    },
    tickets: {
        async getTicketsByUnit () {
            const path = `${state.path}/tickets`
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
            await fb.setDocument(`${state.path}/tickets`, tk, id)
            ui.actions.hideLoading()
        },
        async remove (tk) {
            console.log('store removeTicket:', tk.id)
            ui.actions.showLoading()
            await fb.deleteDocument(`${state.path}/tickets`, tk.id)
            ui.actions.hideLoading()
        }
    },
    admin: {
        async getExpenses () {
            const result = await fb.getCollection(`${state.path}/expenses`)
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

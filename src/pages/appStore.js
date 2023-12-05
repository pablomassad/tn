import { reactive, readonly } from 'vue'
import { ui } from 'fwk-q-ui'
import fb from 'fwk-q-firebase'
import { LocalStorage } from 'quasar'
import { ENVIRONMENTS } from 'src/environments'
import moment from 'moment'
import pdfSrv from 'fwk-pdf'

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
                    amount: 0,
                    amountOrdinary: 0,
                    amountExtraordinary: 0
                }
                await fb.setDocument('expenses', o, id)
            }
        },
        async downloadExpense () {
            const pdfDefinition = definePDF(state.detailsByExp)
            const base64 = await pdfSrv.generate(pdfDefinition)
            pdfSrv.download(`ExpTN_${state.selExpense.id}`, base64)
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
function definePDF (details) {
    // const def = {
    //    pageSize: 'A4',
    //    pageMargins: [30, 30, 30, 50],
    //    images: imagesGenerator(data.signature),
    //    compress: true,
    //    content: [{
    //        table: {
    //            widths: ['*', '*'],
    //            body: [
    //                ...headerGenerator(data.date, data.workOrderNum),
    //                [
    //                    {
    //                        border: [false, false, false, false],
    //                        text: '"Sres. Telecom Argentina S.A. Presente. De mi mayor consideración: Tengo el agrado de dirigirme a ustedes a los efectos de solicitarles el/los siguiente/s/ equipo/s para el/los servicio/s correspondientes conforme se detalla más abajo. En consecuencia, declaro y garantizo que Recibo en Comodato, por el período durante el cual se preste/n el/los Servicios, en entera conformidad y autorizo en forma expresa a Telecom Argentina S.A. (en adelante la "Empresa") a instalar el/los Equipo/s y sus adicionales, cuya propiedad pertenece a la Empresa, el/ los cual/cuales me es/son entregado/s y/o instalado/s en perfecto estado de conservación y funcionamiento, comprométiendome a utilizarlo/s exclusivamente para el/los Servicio/s que presta la Empresa, a saber:"',
    //                        colSpan: 2,
    //                        italics: true,
    //                        alignment: 'justify'
    //                    },
    //                    {}
    //                ],
    //                [
    //                    {
    //                        border: [false, false, false, false],
    //                        stack: [
    //                            {
    //                                table: {
    //                                    widths: ['*', 'auto'],
    //                                    body: accesories
    //                                }
    //                            }
    //                        ],
    //                        colSpan: 2
    //                    },
    //                    {}
    //                ],
    //                [
    //                    {
    //                        border: [false, false, false, false],
    //                        stack: [
    //                            { text: 'Equipos Instalados', bold: true },
    //                            { ul: installedEquipments }
    //                        ],
    //                        colSpan: 2
    //                    }
    //                ],
    //                [
    //                    {
    //                        border: [false, false, false, false],
    //                        text: '"La Empresa queda facultada a modificar o reemplazar en cualquier momento el Equipo instalado en mi domicilio previa comunicación y sin por ello exista compensación o reconocimiento alguno a mi favor. Cuento con una estructura eléctrica adecuada para la instalación del/de los Equipo/s quedando a mi exclusivo cargo el mantenimiento y conservación de la misma. Reconozco expresamente que la Empresa conserva la propiedad y posesión civil del/de los Equipo/s y que lo recibo en comodato, solamente con derecho de uso sin que ello implique la transferencia de derecho de propiedad alguno sobre el/los mismo/s a mi favor, debiendo devolver inmediatamente el/los Equipo/s en cualquier supuesto en que la Empresa finalice la prestación del/de los Servicio/s correspondiente/s, no teniendo en ningún caso y por ningún concepto derecho a retener el/los mismo/s. Acepto que la duración de la presente solicitud será mensual y se renovará sucesivamente y en forma automática por iguales períodos y que rige a partir de la fecha de instalación. El comodato del/de los equipo/s es/son accesorio/s de la prestación del/de los Servicio/s y, en consecuencia, la vigencia del comodato finalizará indefectiblemente con la finalización de la prestación del/de los mismo/s. Acepto el derecho de la Empresa a inhabilitar el/los Equipo/s ante cualquier de los siguientes supuestos: a) la falta de pago total o parcial de cualquiera de los Servicios por mi solicitados, b) el uso indebido del/de los Equipo/s, y c) el incumplimiento de mis obligaciones en relación a los Servicios prestados por la Empresa. Me obligo a mantener el/los Equipo/s en el estado de uso y conservación en que me es/son entregado/s, haciéndome responsable por los daños ocasionados por su uso indebido o por la falta de la debida diligencia en su conservación. Me obligo a utilizar el/los Equipo/s únicamente dentro del domicilio indicado en el formulario de instalación y en la factura (en caso de no mencionarse domicilio de instalación se tendrá por válido el de facturación), comprometiéndome a no ceder, transferir, distribuir, comercializar, ampliar, alterar, desactivar, retener ni trasladar el/los Equipo/s sin la autorización previa de la Empresa; declaro conocer que el incumplimiento de lo antedicho podría implicar la comisión, según fuera el caso, de alguno de los delitos contemplados en los artículos 162,164,172,173 incisos 2 y 9 y 183 del Código Penal, que contemplan penas de prisión de un mes a 6 años, o cualquier otro delito que se tipifique, resultando, asimismo, responsable ante la Empresa al tenor del artículo 1716 del Código Civil y Comercial de la Nación. Reconozco que la programación y contenidos que se incluyen a través de los Servicios se encuentran destinados al exclusivo uso hogareño y que dicha programación y contenidos se encuentran protegidos por la ley de propiedad intelectual, la ley de marcas y normativa concordante. Ante el incumplimiento total o parcial en el pago de las obligaciones a mi cargo en virtud de la prestación del/ de los Servicio/s o ante suspensión o cancelación por cualquier causa del/de los Servicio/s, me obligo irrevocablemente a restituir a la Empresa el/los Equipo/s en forma inmediata. Declaro conocer que las reparaciones en el/los Equipo/s únicamente podrán ser realizadas por los técnicos de la Empresa, y comprometo a no violar su precinto de seguridad ni a ocultar, borrar ni alterar la identificación del/de los mismo/s. A todo efecto declaro conocer que el valor total del/de los Equipo/s es/son el equivalente en pesos argentinos a la suma en dólares estadounidenses detallado a continuación, calculado al tipo de cambio vigente en la fecha de restitución o de facturación por los motivos previstos en el presente, según sea el caso:"',
    //                        colSpan: 2,
    //                        italics: true,
    //                        alignment: 'justify'
    //                    },
    //                    {}
    //                ],
    //                [
    //                    {
    //                        border: [false, false, false, false],
    //                        stack: [
    //                            { text: 'Lista de precios', bold: true },
    //                            { ul: accesoryPrices }
    //                        ],
    //                        colSpan: 2,
    //                        bold: true
    //                    },
    //                    {}
    //                ],
    //                [
    //                    {
    //                        border: [false, false, false, false],
    //                        text: '"Acepto que la cantidad, calidad y precios de comercialización de los Servicios que oportunamente brinde la Empresa a través de los Equipos podrán ser modificados por la Empresa en cualquier momento, previa comunicación. Asimismo, acepto el derecho de la Empresa a facturarmen las sumas correspondientes a gastos de instalación y/o activación de los Equipos y/o gastos de administración del comodato referido en la presente, según lo comunique la Empresa. Ante pérdida, robo, hurto, destrucción total o parcial o falta de restitución por cualquier causal del/de los Equipo/s o violación de su precinto de seguridad, o alteración de su identificación, acepto expresamente que la Empresa me facture el valor total del/de los Equipo/s previsto precedentemente, obligándome a pagarlo en el plazo de treinta (30) días contados desde la recepción del reclamo de la Empresa. Asimismo, si no restituyera el/los equipo/s a la Empresa, por cada día de demora, deberé abonar una multa equivalente al 5% del valor del/de los Equipo/s aceptado por el presente. Me obligo a notificar a la Empresa cualquier medida judicial o extrajudicial que afectare al/a los Equipo/s en el plazo de veinticuatro (24) horas de notificada o sucedida la misma, lo que primero tuviera lugar. La Empresa se compromete por medio de la presente a entregarle al Cliente un comprobante donde conste la efectiva devolución del/los Equipo/s siempre que no se corrobore en el/ellos destrucción total o parcial por cualquier causal o violación de su precinto de seguridad, o alteración de su identificación, etc, salvo el desgaste producido por el uso y paso del tiempo. Cualquier controversia derivada del presente será dirimida ante los Tribunales Ordinarios del domicilio de instalación. Declaro bajo juramento que los datos personales consignados al pie de la presente son verdaderos. La presente solicitud se considerará aceptada por la Empresa con la instalación del/de los Equipo/s en el domicilio de prestación del Servicio. Suscribo la presente en prueba de plena y expresa conformidad."',
    //                        colSpan: 2,
    //                        italics: true,
    //                        alignment: 'justify'
    //                    },
    //                    {}
    //                ],
    //                ...signatureGenerator(data.clarification, data.dniFirm, data.signature)
    //            ]
    //        },
    //        layout: {
    //            paddingBottom: (i, node) => 5
    //        }
    //    }],
    //    footer,
    //    styles: {
    //        subheader: {
    //            fontSize: 16,
    //            bold: true,
    //            margin: [0, 10, 0, 5]
    //        }
    //    }
    // }
    return null // def
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

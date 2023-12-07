import { headerGenerator } from 'src/shared/header'
import { signatureGenerator } from 'src/shared/signature'
import { footerGenerator as footer } from 'src/shared/footer'
import { imagesGenerator } from 'src/shared/images'

export const pdfGenerator = (data) => {
    console.log('PDF expense generator:', data)
    const accesories = ''
    const installedEquipments = data.installedEquipments.map(item => item.value)
    const accesoryPrices = [] // toRaw([...main.state.payload.precios])

    return new Promise(resolve => {
        resolve({
            pageSize: 'A4',
            pageMargins: [30, 30, 30, 50],
            images: imagesGenerator(data.signature),
            compress: true,
            content: [{
                table: {
                    widths: ['*', '*'],
                    body: [
                        ...headerGenerator(data.date, data.workOrderNum),
                        [
                            {
                                border: [false, false, false, false],
                                text: '"Sres. Telecom Argentina S.A. Presente. De mi mayor consideración: Tengo el agrado de dirigirme a ustedes a los efectos de solicitarles el/los siguiente/s/ equipo/s para el/los servicio/s correspondientes conforme se detalla más abajo. En consecuencia, declaro y garantizo que Recibo en Comodato, por el período durante el cual se preste/n el/los Servicios, en entera conformidad y autorizo en forma expresa a Telecom Argentina S.A. (en adelante la "Empresa") a instalar el/los Equipo/s y sus adicionales, cuya propiedad pertenece a la Empresa, el/ los cual/cuales me es/son entregado/s y/o instalado/s en perfecto estado de conservación y funcionamiento, comprométiendome a utilizarlo/s exclusivamente para el/los Servicio/s que presta la Empresa, a saber:"',
                                colSpan: 2,
                                italics: true,
                                alignment: 'justify'
                            },
                            {}
                        ],
                        [
                            {
                                border: [false, false, false, false],
                                stack: [
                                    {
                                        table: {
                                            widths: ['*', 'auto'],
                                            body: accesories
                                        }
                                    }
                                ],
                                colSpan: 2
                            },
                            {}
                        ],
                        [
                            {
                                border: [false, false, false, false],
                                stack: [
                                    { text: 'Equipos Instalados', bold: true },
                                    { ul: installedEquipments }
                                ],
                                colSpan: 2
                            }
                        ],
                        [
                            {
                                border: [false, false, false, false],
                                text: '"La Empresa queda facultada a modificar o reemplazar en cualquier momento el Equipo instalado en mi domicilio previa comunicación y sin por ello exista compensación o reconocimiento alguno a mi favor. Cuento con una estructura eléctrica adecuada para la instalación del/de los Equipo/s quedando a mi exclusivo cargo el mantenimiento y conservación de la misma. Reconozco expresamente que la Empresa conserva la propiedad y posesión civil del/de los Equipo/s y que lo recibo en comodato, solamente con derecho de uso sin que ello implique la transferencia de derecho de propiedad alguno sobre el/los mismo/s a mi favor, debiendo devolver inmediatamente el/los Equipo/s en cualquier supuesto en que la Empresa finalice la prestación del/de los Servicio/s correspondiente/s, no teniendo en ningún caso y por ningún concepto derecho a retener el/los mismo/s. Acepto que la duración de la presente solicitud será mensual y se renovará sucesivamente y en forma automática por iguales períodos y que rige a partir de la fecha de instalación. El comodato del/de los equipo/s es/son accesorio/s de la prestación del/de los Servicio/s y, en consecuencia, la vigencia del comodato finalizará indefectiblemente con la finalización de la prestación del/de los mismo/s. Acepto el derecho de la Empresa a inhabilitar el/los Equipo/s ante cualquier de los siguientes supuestos: a) la falta de pago total o parcial de cualquiera de los Servicios por mi solicitados, b) el uso indebido del/de los Equipo/s, y c) el incumplimiento de mis obligaciones en relación a los Servicios prestados por la Empresa. Me obligo a mantener el/los Equipo/s en el estado de uso y conservación en que me es/son entregado/s, haciéndome responsable por los daños ocasionados por su uso indebido o por la falta de la debida diligencia en su conservación. Me obligo a utilizar el/los Equipo/s únicamente dentro del domicilio indicado en el formulario de instalación y en la factura (en caso de no mencionarse domicilio de instalación se tendrá por válido el de facturación), comprometiéndome a no ceder, transferir, distribuir, comercializar, ampliar, alterar, desactivar, retener ni trasladar el/los Equipo/s sin la autorización previa de la Empresa; declaro conocer que el incumplimiento de lo antedicho podría implicar la comisión, según fuera el caso, de alguno de los delitos contemplados en los artículos 162,164,172,173 incisos 2 y 9 y 183 del Código Penal, que contemplan penas de prisión de un mes a 6 años, o cualquier otro delito que se tipifique, resultando, asimismo, responsable ante la Empresa al tenor del artículo 1716 del Código Civil y Comercial de la Nación. Reconozco que la programación y contenidos que se incluyen a través de los Servicios se encuentran destinados al exclusivo uso hogareño y que dicha programación y contenidos se encuentran protegidos por la ley de propiedad intelectual, la ley de marcas y normativa concordante. Ante el incumplimiento total o parcial en el pago de las obligaciones a mi cargo en virtud de la prestación del/ de los Servicio/s o ante suspensión o cancelación por cualquier causa del/de los Servicio/s, me obligo irrevocablemente a restituir a la Empresa el/los Equipo/s en forma inmediata. Declaro conocer que las reparaciones en el/los Equipo/s únicamente podrán ser realizadas por los técnicos de la Empresa, y comprometo a no violar su precinto de seguridad ni a ocultar, borrar ni alterar la identificación del/de los mismo/s. A todo efecto declaro conocer que el valor total del/de los Equipo/s es/son el equivalente en pesos argentinos a la suma en dólares estadounidenses detallado a continuación, calculado al tipo de cambio vigente en la fecha de restitución o de facturación por los motivos previstos en el presente, según sea el caso:"',
                                colSpan: 2,
                                italics: true,
                                alignment: 'justify'
                            },
                            {}
                        ],
                        [
                            {
                                border: [false, false, false, false],
                                stack: [
                                    { text: 'Lista de precios', bold: true },
                                    { ul: accesoryPrices }
                                ],
                                colSpan: 2,
                                bold: true
                            },
                            {}
                        ],
                        [
                            {
                                border: [false, false, false, false],
                                text: '"Acepto que la cantidad, calidad y precios de comercialización de los Servicios que oportunamente brinde la Empresa a través de los Equipos podrán ser modificados por la Empresa en cualquier momento, previa comunicación. Asimismo, acepto el derecho de la Empresa a facturarmen las sumas correspondientes a gastos de instalación y/o activación de los Equipos y/o gastos de administración del comodato referido en la presente, según lo comunique la Empresa. Ante pérdida, robo, hurto, destrucción total o parcial o falta de restitución por cualquier causal del/de los Equipo/s o violación de su precinto de seguridad, o alteración de su identificación, acepto expresamente que la Empresa me facture el valor total del/de los Equipo/s previsto precedentemente, obligándome a pagarlo en el plazo de treinta (30) días contados desde la recepción del reclamo de la Empresa. Asimismo, si no restituyera el/los equipo/s a la Empresa, por cada día de demora, deberé abonar una multa equivalente al 5% del valor del/de los Equipo/s aceptado por el presente. Me obligo a notificar a la Empresa cualquier medida judicial o extrajudicial que afectare al/a los Equipo/s en el plazo de veinticuatro (24) horas de notificada o sucedida la misma, lo que primero tuviera lugar. La Empresa se compromete por medio de la presente a entregarle al Cliente un comprobante donde conste la efectiva devolución del/los Equipo/s siempre que no se corrobore en el/ellos destrucción total o parcial por cualquier causal o violación de su precinto de seguridad, o alteración de su identificación, etc, salvo el desgaste producido por el uso y paso del tiempo. Cualquier controversia derivada del presente será dirimida ante los Tribunales Ordinarios del domicilio de instalación. Declaro bajo juramento que los datos personales consignados al pie de la presente son verdaderos. La presente solicitud se considerará aceptada por la Empresa con la instalación del/de los Equipo/s en el domicilio de prestación del Servicio. Suscribo la presente en prueba de plena y expresa conformidad."',
                                colSpan: 2,
                                italics: true,
                                alignment: 'justify'
                            },
                            {}
                        ],
                        ...signatureGenerator(data.clarification, data.dniFirm, data.signature)
                    ]
                },
                layout: {
                    paddingBottom: (i, node) => 5
                }
            }],
            footer,
            styles: {
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 5]
                }
            }
        })
    })
}

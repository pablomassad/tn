export const signatureGenerator = (clarification, dni, sigPreview) => {
    const def = [
        [
            {
                border: [false, false, false, false],
                text: 'Datos del cliente o responsable en domicilio',
                bold: true,
                alignment: 'center',
                colSpan: 2
            },
            {}
        ],
        [
            {
                border: [false, false, false, false],
                text: [
                    {
                        text: 'Aclaración del firmante: ',
                        bold: true
                    },
                    {
                        text: clarification
                    }
                ],
                colSpan: 2
            },
            {}
        ],
        [
            {
                border: [false, false, false, false],
                text: [
                    {
                        text: 'DNI del firmante: ',
                        bold: true
                    },
                    {
                        text: dni
                    }
                ],
                colSpan: 2
            },
            {}
        ]
    ]

    if (sigPreview) {
        def.splice(1, 0, [
            {
                border: [false, false, false, false],
                stack: [
                    {
                        text: 'FIRMA: ',
                        bold: true
                    },
                    {
                        image: 'signature',
                        fit: [300, 100],
                        margin: [50, -10, 0, 5]
                    }
                ],
                colSpan: 2
            },
            {}
        ])
    }

    return def
}

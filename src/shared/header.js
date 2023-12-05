export const headerGenerator = (date, expName) => {
    return [
        [
            {
                border: [false, false, false, false],
                text: 'TERRANOSTRA',
                colSpan: 2,
                alignment: 'center',
                bold: true
            },
            {}
        ],
        [
            {
                border: [false, false, false, false],
                alignment: 'left',
                text: [
                    {
                        text: 'Fecha: ',
                        bold: true
                    },
                    { text: date }
                ]
            },
            {
                border: [false, false, false, false],
                alignment: 'right',
                text: [
                    {
                        text: 'Expensa: ',
                        bold: true
                    },
                    { text: expName }
                ]
            }
        ]
    ]
}

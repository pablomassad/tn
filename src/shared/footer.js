import globalStore from 'src/store'

export const footerGenerator = (currentPage, pageCount) => {
    console.log('footerGenerator CONSTRUCTOR.......')

    globalStore.actions.setDocData(globalStore.state.currentDoc, {}, { cantidadPaginas: pageCount })

    return {
        columns: [
            {},
            {
                image: 'terranostra',
                alignment: 'center',
                fit: [50, 50]
            },
            {
                text: currentPage,
                alignment: 'right',
                fontSize: 10,
                margin: [20, 20, 32, 0]
            }
        ]
    }
}

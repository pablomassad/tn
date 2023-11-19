import { main } from 'fwk-q-main'
import Admin from 'src/pages/admin/index.vue'
import Details from 'src/pages/admin/details/index.vue'
import UserExpense from 'src/pages/userExpense/index.vue'
import Tickets from 'src/pages/tickets/index.vue'
import Login from 'src/pages/login/index.vue'

const routes = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '/admin', component: Admin },
            { path: '/admin/details', component: Details },
            { path: '/userExpense', component: UserExpense },
            { path: '/tickets', component: Tickets }
        ]
    },
    { path: '/login', component: Login },
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/Error404.vue')
    }
]
main.actions.initBeforeRoutes(routes[0].children)
export default routes

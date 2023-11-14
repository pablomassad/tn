import { main } from 'fwk-q-main'
import Admin from '../pages/admin/index.vue'
import Expense from '../pages/expense/index.vue'
import UserExpense from '../pages/userExpense/index.vue'
import Tickets from '../pages/tickets/index.vue'
import Login from '../pages/login/index.vue'

const routes = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '/admin', component: Admin },
            { path: '/expense', component: Expense },
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

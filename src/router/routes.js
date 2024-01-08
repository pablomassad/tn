import { main } from 'fwk-q-main'
import Admin from 'src/pages/admin/index.vue'
import Monitor from 'src/pages/admin/monitor/index.vue'
import UserExpenses from 'src/pages/userExpenses/index.vue'
import Reports from 'src/pages/reports/index.vue'
import Tickets from 'src/pages/admin/tickets/index.vue'
import Recurrents from 'src/pages/recurrents/index.vue'
import Login from 'src/pages/login/index.vue'

const routes = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '/admin', component: Admin },
            { path: '/admin/tickets', component: Tickets },
            { path: '/admin/monitor', component: Monitor },
            { path: '/reports', component: Reports },
            { path: '/userExpenses', component: UserExpenses }
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

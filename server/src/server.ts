import Fastify from 'fastify'
import cors from '@fastify/cors'
import {appRoutes} from './routes'

const app = Fastify()

app.register(cors)
app.register(appRoutes)

app.listen({
    port: 3333,
    host: '192.168.1.5'//faz com que o servidor pegue sempre o IP local da sua máquina
}).then(() => {
    console.log('HTTP Server running!')
})
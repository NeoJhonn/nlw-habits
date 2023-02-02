import dayjs from 'dayjs'
import { FastifyInstance } from 'fastify'
import { prisma } from './lib/prisma'
import { z } from 'zod'


export async function appRoutes(app: FastifyInstance) {
    /**
     * Método HTTP: Get, Post(criar), Put(atualizar), Patch(atualizar informação específica), Delete
     */

    app.post('/habits', async (request) => {
        //validado dados de entrada com o zod
        const createHabitBody = z.object({
            title: z.string(),//do tipo string
            weekDays: z.array(
                z.number().min(0).max(6)
            ),//to tipo array de números
        })

        const { title, weekDays } = createHabitBody.parse(request.body)

        const today = dayjs().startOf('day').toDate()

        await prisma.habit.create({
            data: {
                title,
                created_at: today,
                weekDays: {
                    create: weekDays.map(weekDay => {//percorre o array para selecionar o dia
                        return {
                            week_day: weekDay,
                        }

                    })
                }
            }
        })

    })

    app.get('/day', async (request) => {
        const getDayParams = z.object({
            date: z.coerce.date()//já converte os string do frontend em tipo Date
        })

        const { date } = getDayParams.parse(request.query)

        const parsedDate = dayjs(date).startOf('day')
        const weekDay = parsedDate.get('day')

        //todos hábitos possíveis
        //hábitos que já foram completados

        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date,
                },
                weekDays: {
                    some: {
                        week_day: weekDay,
                    }
                }
            }
        })

        const day = await prisma.day.findFirst({
            where: {
                date: parsedDate.toDate(),
            },
            include: {
                dayHabits: true,
            }
        })

        const completedHabits = day?.dayHabits.map(dayHabit => {
            return dayHabit.habit_id
        }) ?? []

        return {
            possibleHabits,
            completedHabits,
        }
    })

    //completar e não completar um hábito
    app.patch('/habits/:id/toggle', async (request) => {
        //:id = parâmetro de identificação(route param)

        const toggleHabitsParams = z.object({
            id: z.string().uuid(),
        })

        const { id } = toggleHabitsParams.parse(request.params)

        const today = dayjs().startOf('day').toDate()

        let day = await prisma.day.findUnique({
            where: {
                date: today,
            }
        })

        if (!day) {
            day = await prisma.day.create({
                data: {
                    date: today,
                }
            })
        }

        const dayHabit = await prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id,
                }
            }

        })

        //remover marcação de completo no checkbox
        if (dayHabit) {
            await prisma.dayHabit.delete({
                where: {
                    id: dayHabit.id,
                }
            })
        } else {
            //completar o hábito neste dia
            await prisma.dayHabit.create({
                data: {
                    day_id: day.id,
                    habit_id: id,
                }
            })
        }
    })

    app.get('/summary', async () => {
        //Query mais complexa, mais condições, relacionamentos => SQL na mão(Raw)
        //Prisma ORM: Raw SQL => SQlite

        const summary = await prisma.$queryRaw`
            SELECT 
                D.id, 
                D.date,
                (
                    SELECT 
                        cast(count(*) as float)
                    FROM day_Habits DH
                    WHERE DH.day_id = D.id
                ) as completed,
                (
                    SELECT 
                        cast(count(*) as float)
                    FROM habit_week_days HWD
                    JOIN habits H
                        ON H.id = HWD.habit_id
                    WHERE
                        HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
                        AND H.created_at <= D.date
                ) as amount
            FROM days D
        `
        return summary
    })
}



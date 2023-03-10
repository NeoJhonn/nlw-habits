import { Check } from "phosphor-react";
import * as Checkbox from '@radix-ui/react-checkbox'
import { FormEvent, useState } from "react";
import { api } from "../lib/axios";

const availableWeekDays = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
]

export function NewHabitForm() {
    //variáveis que serão monitoradas pela função useState, capturando os dados
    //digitados no formulário
    const [title, setTitle] = useState('')
    const [weekDays, setWeekDays] = useState<number[]>([])

    //função que vai criar um novo hábito no banco de dados
    async function createNewHabit(event: FormEvent) {
        //impede que a pagina atualize após o envio do formulário
        event.preventDefault()
        
        if(!title || weekDays.length === 0){
            return
        }

        await api.post('habits', {
            title,
            weekDays,
        })

        setTitle('')
        setWeekDays([])

        alert('Hábito criado com sucesso!')
    }

    function handleToggleWeekDay(weekDay: number) {
        if(weekDays.includes(weekDay)){
            const weekDaysWithRemovedOne = weekDays.filter(day => day != weekDay)
            //seta o novo array sem o dia que quero remover
            setWeekDays(weekDaysWithRemovedOne)
        } else {
            // "..." = spread operator, desembrulha e pega os dados 
            //de um array para uma variável 
            const weekDaysWithAddedOne = [...weekDays, weekDay]
            //seta o novo array com o dia que quero adicionar
            setWeekDays(weekDaysWithAddedOne)
        }
    }


    return (
        <form onSubmit={createNewHabit} className="w-full flex flex-col mt-6">
            <label htmlFor="title" className="font-semibold leading-tight">
                Qual seu comprometimento?
            </label>
            <input 
            type="text" 
            id="title"
            placeholder="ex: Exercícios, dormir bem, etc..."
            className="p-4 rounded-lg mt-3 bg-zinc-700 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
            autoFocus
            value={title}
            onChange={event => setTitle(event.target.value)}
            />

            <label htmlFor="" className="font-semibold leading-tight mt-4">
                Qual a recorrência?
            </label>

            <div className="flex flex-col gap-2 mt-3">
                {/* fução map() percorre o array availableWeekDays e mostra no frontend os dias da semana */}
                {availableWeekDays.map((weekDay, index) => {
                    return (
                        <Checkbox.Root 
                            key={weekDay} 
                            className="flex items-center gap-3 group focus:outline-none"
                            checked={weekDays.includes(index)}
                            onCheckedChange={() => handleToggleWeekDay(index)}
                        >
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-700 border-2 border-zinc-600 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors group-focus:ring-2 group-focus:ring-violet-600 group-focus:ring-offset-2 group-focus:ring-offset-zinc-900">
                                <Checkbox.Indicator>
                                    <Check size={20} className="text-white" />
                                </Checkbox.Indicator>
                            </div>

                            <span className="text-white leading-tight">
                                {weekDay}
                            </span>
                        </Checkbox.Root>
                    )
                })}
                

            </div>

            <button 
            type="submit" 
            className="mt-6 rounded-lg p-4 flex items-center justify-center font-semibold bg-gray-600 hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-background"
            >
                <Check size={20} weight="bold" className="mr-3"/>
                Confirmar
            </button>

            

        </form>
    )
}
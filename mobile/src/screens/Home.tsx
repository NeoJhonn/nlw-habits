import { View, Text, ScrollView, Alert } from "react-native";
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { HabitDay, DAY_SIZE } from "../components/HabitDay";
import { Header } from "../components/Header";
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning'
import { api } from "../lib/axios"
import { useState, useCallback } from "react";
import { Loading } from "../components/Loading";
import dayjs from "dayjs";


const weekDays = ['D', 'S' ,'T' ,'Q' ,'Q' ,'S' ,'S']
const datesFromYearStart = generateDatesFromYearBeginning()
const minimumSumaryDatesSizes = 18 * 5
const amountOfDaysToFill = minimumSumaryDatesSizes - datesFromYearStart.length  

//faze a tipagem de Summary
type SummaryProps = Array<{
    id: string
    date: string
    amount: number
    completed: number
}>

export function Home() {
    /////fazendo a conexão com o backend(banco de dados)////////////////
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState<SummaryProps>([])
    


    const { navigate } = useNavigation()

    async function fetchData() {
        try {
            setLoading(true)
            const response = await api.get("/summary");
            setSummary(response.data) 
        } catch (error) {
            Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos!')
            console.log(error)
        } finally {
            setLoading(false)
        }

        
    
    }

    useFocusEffect(useCallback (() => {
        fetchData()
    }, []))
    
    //se ainda está buscando dados no backend mostra animação do componente <Loding />
    if(loading) {
        return (
            <Loading />
        )
    }
    /////fazendo a conexão com o backend(banco de dados)////////////////
    return (
        <View className="flex-1 bg-zinc-600 px-8 pt-16">
            <Header />

            <View className="flex-row mt-6 mb-2">
                {
                   weekDays.map((weekDay, i) => (
                    <Text 
                    key={`${weekDay}-${i}`}
                    className="text-zinc-100 text-xl font-bold text-center mx-1"
                    style={{width: DAY_SIZE}}
                    >
                        {weekDay}

                    </Text>
                   ))
                }
            </View>
            

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 100}}
            >
                {
                    summary && //só vai ser execultado caso o summary nessa null
                    <View className="flex-row flex-wrap">
                        {/* Quadradinhos que receberão dados do backend com o hábitos */}
                        {
                            datesFromYearStart.map(date => {
                                const dayWithHabits = summary.find(day => {
                                    return dayjs(date).isSame(day.date, 'day')
                                })
                                
                                return (
                                    <HabitDay
                                    key={date.toISOString()}
                                    date={date}
                                    amountOfHabits={dayWithHabits?.amount} 
                                    amountCompleted={dayWithHabits?.completed}
                                    onPress={() => navigate('habit',{ date: date.toISOString() })}
                                    /> 
                                )
                            })
                        }

                        {/* Quadradinhos placeholder, só para preencherem a tela */}
                        {
                            amountOfDaysToFill > 0 && Array
                            .from({length: amountOfDaysToFill})
                            .map((_,i) => (
                                <View
                                    className="bg-gray-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                                    style={{width: DAY_SIZE, height: DAY_SIZE}}
                                    key={i} 
                                />
                            ))
                        }
                    </View>
                }    
            </ScrollView>

            

        </View>
    )
}
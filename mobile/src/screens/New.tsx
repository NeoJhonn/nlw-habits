import { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { BackButton } from "../components/BackButton";
import { CheckBox } from "../components/CheckBox";
import { Feather } from '@expo/vector-icons'
import colors from 'tailwindcss/colors'
import { api } from "../lib/axios";

const availableWeekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado' ]

export function New() {
    const [title, setTitle] = useState('')
    const [weekDays, setWeekDays] = useState<number[]>([])

    function handleToggleWeekDay(weekDayIndex: number) {
        if(weekDays.includes(weekDayIndex)){
            setWeekDays(prevState => prevState.filter(weekDay => weekDay !== weekDayIndex))

        } else {
            setWeekDays(prevState => [...prevState, weekDayIndex])
        }
    }

    //função que irá adicionar um novo hábito no banco de dados pleo backend
    async function handleCreateNewHabit() {
        try {//o trim() tira o espaço do input
            if(!title.trim() || weekDays.length === 0){
               return Alert.alert('Novo Hábito', 'Informe o nome do hábito e escolha a periodicidade.')
            }
            
            await api.post('/habits', { title, weekDays })
            //limpa campos
            setTitle('')
            setWeekDays([])

            Alert.alert('Novo Hábito', 'Hábito criado com sucesso!')

        } catch (error) {
            console.log(error)
            Alert.alert('Ops', 'Não possível criar o novo hábito')
        }
    }

    return (
        <View className="flex-1 bg-zinc-600 px-8 pt-16">
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                >

                <BackButton />

                <Text className="mt-6 text-white font-extrabold text-3xl">
                    Criar hábito
                </Text>

                <Text className="mt-6 text-white font-semibold text-base">
                    Qual o seu comprometimento?
                </Text>

                <TextInput 
                    className="h-14 pl-4 rounded-lg mt-3 bg-zinc-800 text-white border-2 border-zinc-800 focus:border-green-600"
                    placeholder="Exercícios, dormir bem, etc..."
                    placeholderTextColor={colors.zinc[400]}
                    onChangeText={setTitle}
                    value={title}

                />

                <Text className="font-semibold mt-4 mb-3 text-white text-base">
                    Qual a recorrência?
                </Text>

                {
                    availableWeekDays.map((weekDay, index) => (
                        <CheckBox
                            key={weekDay} 
                            title={weekDay}
                            checked={weekDays.includes(index)}
                            onPress={() => handleToggleWeekDay(index)}
                        />

                    ))
                }

                <TouchableOpacity
                    className="w-full h-14 flex-row items-center justify-center bg-slate-400 rounded-lg mt-6"
                    activeOpacity={0.7}
                    onPress={handleCreateNewHabit}
                >
                    <Feather 
                        name="check"
                        size={20}
                        color={colors.white}
                    />

                    <Text className="font-semibold text-base text-white ml-2">
                        Confirmar
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}
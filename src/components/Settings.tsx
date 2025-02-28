import { VStack, Button, Stack, Switch, Text } from '@chakra-ui/react'
import { FetchIqamaTimes, FetchAndStorePrayerTimes, LoadItem, StoreItem } from '../toolsfn'
import { useEffect, useState } from 'react'

interface props {
    GoTo: (where: string) => void
}

function Settings({ GoTo }: props) {
    const [isRamadan, setIsRamadan] = useState(false)
    useEffect(() => {
        const asfn = async () => {
            const stored_ramadan_value = await LoadItem("ramadan");
            if (stored_ramadan_value === "yes") setIsRamadan(true)
        }
        asfn()
    })

    const handleSwitch = async () => {
        if (isRamadan) {
            setIsRamadan(false)
            await StoreItem("ramadan", "no")
        } else {
            setIsRamadan(true)
            await StoreItem("ramadan", "yes")

        }
    }
    return (
        <VStack justifyContent={"center"} gap={"1vw"} alignItems={"center"} padding={"0.5rem"} height={"100%"} width={"100vw"}>
            <Button
                onClick={async () => await FetchIqamaTimes()}
            >
                Iqama Zeiten aktualisieren
            </Button>
            <Button
                onClick={async () => await FetchAndStorePrayerTimes()}
            >
                Gebetszeiten des Jahres aktualisieren
            </Button>
            <Button
                onClick={() => GoTo("hadith")}
            >
                Hadith
            </Button>
            <Button
                onClick={() => GoTo("events")}
            >
                Veranstaltungen
            </Button>
            <Stack border={"1px solid lightgray"} padding={5} borderRadius={10} align='center' direction='row'>
                <Text fontWeight={"bold"}>Ramadan</Text>
                <Switch onChange={handleSwitch} isChecked={isRamadan} size='lg' />
            </Stack>
        </VStack>
    )
}

export default Settings
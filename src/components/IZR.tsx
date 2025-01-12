import { HStack, VStack, Image } from "@chakra-ui/react";
import logo from "./imgs/IZRLOGONOBG.png";
import IText from "./IText";
import { FetchIqamaTimes, FetchAndStorePrayerTimes } from "../toolsfn";
import ios from "./imgs/ios.png";
import andy from "./imgs/andy.png";
import izr from "./imgs/izr.png";

interface props {
  GoTo: (what: string) => void;
}

export function IZR({ GoTo }: props) {
  return (
    <HStack
      style={{
        background: "white",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
        borderRadius: "1rem",
        width: "100%",
        justifyContent: "space-between",

      }}

    >
      <HStack>
        <Image src={logo} boxSize="4vw" objectFit="contain"></Image>
        <Image boxSize="5vw" objectFit="contain" src={izr}></Image>
        <VStack
          gap={0}
          alignItems={"left"}
          borderLeft={"1px solid lightgrey"}
          padding={"1rem"}
        >
          <IText
            style={{
              fontSize: "1.2vw",
              color: "black",
              transition: "ease 2s",
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            Islamisches Zentrum Regensburg e.V
          </IText>
          <IText
            style={{
              fontSize: "1.5vw",
              color: "black",
              transition: "ease 2s",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ISLAM IST LEBEN
          </IText>
        </VStack>
      </HStack>
      <VStack gap={0} alignItems={"left"} padding={"1rem"}>
        <IText
          style={{
            fontSize: "1.5vw",
            color: "black",
            transition: "ease 2s",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          IBAN DE30 7505 0000 0026 7651 56
        </IText>{" "}
        <IText
          style={{
            fontSize: "1.5vw",
            color: "black",
            transition: "ease 2s",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          Infos unter : www.iz-regensburg.de
        </IText>
      </VStack>
      <HStack>
        <IText
          style={{
            fontSize: "1.5vw",
            color: "black",
            transition: "ease 2s",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          IZR APP
        </IText>
        <Image boxSize="5vw" objectFit="contain" src={ios}></Image>
        <Image boxSize="5vw" objectFit="contain" src={andy}></Image>
      </HStack>

      <VStack gap={0} alignItems={"left"} padding={"0.5rem"} height={"100%"}>
        <button
          onClick={async () => await FetchIqamaTimes()}
          style={{ fontSize: 10 }}
        >
          Iqama Zeiten aktualisieren
        </button>
        <button
          onClick={async () => await FetchAndStorePrayerTimes()}
          style={{ fontSize: 10 }}
        >
          Gebetszeiten des Jahres aktualisieren
        </button>
        <button
          onClick={() => GoTo("hadith")}
          style={{ fontSize: 10 }}
        >
          Hadith
        </button>
        <button
          onClick={() => GoTo("events")}
          style={{ fontSize: 10 }}
        >
          Veranstaltungen
        </button>
        <button
          onClick={() => GoTo("werbung")}
          style={{ fontSize: 10 }}
        >
          Werbung
        </button>
      </VStack>
    </HStack>
  );
}

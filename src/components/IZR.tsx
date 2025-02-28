import { HStack, VStack, Image } from "@chakra-ui/react";
import logo from "./imgs/izr_logo.png";
import IText from "./IText";
import ios from "./imgs/ios.png";
import andy from "./imgs/andy.png";
import izr from "./imgs/izr.png";
import { IoSettingsOutline } from "react-icons/io5";


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
        padding: 10
      }}

    >
      <HStack>
        <Image src={logo} boxSize="7vw" objectFit="contain"></Image>
        <Image boxSize="5vw" objectFit="contain" src={izr}></Image>
        <VStack
          gap={0}
          alignItems={"left"}
          borderLeft={"1px solid lightgrey"}
          padding={"1rem"}
        >
          <IText
            style={{
              fontSize: "1vw",
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
              fontSize: "1vw",
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
            fontSize: "1vw",
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
            fontSize: "1vw",
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
            fontSize: "1vw",
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
        <IoSettingsOutline onClick={() => GoTo("settings")} size={"2vw"} cursor={"pointer"} />
      </HStack>

    </HStack>
  );
}

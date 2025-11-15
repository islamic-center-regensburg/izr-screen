import axios from "axios";
import { useEffect, useState } from "react";
import "react-slideshow-image/dist/styles.css";
import { izr_server } from "./config";
import IText from "./components/IText";
import Slide from "./components/Slide";
import shiny from "/Wave.svg";
interface props {
  onEnd: () => void;
}

function HadithSlider({ onEnd }: props) {
  const [Hadith, setHadith] = useState<[{ hadith: string; data: string }]>([
    { hadith: "", data: "" },
  ]);

  useEffect(() => {
    setTimeout(() => {
      onEnd();
    }, 40000);
  }, []);

  useEffect(() => {
    const asfn = async () => {
      await axios.get(izr_server + "/hadith").then((response) => {
        const hadith = [];

        console.log(response.data);
        hadith.push({
          hadith: response.data.hadith_ar,
          data: response.data.data_ar,
        });
        hadith.push({
          hadith: response.data.hadith_de,
          data: response.data.data_de,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setHadith(hadith as any);
        console.log(hadith);
      });
    };
    asfn();
  }, []);

  return (
    <div
      style={{ backgroundImage: `url(${shiny})` }}
      className="h-screen w-full bg-cover font-bold"
    >
      <Slide interval={20000} onEnd={onEnd}>
        {Hadith &&
          Hadith.map((hadith) => (
            <div
              className=""
              style={{
                height: "100vh",
                // width: "100vw",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "1vw",
              }}            >
              <IText
                style={{
                  fontSize: "3vw",
                  textAlign: "center",
                  direction: "rtl",
                  color: "white",
                  background: "rgb(255,255,255,0.1)",
                  padding: "5vw",
                  borderRadius: "5vw",
                }}
                lang={hadith.data === Hadith[0].data ? "ar" : "de"}
              >
                {hadith.hadith}
                <br />
                {hadith.data}
              </IText>
            </div>
          ))}
      </Slide>
    </div>
  );
}

export default HadithSlider;

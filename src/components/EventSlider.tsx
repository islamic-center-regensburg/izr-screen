/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import axios from "axios";
import { useEffect, useState } from "react";
import { izr_server } from "../config";
import "react-slideshow-image/dist/styles.css";
import Slide from "./Slide";
import { HStack, Image } from "@chakra-ui/react";

interface Props {
  onEnd: () => void;
}

interface Event {
  de: string;
  en: string;
  ar: string;
}
function EventSlider({ onEnd }: Props) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get<{ events: { flyer: string; flyer_ar: string; flyer_en: string }[] }>(
          izr_server + "/getEvents/all"
        );

        // Correct mapping of events
        const eventUrls: Event[] = response.data.events.map((event) => ({
          de: event.flyer,
          en: event.flyer_en,
          ar: event.flyer_ar,
        }));

        console.log(eventUrls);
        setEvents(eventUrls);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);


  return (
    <Slide interval={10000} onEnd={onEnd}>
      {events.map((event, index) => (
        < HStack overflow={"hidden"} padding={1} key={index}>
          <Image
            width={"33%"}
            src={event.de}
            alt={`Event ${index + 1}`}
            style={{
              borderRadius: "20px",
              boxShadow: "0px 0px 10px 4px lightgrey",
              border: "5px solid darkgreen"
            }}
          />
          <Image
            width={"33%"}
            key={index}
            src={event.en}
            alt={`Event ${index + 1}`}
            style={{
              borderRadius: "20px",
              boxShadow: "0px 0px 10px 4px lightgrey",
              border: "5px solid darkgreen"
            }}
          />
          <Image
            width={"33%"}
            src={event.ar}
            alt={`Event ${index + 1}`}
            style={{
              borderRadius: "20px",
              boxShadow: "0px 0px 10px 4px lightgrey",
              border: "5px solid darkgreen"
            }}
          />
        </HStack>
      ))
      }
    </Slide >
  );
}

export default EventSlider;

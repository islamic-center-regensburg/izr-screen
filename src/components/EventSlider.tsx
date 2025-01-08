/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import axios from "axios";
import { useEffect, useState } from "react";
import { izr_server } from "../config";
import "react-slideshow-image/dist/styles.css";
import Slide from "./Slide";
import { Image } from "@chakra-ui/react";

interface Props {
  onEnd: () => void;
}

function EventSlider({ onEnd }: Props) {
  const [events, setEvents] = useState([""]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get<{ events: [{ flyerTV: string }] }>(
          izr_server + "/getEvents/all"
        );
        const eventUrls = response.data.events.map((event) => event.flyerTV);
        // Add default images at the end
        eventUrls.push(
          "https://izr-cloud.online/media/gallery_images/APPFlyer.png",
          "https://izr-cloud.online/media/gallery_images/IZRFlyer.png"
        );
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
      {events.map((slideImage, index) => (
        <Image
          key={index}
          src={slideImage}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover", // or 'cover' for a full bleed effect
            borderRadius: "20px",
            boxShadow: "0px 0px 10px 4px lightgrey",
          }}
        />
      ))}
    </Slide>
  );
}

export default EventSlider;

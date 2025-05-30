import { VStack } from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";

interface SlideProps {
  children: ReactNode[];
  interval: number; // Time in milliseconds
  onEnd?: () => void;
}

function Slide({ children, interval, onEnd }: SlideProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex === children.length) {
          clearInterval(slideInterval);
          if (onEnd) onEnd();
          return prevIndex; // Stop at the last index
        }
        return nextIndex;
      });
    }, interval);

    return () => clearInterval(slideInterval); // Cleanup interval on component unmount
  }, [children.length, interval, onEnd]);

  return (
    <VStack height={"100%"} width={"100vw"} justifyContent={"center"} alignItems={"center"} padding={"1rem"}>
      {children[currentIndex]}
    </VStack>
  );
}

export default Slide;

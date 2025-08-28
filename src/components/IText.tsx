import clsx from "clsx";
import { Text } from "@chakra-ui/react"; // or your own Text component

interface props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  lang?: "de" | "ar";
  className?: string;
}

const IText = ({ children, style, lang = "de" }: props) => {
  const langClass = lang === "ar" ? "font-ar" : "font-de"; // default to German stack

  return (
    <Text
      style={style}
      className={clsx("font-formatted", langClass)}
      // If you want RTL direction for Arabic text, uncomment:
      // dir={lang === "ar" ? "rtl" : "ltr"}
      // lang attribute helps screen readers and browsers:
      lang={lang}
    >
      {children}
    </Text>
  );
};

export default IText;

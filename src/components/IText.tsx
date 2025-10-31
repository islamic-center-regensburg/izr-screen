import clsx from "clsx";

interface props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  lang?: "de" | "ar";
  className?: string;
}

const IText = ({ children, style, lang = "de" }: props) => {
  const langClass = lang === "ar" ? "font-ar" : "font-de"; // default to German stack

  return (
    <p style={style} className={clsx("font-formatted", langClass)}>
      {children}
    </p>
  );
};

export default IText;

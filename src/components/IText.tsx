import React, { CSSProperties } from "react";
import styles from "./styles/common.module.css";
import { Text } from "@chakra-ui/react";

interface props {
  children: React.ReactNode;
  style?: CSSProperties;
}

const IText = ({ children, style }: props) => {
  return (
    <Text style={style} className={styles["font-formatted"]}>
      {children}
    </Text>
  );
};

export default IText;

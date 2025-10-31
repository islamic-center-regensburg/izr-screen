interface props {
  children: React.ReactNode;
}

const Fade = ({ children }: props) => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
};

export default Fade;

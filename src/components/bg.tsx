import islamic_bg from "/islamic-bg.svg";

function Bg({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative min-h-screen w-full bg-[#f0fdfa]">
			{/* Mint Fresh Breeze Background */}
			<div
				className="pointer-events-none absolute inset-0 z-0"
				style={{
					background: "#ffffff",
					backgroundImage: `
                    radial-gradient(
                    circle at top center,
                    rgba(56, 193, 182, 0.5),
                    transparent 70%
                    )
                `,
					filter: "blur(80px)",
					backgroundRepeat: "no-repeat",
				}}
			/>

			{/* Central Transparent Gradient */}
			<div
				className="pointer-events-none absolute inset-0 z-0"
				style={{
					backgroundImage: `
                    radial-gradient(
                    circle at center,
                    rgba(56, 193, 182, 0.25) 0%,
                    rgba(56, 193, 182, 0.1) 35%,
                    transparent 70%
                    )
                `,
					filter: "blur(60px)",
				}}
			/>

			<img
				src={islamic_bg}
				alt="Islamic Background"
				className="pointer-events-none absolute right-0 bottom-0 z-0 h-auto w-full md:w-1/2 object-contain"
			/>
			<img
				src={islamic_bg}
				alt="Islamic Background"
				className="pointer-events-none absolute left-0 top-0 rotate-180 z-0 h-auto w-1/2 md:w-1/3 object-contain"
			/>
			<div className="relative z-10">{children}</div>
		</div>
	);
}

export default Bg;

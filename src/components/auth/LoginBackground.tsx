export default function LoginBackground() {
    return (
        <>
            <div className="absolute inset-0 overflow-hidden z-[-1]">
                <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

                <div className="absolute bottom-[-140px] right-[-100px] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />

                <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
            </div>
        </>
    );
}
export default function LoginHeader() {
    return (
        <div className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-emerald-500 to-green-600 text-2xl font-bold text-white shadow-lg shadow-emerald-500/30">
                N
            </div>

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Welcome Back
                </h1>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Login to Nectar Admin Dashboard
                </p>
            </div>
        </div>
    );
}
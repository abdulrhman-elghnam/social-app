import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Compass } from "lucide-react";
import { ShareIcon } from "@/assets/icons/share-icon";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
            <div className="flex items-center gap-2.5 mb-8">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl text-white shadow-md shadow-blue-500/20">
                    <ShareIcon size={24} />
                </div>
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    SocialSphere
                </span>
            </div>

            <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                    <Compass className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-1">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight block">
                        404
                    </span>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        Page Not Found
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                <div className="pt-2">
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-10 gap-2 shadow-sm shadow-blue-500/20">
                        <Link to="/feed">
                            <Home className="w-4 h-4" />
                            <span>Return to Feed</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mt-8 text-xs text-slate-400">
                © 2026 SocialSphere. All rights reserved.
            </div>
        </div>
    );
}

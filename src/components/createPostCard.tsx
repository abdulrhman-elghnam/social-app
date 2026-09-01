import { useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Globe,
    Image as ImageIcon,
    Smile,
    Send,
    X,
    Loader2,
} from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/api/Posts.API";
import { toast } from "sonner";

const feelings = [
    { emoji: "😃", label: "Happy" },
    { emoji: "🚀", label: "Excited" },
    { emoji: "💡", label: "Inspired" },
    { emoji: "☕", label: "Relaxed" },
    { emoji: "🔥", label: "Productive" },
    { emoji: "🎉", label: "Celebrating" },
    { emoji: "🍕", label: "Foodie" },
    { emoji: "💻", label: "Coding" },
];

export default function CreatePostCard() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const [postText, setPostText] = useState("");
    const [selectedFeeling, setSelectedFeeling] = useState<{ emoji: string; label: string } | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const name = user?.name || "User";
    const photo = user?.photo || "";
    const firstName = name.split(" ")[0];

    const mutation = useMutation({
        mutationFn: async () => {
            let fullText = postText.trim();
            if (selectedFeeling) {
                fullText = `${fullText} — feeling ${selectedFeeling.emoji} ${selectedFeeling.label}`;
            }

            if (selectedFile) {
                const formData = new FormData();
                if (fullText) formData.append("body", fullText);
                formData.append("image", selectedFile);
                return createPost(formData);
            }
            return createPost({ body: fullText });
        },
        onMutate: () => {
            toast.loading("Publishing post...", { id: "post-toast" });
        },
        onSuccess: () => {
            toast.success("Post published successfully!", { id: "post-toast" });
            setPostText("");
            setSelectedFeeling(null);
            removeImage();
            queryClient.invalidateQueries({ queryKey: ["allPosts"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts"] });
            queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || "Failed to publish post";
            toast.error(msg, { id: "post-toast" });
        },
    });

    const handleImageClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image file is too large (max 10MB)");
                return;
            }
            setSelectedImage(URL.createObjectURL(file));
            setSelectedFile(file);
        }
    };

    const removeImage = () => {
        if (selectedImage) URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePost = () => {
        if (!postText.trim() && !selectedFile && !selectedFeeling) return;
        mutation.mutate();
    };

    const canPost = (postText.trim().length > 0 || !!selectedFile || !!selectedFeeling) && !mutation.isPending;

    return (
        <Card className="w-full border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden transition-all">
            <CardContent className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700 shadow-xs">
                            <AvatarImage src={photo} alt={name} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm">
                                {name.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{name}</span>

                            <span className="flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                <Globe className="w-3 h-3 text-blue-500" /> Public post
                            </span>
                        </div>
                    </div>

                    {/* Feeling badge if selected */}
                    {selectedFeeling && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-full text-xs font-semibold text-amber-800 dark:text-amber-300">
                            <span>{selectedFeeling.emoji}</span>
                            <span>feeling {selectedFeeling.label}</span>
                            <button onClick={() => setSelectedFeeling(null)} className="hover:opacity-70 ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Textarea container */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 mb-3.5 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/40 focus-within:bg-white dark:focus-within:bg-slate-950">
                    <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder={`What's on your mind, ${firstName}?`}
                        disabled={mutation.isPending}
                        rows={3}
                        className="w-full p-3.5 bg-transparent resize-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm sm:text-base disabled:opacity-60"
                    />

                    {/* Image Preview Container */}
                    {selectedImage && (
                        <div className="px-3 pb-3">
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 max-h-[320px] flex items-center justify-center group">
                                <img
                                    src={selectedImage}
                                    alt="Post attachment"
                                    className="w-full max-h-[320px] object-contain rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2.5 right-2.5 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-all shadow-md cursor-pointer hover:scale-105"
                                    aria-label="Remove image"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <Separator className="mb-3.5 dark:bg-slate-800" />

                {/* Footer Toolbar */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 rounded-xl h-9 px-3 text-xs font-semibold"
                            onClick={handleImageClick}
                            disabled={mutation.isPending}
                        >
                            <ImageIcon className="w-4 h-4 text-emerald-500" />
                            <span className="hidden sm:inline">Photo</span>
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />

                        {/* Feeling Picker Popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 rounded-xl h-9 px-3 text-xs font-semibold"
                                    disabled={mutation.isPending}
                                >
                                    <Smile className="w-4 h-4 text-amber-500" />
                                    <span className="hidden sm:inline">Feeling</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-64 p-2 rounded-2xl shadow-xl border-slate-200 dark:border-slate-800">
                                <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">How are you feeling?</p>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    {feelings.map((f) => (
                                        <button
                                            key={f.label}
                                            type="button"
                                            onClick={() => setSelectedFeeling(f)}
                                            className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                                        >
                                            <span className="text-base">{f.emoji}</span>
                                            <span>{f.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handlePost}
                        disabled={!canPost}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-5 h-9 font-bold text-xs gap-1.5 shadow-sm shadow-blue-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Posting...</span>
                            </>
                        ) : (
                            <>
                                <span>Post</span>
                                <Send className="w-3.5 h-3.5" />
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

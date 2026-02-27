import { useState, useRef } from "react"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Globe, Image as ImageIcon, Smile, Send, ChevronDown, X, Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPost } from "@/api123/Posts.API"
import { toast, Toaster } from "sonner"
import axios from "axios"

export default function CreatePostCard() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    const [postText, setPostText] = useState("")
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const currentUser = (user as any)?.user || user as any
    const name = currentUser?.name || "User"
    const photo = currentUser?.photo || ""
    const firstName = name.split(" ")[0]

    const mutation = useMutation({
        mutationFn: async () => {
            if (selectedFile) {
                // POST with image → multipart/form-data
                const formData = new FormData()
                if (postText.trim()) formData.append("body", postText.trim())
                formData.append("image", selectedFile)
                return createPost(formData)
            } else {
                // POST without image → send plain JSON (avoids empty FormData issues)
                const { useAuthStore: s } = await import("@/store/authStore")
                const token = s.getState().token
                const url = import.meta.env.VITE_API_URL || "https://route-posts.routemisr.com"
                return axios.post(
                    `${url}/posts`,
                    { body: postText.trim() },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                )
            }
        },
        onMutate: () => {
            toast.loading("Publishing post...", { id: "post-toast" })
        },
        onSuccess: () => {
            toast.success("Post published!", { id: "post-toast" })
            setPostText("")
            removeImage()
            // Refresh two possible query keys (getAllPosts or homeFeed)
            queryClient.invalidateQueries({ queryKey: ["allPosts"] })
            queryClient.invalidateQueries({ queryKey: ["homeFeed"] })
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || "Something went wrong"
            toast.error(msg, { id: "post-toast" })
            console.error("Create post error:", err)
        },
    })

    const handleImageClick = () => fileInputRef.current?.click()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(URL.createObjectURL(file))
            setSelectedFile(file)
        }
    }

    const removeImage = () => {
        if (selectedImage) URL.revokeObjectURL(selectedImage)
        setSelectedImage(null)
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handlePost = () => {
        if (!postText.trim() && !selectedFile) return
        mutation.mutate()
    }

    const canPost = (postText.trim().length > 0 || !!selectedFile) && !mutation.isPending

    return (
        <>
            <Toaster richColors />
            <Card className="w-full border-none shadow-md overflow-hidden bg-white dark:bg-zinc-950">
                <CardContent className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-10 h-10 border">
                            <AvatarImage src={photo} alt={name} />
                            <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">{name}</span>
                            <div className="flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md w-max text-xs font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <Globe className="w-3 h-3" />
                                <span>Public</span>
                                <ChevronDown className="w-3 h-3 ml-0.5" />
                            </div>
                        </div>
                    </div>

                    {/* Textarea */}
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 mb-4 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50">
                        <textarea
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder={`Hello ${firstName}, what's on your mind?`}
                            disabled={mutation.isPending}
                            className="w-full min-h-[110px] p-3 sm:p-4 bg-transparent resize-none outline-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 text-sm sm:text-base disabled:opacity-60"
                        />

                        {/* Image Preview */}
                        {selectedImage && (
                            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                                <div className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 group">
                                    <img
                                        src={selectedImage}
                                        alt="Attachment preview"
                                        className="max-h-[280px] w-full object-contain"
                                    />
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1.5 bg-zinc-900/70 hover:bg-zinc-900/90 text-white rounded-full transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator className="mb-4 dark:bg-zinc-800" />

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                className="text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 rounded-lg"
                                onClick={handleImageClick}
                                disabled={mutation.isPending}
                            >
                                <ImageIcon className="w-5 h-5 text-green-500" />
                                <span className="font-medium">Photo/Video</span>
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*,video/*"
                                className="hidden"
                            />

                            <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                className="text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 rounded-lg"
                                disabled={mutation.isPending}
                            >
                                <Smile className="w-5 h-5 text-yellow-500" />
                                <span className="font-medium">Feeling</span>
                            </Button>
                        </div>

                        <Button
                            onClick={handlePost}
                            disabled={!canPost}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-5 font-semibold gap-2 shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    Post
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

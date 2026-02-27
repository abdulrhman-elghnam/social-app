import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserPostsById } from '@/api123/Posts.API';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, LayoutList, Globe } from 'lucide-react';
import PageLayout from '@/components/layout/pageLayout';
import PostItem from '@/components/PostItem';
import { useAuthStore } from '@/store/authStore';

export default function UserProfile() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const currentUserId = (currentUser as any)?.user?._id || (currentUser as any)?._id;

    // Redirect to own profile if visiting own userId
    useEffect(() => {
        if (userId && userId === currentUserId) {
            navigate('/Profile', { replace: true });
        }
    }, [userId, currentUserId, navigate]);

    // Fetch this user's posts
    const { data: postsData, isLoading: loadingPosts } = useQuery({
        queryKey: ['userPostsById', userId],
        queryFn: () => getUserPostsById(userId!, { limit: 30 }),
        enabled: !!userId,
    });

    // Fetch user info from their posts (author embedded)
    const rawPosts = postsData?.data;
    const posts: any[] =
        rawPosts?.posts ||
        rawPosts?.data?.posts ||
        (Array.isArray(rawPosts?.data) ? rawPosts.data : []) ||
        (Array.isArray(rawPosts) ? rawPosts : []) ||
        [];

    // Grab user info from first post's author field
    const author = posts[0]?.user || null;
    const authorName = author?.name || 'User';
    const authorPhoto = author?.photo || '';

    return (
        <PageLayout className="max-w-3xl mx-auto pb-16">
            {/* Back button */}
            <div className="mb-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="gap-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full px-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>

            {/* User header */}
            <div className="flex items-center gap-4 p-6 bg-white dark:bg-zinc-950 rounded-2xl shadow-md mb-6">
                <Avatar className="w-16 h-16 border-2 border-blue-100 dark:border-zinc-800">
                    <AvatarImage src={authorPhoto} alt={authorName} />
                    <AvatarFallback className="text-2xl font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        {authorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{authorName}</h1>
                    <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <Globe className="w-3.5 h-3.5" />
                        Public posts
                    </p>
                </div>
            </div>

            {/* Posts */}
            {loadingPosts ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-sm font-medium">Loading posts...</span>
                </div>
            ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
                    <div className="p-5 rounded-full bg-zinc-100 dark:bg-zinc-900">
                        <LayoutList className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-sm font-medium text-zinc-500">No public posts yet.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {posts.map((post: any) => (
                        <PostItem key={post._id || post.id} post={post} />
                    ))}
                </div>
            )}
        </PageLayout>
    );
}
